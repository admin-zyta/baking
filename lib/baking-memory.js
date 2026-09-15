'use strict';

const fs = require('fs');
const path = require('path');
const { homeDir, readConfig } = require('./config');

const DEFAULT_DIR = path.join(homeDir(), '.cursor', 'baking', 'memory');
const DEFAULT_DB = 'baking-memory.db';
const JSONL_FALLBACK = 'observations.jsonl';

function memoryConfig() {
  const cfg = readConfig();
  const mem = cfg?.lightStack?.memory || {};
  const dir = (mem.globalDir || '~/.cursor/baking/memory')
    .replace(/^~\//, homeDir() + path.sep)
    .replace(/\//g, path.sep);
  const dbFile = mem.dbFile || DEFAULT_DB;
  return {
    provider: mem.provider || 'baking',
    dir,
    dbPath: path.join(dir, dbFile),
    jsonlPath: path.join(dir, JSONL_FALLBACK),
  };
}

function openSqlite(dbPath) {
  const { DatabaseSync } = require('node:sqlite');
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const db = new DatabaseSync(dbPath);
  db.exec(`
    CREATE TABLE IF NOT EXISTS obs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ts TEXT NOT NULL,
      topic_key TEXT,
      title TEXT NOT NULL,
      type TEXT DEFAULT 'decision',
      body TEXT NOT NULL,
      project TEXT,
      source TEXT DEFAULT 'cli'
    );
    CREATE VIRTUAL TABLE IF NOT EXISTS obs_fts USING fts5(
      topic_key, title, body, content='obs', content_rowid='id'
    );
    CREATE TRIGGER IF NOT EXISTS obs_ai AFTER INSERT ON obs BEGIN
      INSERT INTO obs_fts(rowid, topic_key, title, body)
      VALUES (new.id, new.topic_key, new.title, new.body);
    END;
    CREATE TRIGGER IF NOT EXISTS obs_ad AFTER DELETE ON obs BEGIN
      INSERT INTO obs_fts(obs_fts, rowid, topic_key, title, body)
      VALUES ('delete', old.id, old.topic_key, old.title, old.body);
    END;
    CREATE TRIGGER IF NOT EXISTS obs_au AFTER UPDATE ON obs BEGIN
      INSERT INTO obs_fts(obs_fts, rowid, topic_key, title, body)
      VALUES ('delete', old.id, old.topic_key, old.title, old.body);
      INSERT INTO obs_fts(rowid, topic_key, title, body)
      VALUES (new.id, new.topic_key, new.title, new.body);
    END;
  `);
  return { mode: 'sqlite', db };
}

function appendJsonl(jsonlPath, row) {
  fs.mkdirSync(path.dirname(jsonlPath), { recursive: true });
  fs.appendFileSync(jsonlPath, JSON.stringify(row) + '\n', 'utf8');
}

function readJsonl(jsonlPath) {
  if (!fs.existsSync(jsonlPath)) return [];
  return fs
    .readFileSync(jsonlPath, 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line, i) => {
      try {
        return JSON.parse(line);
      } catch (err) {
        throw new Error(`Invalid JSONL line ${i + 1}: ${err.message}`);
      }
    });
}

function scoreRow(row, terms) {
  const hay = `${row.topic_key || ''} ${row.title || ''} ${row.body || ''}`.toLowerCase();
  let score = 0;
  for (const t of terms) {
    if (hay.includes(t)) score += t.length > 3 ? 2 : 1;
  }
  return score;
}

function openStore() {
  const cfg = memoryConfig();
  try {
    return { ...openSqlite(cfg.dbPath), cfg };
  } catch {
    return { mode: 'jsonl', cfg };
  }
}

function saveObservation(input) {
  const { topic_key, title, body, type, project, source } = input;
  if (!title || !body) {
    throw new Error('title and body are required');
  }
  const store = openStore();
  const row = {
    ts: new Date().toISOString(),
    topic_key: topic_key || null,
    title: String(title).slice(0, 500),
    type: type || 'decision',
    body: String(body).slice(0, 8000),
    project: project || null,
    source: source || 'cli',
  };

  if (store.mode === 'sqlite') {
    const stmt = store.db.prepare(
      `INSERT INTO obs (ts, topic_key, title, type, body, project, source)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    );
    const info = stmt.run(
      row.ts,
      row.topic_key,
      row.title,
      row.type,
      row.body,
      row.project,
      row.source
    );
    return { ok: true, id: Number(info.lastInsertRowid), mode: 'sqlite', path: store.cfg.dbPath };
  }

  appendJsonl(store.cfg.jsonlPath, row);
  return { ok: true, mode: 'jsonl', path: store.cfg.jsonlPath };
}

function searchObservations(query, limit = 5) {
  const store = openStore();
  const q = String(query || '').trim();
  if (!q) return { hits: [], mode: store.mode };

  if (store.mode === 'sqlite') {
    const ftsQuery = q
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => `"${w.replace(/"/g, '""')}"`)
      .join(' OR ');
    const stmt = store.db.prepare(
      `SELECT o.id, o.ts, o.topic_key, o.title, o.type, o.body, o.project, o.source
       FROM obs_fts f
       JOIN obs o ON o.id = f.rowid
       WHERE obs_fts MATCH ?
       ORDER BY rank
       LIMIT ?`
    );
    const hits = stmt.all(ftsQuery, limit);
    return { hits, mode: 'sqlite', path: store.cfg.dbPath };
  }

  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  const hits = readJsonl(store.cfg.jsonlPath)
    .map((row) => ({ row, score: scoreRow(row, terms) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.row);
  return { hits, mode: 'jsonl', path: store.cfg.jsonlPath };
}

function contextObservations(query, limit = 5) {
  const store = openStore();
  const recent = [];

  if (store.mode === 'sqlite') {
    const stmt = store.db.prepare(
      `SELECT id, ts, topic_key, title, type, body, project, source
       FROM obs ORDER BY id DESC LIMIT ?`
    );
    recent.push(...stmt.all(Math.min(3, limit)));
  } else {
    recent.push(...readJsonl(store.cfg.jsonlPath).slice(-3));
  }

  const searched = query ? searchObservations(query, limit).hits : [];
  const seen = new Set();
  const merged = [];
  for (const row of [...searched, ...recent]) {
    const key = row.id || `${row.ts}-${row.title}`;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(row);
    if (merged.length >= limit) break;
  }
  return { hits: merged, mode: store.mode, path: store.cfg.dbPath || store.cfg.jsonlPath };
}

function memoryStatus() {
  const cfg = memoryConfig();
  const store = openStore();
  if (store.mode === 'sqlite') {
    const count = store.db.prepare('SELECT COUNT(*) AS n FROM obs').get();
    return {
      provider: cfg.provider,
      mode: 'sqlite',
      path: cfg.dbPath,
      count: count.n,
      ok: true,
    };
  }
  const rows = readJsonl(cfg.jsonlPath);
  return {
    provider: cfg.provider,
    mode: 'jsonl',
    path: cfg.jsonlPath,
    count: rows.length,
    ok: true,
    note: 'node:sqlite unavailable — using JSONL fallback',
  };
}

function formatHits(hits) {
  return hits.map((h) => ({
    id: h.id,
    ts: h.ts,
    topic_key: h.topic_key,
    title: h.title,
    type: h.type,
    project: h.project,
    body: h.body.length > 400 ? h.body.slice(0, 400) + '…' : h.body,
  }));
}

module.exports = {
  memoryConfig,
  saveObservation,
  searchObservations,
  contextObservations,
  memoryStatus,
  formatHits,
};

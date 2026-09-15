'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

function homeDir() {
  return process.env.USERPROFILE || os.homedir();
}

function expandHome(p) {
  if (p.startsWith('~/')) return path.join(homeDir(), p.slice(2));
  return p;
}

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  const block = match[1];
  const out = {};
  for (const line of block.split(/\r?\n/)) {
    const m = line.match(/^([a-zA-Z0-9_-]+):\s*(.+)$/);
    if (m) out[m[1]] = m[2].trim().replace(/^['"]|['"]$/g, '');
  }
  return out;
}

function findSkillFiles(roots) {
  const files = [];
  for (const root of roots) {
    if (!fs.existsSync(root)) continue;
    walk(root, files);
  }
  return files;
}

function walk(dir, acc) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === 'node_modules' || e.name === '.git') continue;
      walk(full, acc);
    } else if (e.isFile() && e.name === 'SKILL.md') {
      acc.push(full);
    }
  }
}

function buildRegistry(options = {}) {
  const home = homeDir();
  const roots = [
    path.join(home, '.cursor', 'skills'),
    path.join(home, '.cursor', 'skills-cursor'),
    path.join(home, '.claude', 'skills'),
  ];
  const outPath = expandHome(
    options.outPath || path.join(home, '.cursor', 'baking', 'skill-registry.md')
  );

  const skillFiles = findSkillFiles(roots);
  const rows = [];

  for (const file of skillFiles) {
    let content;
    try {
      content = fs.readFileSync(file, 'utf8');
    } catch {
      continue;
    }
    const fm = parseFrontmatter(content);
    const name = fm.name || path.basename(path.dirname(file));
    const description = fm.description || '—';
    rows.push({ name, description, path: file.replace(/\\/g, '/') });
  }

  rows.sort((a, b) => a.name.localeCompare(b.name));

  const lines = [
    '# Baking — skill registry (auto)',
    '',
    `Generado: ${new Date().toISOString()}`,
    '',
    'Uso ligero: matchear pedido → leer **solo** el SKILL.md indicado. Refresh: `baking skill-registry`.',
    '',
    '| Skill | Descripción | Path |',
    '|-------|-------------|------|',
  ];

  for (const r of rows) {
    const desc = r.description.replace(/\|/g, '\\|').slice(0, 120);
    lines.push(`| \`${r.name}\` | ${desc} | \`${r.path}\` |`);
  }

  lines.push('');
  lines.push(`Total: ${rows.length} skills`);
  lines.push('');

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, lines.join('\n'), 'utf8');

  return { path: outPath, count: rows.length, skills: rows };
}

function registryStatus(registryPath) {
  const p = expandHome(registryPath || path.join(homeDir(), '.cursor', 'baking', 'skill-registry.md'));
  if (!fs.existsSync(p)) {
    return { ok: false, path: p, ageHours: null, count: 0 };
  }
  const stat = fs.statSync(p);
  const ageMs = Date.now() - stat.mtimeMs;
  const content = fs.readFileSync(p, 'utf8');
  const countMatch = content.match(/Total:\s*(\d+)/);
  return {
    ok: true,
    path: p,
    ageHours: Math.round(ageMs / 3600000),
    count: countMatch ? parseInt(countMatch[1], 10) : null,
  };
}

module.exports = { buildRegistry, registryStatus, expandHome, homeDir };

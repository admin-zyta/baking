'use strict';

const fs = require('fs');
const path = require('path');
const { readConfig } = require('./config');

const DEFAULT_MARKER = '.cursor/baking/required.json';

function markerPath(cwd = process.cwd()) {
  const config = readConfig();
  const rel = config?.projectRequired?.markerFile || DEFAULT_MARKER;
  return path.join(path.resolve(cwd), rel);
}

function readMarker(cwd) {
  const file = markerPath(cwd);
  if (!fs.existsSync(file)) {
    return { ok: false, file, required: false };
  }
  try {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    return {
      ok: true,
      file,
      required: data.bakingRequired === true,
      data,
    };
  } catch (err) {
    return { ok: false, file, required: false, error: err.message };
  }
}

function projectRequiredStatus(cwd = process.cwd()) {
  const marker = readMarker(cwd);
  return {
    markerFile: marker.file,
    bakingRequired: marker.required,
    marker: marker.data || null,
    error: marker.error || null,
  };
}

function setProjectRequired(on, cwd = process.cwd()) {
  const file = markerPath(cwd);
  const dir = path.dirname(file);
  if (!on) {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
    }
    return { bakingRequired: false, markerFile: file, removed: true };
  }
  fs.mkdirSync(dir, { recursive: true });
  const payload = {
    bakingRequired: true,
    createdAt: new Date().toISOString(),
    note: 'Implementation in this repo must use Baking-AI (ROUTER + handoff). Q&A may gate-out.',
  };
  fs.writeFileSync(file, JSON.stringify(payload, null, 2) + '\n', 'utf8');
  return { bakingRequired: true, markerFile: file, data: payload };
}

module.exports = { projectRequiredStatus, setProjectRequired, markerPath, readMarker };

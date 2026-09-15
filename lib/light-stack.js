'use strict';

const fs = require('fs');
const path = require('path');
const { registryStatus, homeDir } = require('./skill-registry');
const { readConfig: readConfigFile } = require('./config');

function readConfig() {
  return readConfigFile();
}

function fileContainsEngram(filePath) {
  if (!fs.existsSync(filePath)) return false;
  try {
    return fs.readFileSync(filePath, 'utf8').toLowerCase().includes('engram');
  } catch {
    return false;
  }
}

function checkEngramMcp() {
  const home = homeDir();
  const paths = [
    { label: 'Cursor mcp.json', path: path.join(home, '.cursor', 'mcp.json') },
    { label: 'Claude settings.json', path: path.join(home, '.claude', 'settings.json') },
  ];

  const hits = paths.filter((p) => fileContainsEngram(p.path));
  if (hits.length > 0) {
    return {
      ok: true,
      hint: `Engram in: ${hits.map((h) => h.label).join(', ')}`,
    };
  }

  return {
    ok: false,
    hint:
      'Engram not detected — Cursor: engram setup cursor · Claude: engram plugin/MCP (github.com/Gentleman-Programming/engram)',
  };
}

function lightStackReport() {
  const config = readConfig();
  const ls = config?.lightStack;
  const enabled = ls?.enabled === true;
  const regPath =
    ls?.skillRegistry?.globalPath?.replace(/^~\//, homeDir() + '/').replace(/\//g, path.sep) ||
    path.join(homeDir(), '.cursor', 'baking', 'skill-registry.md');
  const reg = registryStatus(regPath);
  const engram = checkEngramMcp();
  const maxAge = ls?.skillRegistry?.refreshMaxAgeHours ?? 168;
  const regStale = reg.ok && reg.ageHours !== null && reg.ageHours > maxAge;

  return {
    enabled,
    config: ls || null,
    engram,
    skillRegistry: { ...reg, stale: regStale, maxAgeHours: maxAge },
  };
}

module.exports = { lightStackReport, checkEngramMcp, readConfig };

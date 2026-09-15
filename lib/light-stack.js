'use strict';

const fs = require('fs');
const path = require('path');
const { registryStatus, homeDir } = require('./skill-registry');
const { readConfig: readConfigFile } = require('./config');
const { memoryStatus } = require('./baking-memory');

function readConfig() {
  return readConfigFile();
}

function lightStackReport() {
  const config = readConfig();
  const ls = config?.lightStack;
  const enabled = ls?.enabled === true;
  const provider = ls?.memory?.provider || 'none';
  const regPath =
    ls?.skillRegistry?.globalPath?.replace(/^~\//, homeDir() + '/').replace(/\//g, path.sep) ||
    path.join(homeDir(), '.cursor', 'baking', 'skill-registry.md');
  const reg = registryStatus(regPath);
  const maxAge = ls?.skillRegistry?.refreshMaxAgeHours ?? 168;
  const regStale = reg.ok && reg.ageHours !== null && reg.ageHours > maxAge;

  let bakingMemory = null;
  if (provider === 'baking') {
    try {
      const st = memoryStatus();
      bakingMemory = { ...st, ok: st.count > 0 || fs.existsSync(st.path) };
    } catch (err) {
      bakingMemory = { ok: false, error: err.message };
    }
  }

  return {
    enabled,
    config: ls || null,
    memoryProvider: provider,
    bakingMemory,
    skillRegistry: { ...reg, stale: regStale, maxAgeHours: maxAge },
  };
}

module.exports = { lightStackReport, readConfig };

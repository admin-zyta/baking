'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

const PACKAGE_ROOT = path.resolve(__dirname, '..');

const CONFIG_FILES = [
  'VERSION',
  'CHANGELOG.md',
  'README.md',
  'config.json',
  'config.schema.json',
  'ROUTER.md',
  'BAKING-CURSOR.md',
  'METRICS.md',
  'metrics.schema.json',
  'consumption.md',
  'creative-brief-bar.md',
  'AGENTS.md',
  'claude-code/BAKING.md',
];

function homeDir() {
  return process.env.USERPROFILE || os.homedir();
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function copyFile(src, dest) {
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
}

function copyTree(src, destRoot) {
  if (!fs.existsSync(src)) {
    throw new Error(`Missing source tree: ${src}`);
  }
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(destRoot, entry.name);
    if (entry.isDirectory()) {
      copyTree(srcPath, destPath);
    } else if (entry.isFile()) {
      copyFile(srcPath, destPath);
    }
  }
}

function backupIfExists(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const backup = `${filePath}.bak`;
  fs.copyFileSync(filePath, backup);
  return backup;
}

function readVersion() {
  return fs.readFileSync(path.join(PACKAGE_ROOT, 'VERSION'), 'utf8').trim();
}

function install(options = {}) {
  const home = homeDir();
  const cursorRoot = path.join(home, '.cursor');
  const claudeRoot = path.join(home, '.claude');
  const configRoot = path.join(cursorRoot, 'opus-sonnet');
  const version = readVersion();

  const cursorSrc = path.join(PACKAGE_ROOT, 'global', 'cursor');
  const claudeSrc = path.join(PACKAGE_ROOT, 'global', 'claude');

  ensureDir(configRoot);

  const configDest = path.join(configRoot, 'config.json');
  let configSkipped = false;

  for (const rel of CONFIG_FILES) {
    const src = path.join(PACKAGE_ROOT, rel);
    if (!fs.existsSync(src)) continue;
    const dest = path.join(configRoot, rel.replace(/\//g, path.sep));

    if (rel === 'config.json' && fs.existsSync(dest) && !options.forceConfig) {
      configSkipped = true;
      continue;
    }

    if (rel === 'config.json' && fs.existsSync(dest) && options.forceConfig) {
      backupIfExists(dest);
    }

    copyFile(src, dest);
  }

  copyTree(cursorSrc, cursorRoot);
  copyTree(claudeSrc, claudeRoot);

  return {
    version,
    home,
    cursorRoot,
    claudeRoot,
    configRoot,
    configSkipped,
  };
}

module.exports = { install, readVersion, PACKAGE_ROOT };

#!/usr/bin/env node
'use strict';

const { install, readVersion } = require('../lib/install');

const HELP = `
@boogiepop/baking — orquestador planner → executor (Cursor + Claude Code)

Usage:
  baking install [--force-config]   Deploy skills, agents, rules, config global
  baking sync                       Alias de install
  baking version                    Show installed package version

Examples:
  npx @boogiepop/baking install
  npm i -g @boogiepop/baking && baking install

Destinos:
  ~/.cursor/skills/baking/          Skill Cursor
  ~/.cursor/agents/                 Subagentes Cursor
  ~/.cursor/rules/                  Gate router
  ~/.cursor/opus-sonnet/            Config + docs
  ~/.claude/skills/ + agents/       Claude Code
`;

function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  const forceConfig = rest.includes('--force-config');

  if (!cmd || cmd === 'help' || cmd === '-h' || cmd === '--help') {
    process.stdout.write(HELP);
    process.exit(0);
  }

  if (cmd === 'version' || cmd === '-v') {
    console.log(readVersion());
    process.exit(0);
  }

  if (cmd === 'install' || cmd === 'sync') {
    try {
      const result = install({ forceConfig });
      console.log(`Baking ${result.version} — installed`);
      console.log(`  Cursor:  ${result.cursorRoot}`);
      console.log(`  Claude:  ${result.claudeRoot}`);
      console.log(`  Config:  ${result.configRoot}`);
      if (result.configSkipped) {
        console.log('  Note: config.json existente — no reemplazado (usa --force-config)');
      }
      console.log('');
      console.log('Uso: /baking o "usemos baking para …"');
      console.log('Perfil: editar ~/.cursor/opus-sonnet/config.json');
      process.exit(0);
    } catch (err) {
      console.error(`baking install failed: ${err.message}`);
      process.exit(1);
    }
  }

  console.error(`Unknown command: ${cmd}`);
  process.stdout.write(HELP);
  process.exit(1);
}

main();

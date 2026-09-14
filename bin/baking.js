#!/usr/bin/env node
'use strict';

const { install, readVersion } = require('../lib/install');
const { doctor, listInstalledAgents } = require('../lib/doctor');
const { summarize, formatReport } = require('../lib/metrics-summary');
const path = require('path');

const HELP = `
@boogiepop/baking — orquestador planner → executor (Cursor + Claude Code)

Usage:
  baking install [--force-config]   Deploy skills, agents, rules, config global
  baking sync                       Alias de install
  baking doctor                     Verificar agentes en ~/.cursor y ~/.claude
  baking metrics-summary [path]     Resumen routing + costo (runs.jsonl)
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

  if (cmd === 'doctor') {
    const report = doctor();
    console.log(`Baking ${report.version} — doctor`);
    console.log('');
    console.log('Cursor (~/.cursor/agents/):');
    for (const a of report.cursor) {
      console.log(`  ${a.ok ? 'OK' : 'MISSING'}  ${a.file}`);
    }
    console.log('');
    console.log('Claude Code (~/.claude/agents/):');
    for (const a of report.claude) {
      console.log(`  ${a.ok ? 'OK' : 'MISSING'}  ${a.file}`);
    }
    console.log('');
    console.log(`  config.json: ${report.configOk ? 'OK' : 'MISSING'}`);
    console.log(`  skill baking: ${report.skillOk ? 'OK' : 'MISSING'}`);
    if (!report.ok) {
      console.log('');
      console.log(report.hint);
      console.log('Ver AGENTS.md — executor-mecanic NO existe en Cursor (solo Claude Code).');
    }
    process.exit(report.ok ? 0 : 1);
  }

  if (cmd === 'metrics-summary') {
    const fileArg = rest.find((a) => !a.startsWith('-'));
    const filePath = path.resolve(
      fileArg || path.join(process.cwd(), '.cursor', 'baking', 'metrics', 'runs.jsonl')
    );
    try {
      const report = summarize(filePath);
      console.log(formatReport(report));
      process.exit(0);
    } catch (err) {
      console.error(`metrics-summary failed: ${err.message}`);
      process.exit(1);
    }
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
      const installed = listInstalledAgents();
      console.log('  Agentes Cursor:', installed.cursor.filter((a) => a.ok).length + '/' + installed.cursor.length);
      console.log('  Agentes Claude:', installed.claude.filter((a) => a.ok).length + '/' + installed.claude.length);
      console.log('');
      console.log('Verificar: baking doctor');
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

#!/usr/bin/env node
'use strict';

const { install, readVersion } = require('../lib/install');
const { doctor, listInstalledAgents } = require('../lib/doctor');
const { summarize, formatReport } = require('../lib/metrics-summary');
const { runReview } = require('../lib/metrics-review');
const { runInitMemory } = require('../lib/init-memory');
const { autoRouteStatus, setAutoRoute } = require('../lib/auto-route');
const { buildRegistry } = require('../lib/skill-registry');
const { lightStackReport } = require('../lib/light-stack');
const path = require('path');

const HELP = `
@boogiepop/baking — orquestador planner → executor (Cursor + Claude Code)

Usage:
  baking install [--force-config]   Deploy skills, agents, rules, config global
  baking sync                       Alias de install
  baking doctor                     Verificar agentes + light stack
  baking skill-registry [--force]   Índice liviano de skills (~/.cursor/baking/)
  baking init-memory [--force] [--dry-run]
                                    Scan repo → AGENTS + init/ (luego /init-memory)
  baking auto-route on|off|status   Toggle Baking por default (sin "/baking" cada prompt)
  baking metrics-review [--status] [--force] [--close-cycle]
                                    Conclusión routing/ahorro (7 días o 50 runs)
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
    if (report.lightStack) {
      console.log('');
      console.log('Light stack:');
      console.log(`  enabled: ${report.lightStack.enabled ? 'yes' : 'no'}`);
      console.log(`  Engram MCP: ${report.lightStack.engram.ok ? 'OK' : 'MISSING (opcional)'}`);
      if (!report.lightStack.engram.ok) {
        console.log(`    → ${report.lightStack.engram.hint}`);
      }
      const reg = report.lightStack.skillRegistry;
      if (reg.ok) {
        const stale = reg.stale ? ' (stale — baking skill-registry)' : '';
        console.log(`  skill-registry: OK — ${reg.count} skills, ${reg.ageHours}h${stale}`);
      } else {
        console.log('  skill-registry: MISSING — correr: baking skill-registry');
      }
    }
    const ar = autoRouteStatus();
    console.log('');
    console.log(`Auto-route: ${ar.autoRouteEnabled ? 'ON' : 'OFF'} (baking enabled: ${ar.bakingEnabled ? 'yes' : 'no'})`);
    if (ar.bakingEnabled && !ar.autoRouteEnabled) {
      console.log('  → baking auto-route on   # Baking default sin repetir /baking');
    }
    if (!report.ok) {
      console.log('');
      console.log(report.hint);
      console.log('Ver AGENTS.md — executor-mecanic NO existe en Cursor (solo Claude Code).');
    }
    process.exit(report.ok ? 0 : 1);
  }

  if (cmd === 'skill-registry') {
    const force = rest.includes('--force');
    const ls = lightStackReport();
    const reg = ls.skillRegistry;
    if (reg.ok && !reg.stale && !force) {
      console.log(`skill-registry OK (${reg.count} skills, ${reg.ageHours}h) — ${reg.path}`);
      console.log('Use --force to regenerate.');
      process.exit(0);
    }
    try {
      const result = buildRegistry();
      console.log(`skill-registry: ${result.count} skills → ${result.path}`);
      process.exit(0);
    } catch (err) {
      console.error(`skill-registry failed: ${err.message}`);
      process.exit(1);
    }
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

  if (cmd === 'init-memory') {
    const force = rest.includes('--force');
    const dryRun = rest.includes('--dry-run');
    try {
      const result = runInitMemory({ force, dryRun });
      if (!result.ok) {
        console.error(result.error);
        process.exit(1);
      }
      if (result.dryRun) {
        console.log(`dry-run: mode=${result.scan.mode} stack=${result.scan.stack.signals.join(',')}`);
        console.log(`would write: ${result.wouldWrite.join(', ')}`);
        process.exit(0);
      }
      console.log(result.message);
      console.log('');
      for (const [k, p] of Object.entries(result.artifacts)) {
        console.log(`  ${k}: ${p}`);
      }
      console.log('');
      console.log('Siguiente: /init-memory o "usemos baking PLAN-ONLY para completar init-memory"');
      process.exit(0);
    } catch (err) {
      console.error(`init-memory failed: ${err.message}`);
      process.exit(1);
    }
  }

  if (cmd === 'auto-route') {
    const sub = rest.find((a) => !a.startsWith('-'));
    if (!sub || sub === 'status') {
      const s = autoRouteStatus();
      console.log(`Baking enabled: ${s.bakingEnabled ? 'yes' : 'no'}`);
      console.log(`Auto-route: ${s.autoRouteEnabled ? 'ON' : 'OFF'}`);
      console.log(`Effective (auto Baking on code tasks): ${s.effective ? 'yes' : 'no'}`);
      if (!s.bakingEnabled) console.log('→ Activa baking en config: enabled: true');
      process.exit(0);
    }
    if (sub === 'on') {
      const r = setAutoRoute(true);
      console.log('Auto-route ON — pedidos de implementación usan Baking sin "/baking" en cada prompt.');
      console.log('Rule gate: ~/.cursor/rules/opus-sonnet-router.mdc (correr baking install si no actualizó).');
      process.exit(r.bakingEnabled ? 0 : 0);
    }
    if (sub === 'off') {
      setAutoRoute(false);
      console.log('Auto-route OFF — volvé a invocar /baking o "usemos baking" explícitamente.');
      process.exit(0);
    }
    console.error('Usage: baking auto-route on|off|status');
    process.exit(1);
  }

  if (cmd === 'metrics-review') {
    const statusOnly = rest.includes('--status');
    const force = rest.includes('--force');
    const closeCycle = rest.includes('--close-cycle');
    try {
      const result = runReview({ statusOnly, force, closeCycle });
      if (!result.ok) {
        console.error(result.error);
        process.exit(1);
      }
      if (result.closed) {
        console.log(result.message);
        process.exit(0);
      }
      if (result.status && !result.due) {
        console.log(result.status);
        process.exit(0);
      }
      if (result.conclusionPath) {
        console.log(result.summary);
        console.log('');
        console.log(`Conclusión escrita: ${result.conclusionPath}`);
        process.exit(0);
      }
      console.log(result.status || 'OK');
      process.exit(0);
    } catch (err) {
      console.error(`metrics-review failed: ${err.message}`);
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

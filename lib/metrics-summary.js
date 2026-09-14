'use strict';

const fs = require('fs');
const path = require('path');

function readJsonl(filePath) {
  if (!fs.existsSync(filePath)) {
    return [];
  }
  return fs
    .readFileSync(filePath, 'utf8')
    .split(/\r?\n/)
    .filter((line) => line.trim())
    .map((line, i) => {
      try {
        return JSON.parse(line);
      } catch (err) {
        throw new Error(`Invalid JSON line ${i + 1} in ${filePath}: ${err.message}`);
      }
    });
}

function sumTokens(usage) {
  if (!usage) return null;
  if (usage.total_tokens != null) return usage.total_tokens;
  const keys = [
    'orchestrator_tokens_in',
    'orchestrator_tokens_out',
    'planner_tokens_in',
    'planner_tokens_out',
    'executor_tokens_in',
    'executor_tokens_out',
  ];
  const parts = keys.map((k) => usage[k]).filter((n) => typeof n === 'number');
  return parts.length ? parts.reduce((a, b) => a + b, 0) : null;
}

function groupBy(rows, keyFn) {
  const map = new Map();
  for (const row of rows) {
    const key = keyFn(row) || '(sin etiqueta)';
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(row);
  }
  return map;
}

function avgUsd(rows) {
  const vals = rows.map((r) => r.usage && r.usage.total_usd).filter((n) => typeof n === 'number');
  if (!vals.length) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

function comparePairs(rows) {
  const pairs = groupBy(
    rows.filter((r) => r.benchmark && r.benchmark.pair_id),
    (r) => r.benchmark.pair_id
  );
  const out = [];
  for (const [pairId, pairRows] of pairs) {
    const baseline = pairRows.filter((r) => r.benchmark.arm === 'baseline' || r.benchmark.arm === 'opus-parent');
    const baking = pairRows.filter((r) => r.benchmark.arm === 'baking');
    const baseUsd = avgUsd(baseline);
    const bakeUsd = avgUsd(baking);
    if (baseUsd == null || bakeUsd == null) {
      out.push({ pair_id: pairId, note: 'Falta usage.total_usd en uno o ambos brazos' });
      continue;
    }
    const savingsUsd = baseUsd - bakeUsd;
    const savingsPct = baseUsd > 0 ? (savingsUsd / baseUsd) * 100 : null;
    out.push({
      pair_id: pairId,
      baseline_usd_avg: round2(baseUsd),
      baking_usd_avg: round2(bakeUsd),
      savings_usd: round2(savingsUsd),
      savings_pct: savingsPct != null ? round2(savingsPct) : null,
    });
  }
  return out;
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

function summarize(filePath) {
  const rows = readJsonl(filePath);
  const byScenario = groupBy(rows, (r) => (r.benchmark && r.benchmark.scenario_id) || null);
  const byArm = groupBy(rows, (r) => (r.benchmark && r.benchmark.arm) || null);
  const withUsage = rows.filter((r) => r.usage && r.usage.total_usd != null);

  const scenarios = [];
  for (const [scenario, scenarioRows] of byScenario) {
    if (scenario === '(sin etiqueta)') continue;
    scenarios.push({
      scenario_id: scenario,
      runs: scenarioRows.length,
      avg_usd: avgUsd(scenarioRows),
      avg_tokens: avgTokens(scenarioRows),
    });
  }

  const arms = [];
  for (const [arm, armRows] of byArm) {
    if (arm === '(sin etiqueta)') continue;
    arms.push({
      arm,
      runs: armRows.length,
      avg_usd: avgUsd(armRows),
      avg_tokens: avgTokens(armRows),
    });
  }

  return {
    file: filePath,
    total_runs: rows.length,
    runs_with_usage: withUsage.length,
    scenarios,
    arms,
    pair_comparisons: comparePairs(rows),
    routing: summarizeRouting(rows),
  };
}

function avgTokens(rows) {
  const vals = rows.map((r) => sumTokens(r.usage)).filter((n) => typeof n === 'number');
  if (!vals.length) return null;
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

function summarizeRouting(rows) {
  const plan = {};
  const exec = {};
  for (const r of rows) {
    const p = r.classification && r.classification.plan_agent;
    const e = r.classification && r.classification.exec_agent;
    if (p) plan[p] = (plan[p] || 0) + 1;
    if (e) exec[e] = (exec[e] || 0) + 1;
  }
  return { plan_agent: plan, exec_agent: exec };
}

function formatReport(report) {
  const lines = [];
  lines.push(`Baking metrics — ${report.file}`);
  lines.push(`Runs: ${report.total_runs} (${report.runs_with_usage} con usage.total_usd)`);
  lines.push('');

  if (report.scenarios.length) {
    lines.push('Por escenario (benchmark.scenario_id):');
    for (const s of report.scenarios) {
      lines.push(
        `  ${s.scenario_id}: n=${s.runs} avg_usd=${s.avg_usd ?? '—'} avg_tokens=${s.avg_tokens ?? '—'}`
      );
    }
    lines.push('');
  }

  if (report.arms.length) {
    lines.push('Por brazo (benchmark.arm):');
    for (const a of report.arms) {
      lines.push(`  ${a.arm}: n=${a.runs} avg_usd=${a.avg_usd ?? '—'} avg_tokens=${a.avg_tokens ?? '—'}`);
    }
    lines.push('');
  }

  if (report.pair_comparisons.length) {
    lines.push('Comparativas emparejadas (benchmark.pair_id):');
    for (const p of report.pair_comparisons) {
      if (p.note) {
        lines.push(`  ${p.pair_id}: ${p.note}`);
      } else {
        lines.push(
          `  ${p.pair_id}: baseline $${p.baseline_usd_avg} → baking $${p.baking_usd_avg} ` +
            `(−$${p.savings_usd}, −${p.savings_pct}%)`
        );
      }
    }
    lines.push('');
  }

  lines.push('Routing:');
  lines.push(`  plan_agent: ${JSON.stringify(report.routing.plan_agent)}`);
  lines.push(`  exec_agent: ${JSON.stringify(report.routing.exec_agent)}`);

  return lines.join('\n');
}

module.exports = { summarize, formatReport, readJsonl };

'use strict';

const fs = require('fs');
const path = require('path');
const { readJsonl, summarize } = require('./metrics-summary');
const { readConfig } = require('./light-stack');

const DEFAULT_REVIEW = {
  intervalDays: 7,
  minRuns: 50,
  routingAuditSample: 20,
  routingMaxBadPct: 10,
  savingsMinPairs: 3,
  savingsMinPct: 25,
};

function metricsPaths(cwd) {
  const config = readConfig();
  const dirRel = config?.metrics?.dir || '.cursor/baking/metrics';
  const fileName = config?.metrics?.file || 'runs.jsonl';
  const dir = path.resolve(cwd, dirRel);
  return {
    dir,
    runsFile: path.join(dir, fileName),
    stateFile: path.join(dir, 'review-state.json'),
    conclusionsDir: path.join(dir, 'conclusions'),
  };
}

function reviewConfig() {
  const config = readConfig();
  return { ...DEFAULT_REVIEW, ...(config?.metrics?.review || {}) };
}

function readState(stateFile) {
  if (!fs.existsSync(stateFile)) return null;
  try {
    return JSON.parse(fs.readFileSync(stateFile, 'utf8'));
  } catch {
    return null;
  }
}

function writeState(stateFile, state) {
  fs.mkdirSync(path.dirname(stateFile), { recursive: true });
  fs.writeFileSync(stateFile, JSON.stringify(state, null, 2) + '\n', 'utf8');
}

function ensureCycle(state, totalRuns) {
  const now = new Date().toISOString();
  if (state && state.cycleId) return state;
  return {
    cycleId: 1,
    cycleStartedAt: now,
    runsAtCycleStart: 0,
    lastReviewAt: null,
    lastReviewRunCount: 0,
  };
}

function daysBetween(isoA, isoB) {
  const a = new Date(isoA).getTime();
  const b = new Date(isoB).getTime();
  return Math.floor(Math.abs(b - a) / (1000 * 60 * 60 * 24));
}

function isReviewDue(state, totalRuns, cfg) {
  const runsSinceReview = state.lastReviewAt
    ? Math.max(0, totalRuns - (state.lastReviewRunCount || 0))
    : Math.max(0, totalRuns - (state.runsAtCycleStart || 0));
  const anchor = state.lastReviewAt || state.cycleStartedAt;
  const days = daysBetween(anchor, new Date().toISOString());

  const byRuns = runsSinceReview >= cfg.minRuns;
  const byTime = days >= cfg.intervalDays;

  return {
    due: byRuns || byTime,
    runsInCycle: runsSinceReview,
    daysSinceAnchor: days,
    trigger: byRuns && byTime ? 'runs+time' : byRuns ? 'runs' : byTime ? 'time' : null,
    runsRemaining: Math.max(0, cfg.minRuns - runsSinceReview),
    daysRemaining: Math.max(0, cfg.intervalDays - days),
  };
}

function fitCounts(rows) {
  const plan = { good: 0, overkill: 0, underkill: 0, 'n/a': 0, other: 0 };
  const exec = { good: 0, overkill: 0, underkill: 0, 'n/a': 0, other: 0 };

  for (const r of rows) {
    bump(plan, r.review?.plan_fit);
    bump(exec, r.review?.exec_fit);
  }
  return { plan, exec };
}

function bump(map, key) {
  if (!key) return;
  if (map[key] != null) map[key]++;
  else map.other++;
}

function badFitRows(rows) {
  return rows.filter((r) => {
    const p = r.review?.plan_fit;
    const e = r.review?.exec_fit;
    return p === 'underkill' || p === 'overkill' || e === 'underkill' || e === 'overkill';
  });
}

function pct(n, d) {
  if (!d) return null;
  return Math.round((n / d) * 1000) / 10;
}

function analyzeRouting(rows, cfg) {
  const sampleSize = Math.min(cfg.routingAuditSample, rows.length);
  const sample = rows.slice(-sampleSize);
  const bad = badFitRows(sample);
  const badPct = pct(bad.length, sample.length);
  const counts = fitCounts(rows);

  let verdict = 'INSUFFICIENT_DATA';
  if (sample.length >= 5) {
    verdict = badPct != null && badPct <= cfg.routingMaxBadPct ? 'ROUTING_OK' : 'ROUTING_NEEDS_TUNING';
  }

  return {
    totalRuns: rows.length,
    sampleSize,
    badCount: bad.length,
    badPct,
    maxBadPct: cfg.routingMaxBadPct,
    verdict,
    counts,
    examples: bad.slice(-8).map((r) => ({
      ts: r.ts,
      prompt: truncate(r.prompt, 120),
      plan_agent: r.classification?.plan_agent,
      exec_agent: r.classification?.exec_agent,
      plan_fit: r.review?.plan_fit,
      exec_fit: r.review?.exec_fit,
      signals: r.signals,
      note: r.review?.note,
    })),
  };
}

function analyzeSavings(rows, cfg, pairComparisons) {
  const proven = pairComparisons.filter(
    (p) => p.savings_pct != null && p.savings_pct >= cfg.savingsMinPct
  );
  const withData = pairComparisons.filter((p) => !p.note);

  let verdict = 'INSUFFICIENT_DATA';
  if (withData.length === 0) {
    verdict = 'NO_BENCH_DATA';
  } else if (proven.length >= cfg.savingsMinPairs) {
    verdict = 'SAVINGS_PROVEN';
  } else if (withData.length >= 1) {
    verdict = 'SAVINGS_INCONCLUSIVE';
  }

  const avgSavings =
    withData.length > 0
      ? Math.round(
          (withData.reduce((a, p) => a + (p.savings_pct || 0), 0) / withData.length) * 10
        ) / 10
      : null;

  return {
    verdict,
    pairsWithUsage: withData.length,
    pairsMeetingTarget: proven.length,
    minPairs: cfg.savingsMinPairs,
    minPct: cfg.savingsMinPct,
    avgSavingsPct: avgSavings,
    pairs: pairComparisons,
  };
}

function truncate(s, n) {
  if (!s) return '';
  return s.length <= n ? s : s.slice(0, n - 1) + '…';
}

function formatConclusionMarkdown(ctx) {
  const { state, due, cfg, routing, savings, summary, writtenAt, trigger } = ctx;
  const lines = [];

  lines.push(`# Baking — cycle ${state.cycleId} conclusion`);
  lines.push('');
  lines.push(`- **Generated:** ${writtenAt}`);
  lines.push(`- **Trigger:** ${trigger === 'runs' ? `${cfg.minRuns} runs` : trigger === 'time' ? `${cfg.intervalDays} days` : 'runs + time'}`);
  lines.push(`- **Runs in cycle:** ${due.runsInCycle} (file total: ${routing.totalRuns})`);
  lines.push(`- **File:** \`${summary.file}\``);
  lines.push('');

  lines.push('## Routing');
  lines.push('');
  lines.push(`| Metric | Value |`);
  lines.push(`|---------|-------|`);
  lines.push(`| Verdict | **${routing.verdict}** |`);
  lines.push(`| Audited sample | last ${routing.sampleSize} runs |`);
  lines.push(`| underkill/overkill in sample | ${routing.badCount} (${routing.badPct ?? '—'}%) |`);
  lines.push(`| OK threshold | ≤ ${routing.maxBadPct}% |`);
  lines.push('');
  lines.push('`plan_fit` distribution (full cycle):');
  lines.push('```json');
  lines.push(JSON.stringify(routing.counts.plan, null, 2));
  lines.push('```');
  lines.push('');
  lines.push('`exec_fit` distribution (full cycle):');
  lines.push('```json');
  lines.push(JSON.stringify(routing.counts.exec, null, 2));
  lines.push('```');

  if (routing.examples.length) {
    lines.push('');
    lines.push('### Cases to review');
    for (const ex of routing.examples) {
      lines.push(`- \`${ex.ts}\` **${ex.prompt}** — plan=${ex.plan_agent} (${ex.plan_fit}), exec=${ex.exec_agent} (${ex.exec_fit})`);
      if (ex.note) lines.push(`  - note: ${ex.note}`);
    }
  }

  lines.push('');
  lines.push('## Savings (paired bench)');
  lines.push('');
  lines.push(`| Metric | Value |`);
  lines.push(`|---------|-------|`);
  lines.push(`| Verdict | **${savings.verdict}** |`);
  lines.push(`| Pairs with cost | ${savings.pairsWithUsage} |`);
  lines.push(`| Pairs ≥ ${savings.minPct}% savings | ${savings.pairsMeetingTarget} (min ${savings.minPairs}) |`);
  lines.push(`| Average savings | ${savings.avgSavingsPct != null ? savings.avgSavingsPct + '%' : '—'} |`);

  if (savings.pairs.length) {
    lines.push('');
    lines.push('### Pairs');
    for (const p of savings.pairs) {
      if (p.note) {
        lines.push(`- \`${p.pair_id}\`: ${p.note}`);
      } else {
        lines.push(
          `- \`${p.pair_id}\`: baseline $${p.baseline_usd_avg} → baking $${p.baking_usd_avg} (−${p.savings_pct}%)`
        );
      }
    }
  }

  lines.push('');
  lines.push('## Operational conclusion');
  lines.push('');

  const routingOk = routing.verdict === 'ROUTING_OK';
  const savingsOk = savings.verdict === 'SAVINGS_PROVEN';

  if (routingOk && savingsOk) {
    lines.push(
      '**Objective met** for routing and bench savings. You can close the cycle:'
    );
    lines.push('');
    lines.push('```bash');
    lines.push('baking metrics-review --close-cycle');
    lines.push('```');
    lines.push('');
    lines.push('This archives `runs.jsonl` and starts a new cycle. Do not delete the archived file.');
  } else if (routingOk && savings.verdict === 'NO_BENCH_DATA') {
    lines.push(
      '**Routing OK** in the sample. **Savings not measured** — run S0 vs S3 bench with `pair_id` + `usage.total_usd` to validate cost.'
    );
  } else if (routingOk) {
    lines.push('**Routing OK.** Keep accumulating savings bench or close cycle if routing alone is enough.');
  } else {
    lines.push(
      '**Tune rules** — review underkill/overkill cases and signals in `BAKING-CURSOR.md` / config before closing the cycle.'
    );
  }

  lines.push('');
  lines.push('---');
  lines.push('*Regenerate: `baking metrics-review --force` · Status: `baking metrics-review --status`*');

  return lines.join('\n');
}

function formatStatus(ctx) {
  const { due, cfg, state, totalRuns, runsFile } = ctx;
  const lines = [];
  lines.push(`Baking metrics review — ciclo ${state.cycleId}`);
  lines.push(`Archivo: ${runsFile}`);
  lines.push(`Runs in cycle: ${due.runsInCycle} / ${cfg.minRuns} (trigger)`);
  lines.push(`Days since last review/start: ${due.daysSinceAnchor} / ${cfg.intervalDays}`);
  lines.push('');
  if (due.due) {
    lines.push('Status: READY for conclusion → run `baking metrics-review`');
    lines.push(`Trigger: ${due.trigger}`);
  } else {
    lines.push('Status: accumulating');
    lines.push(`~${due.runsRemaining} runs or ~${due.daysRemaining} days remaining`);
  }
  return lines.join('\n');
}

function closeCycle(paths, state) {
  if (!fs.existsSync(paths.runsFile)) {
    throw new Error(`File not found: ${paths.runsFile}`);
  }
  const stamp = new Date().toISOString().slice(0, 10);
  const archiveName = `runs-cycle-${state.cycleId}-${stamp}.jsonl`;
  const archivePath = path.join(paths.dir, archiveName);
  fs.renameSync(paths.runsFile, archivePath);

  const now = new Date().toISOString();
  const newState = {
    cycleId: state.cycleId + 1,
    cycleStartedAt: now,
    runsAtCycleStart: 0,
    lastReviewAt: null,
    lastReviewRunCount: 0,
    lastArchivedAt: now,
    lastArchiveFile: archiveName,
  };
  writeState(paths.stateFile, newState);

  return { archivePath, archiveName, newState };
}

function runReview(options = {}) {
  const cwd = options.cwd || process.cwd();
  const force = options.force === true;
  const statusOnly = options.statusOnly === true;
  const closeCycleFlag = options.closeCycle === true;
  const paths = metricsPaths(cwd);
  const cfg = reviewConfig();

  if (!fs.existsSync(paths.runsFile)) {
    return {
      ok: false,
      error: `No metrics at ${paths.runsFile}. Run /baking at least once.`,
    };
  }

  const rows = readJsonl(paths.runsFile);
  let state = ensureCycle(readState(paths.stateFile), rows.length);

  const dueInfo = isReviewDue(state, rows.length, cfg);
  const ctx = {
    state,
    due: dueInfo,
    cfg,
    totalRuns: rows.length,
    runsFile: paths.runsFile,
  };

  if (statusOnly) {
    return { ok: true, status: formatStatus(ctx), due: dueInfo.due };
  }

  if (closeCycleFlag) {
    const result = closeCycle(paths, state);
    return {
      ok: true,
      closed: true,
      message: `Cycle ${state.cycleId} archived → ${result.archiveName}. New cycle ${result.newState.cycleId}.`,
      archivePath: result.archivePath,
      state: result.newState,
    };
  }

  if (!dueInfo.due && !force) {
    return { ok: true, due: false, status: formatStatus(ctx) };
  }

  const summary = summarize(paths.runsFile);
  const routing = analyzeRouting(rows, cfg);
  const savings = analyzeSavings(rows, cfg, summary.pair_comparisons);

  const writtenAt = new Date().toISOString();
  const conclusionCtx = {
    state,
    due: dueInfo,
    cfg,
    routing,
    savings,
    summary,
    writtenAt,
    trigger: dueInfo.trigger || 'force',
  };

  const markdown = formatConclusionMarkdown(conclusionCtx);
  fs.mkdirSync(paths.conclusionsDir, { recursive: true });
  const outName = `${writtenAt.slice(0, 10)}-cycle-${state.cycleId}.md`;
  const outPath = path.join(paths.conclusionsDir, outName);
  fs.writeFileSync(outPath, markdown, 'utf8');

  state = {
    ...state,
    lastReviewAt: writtenAt,
    lastReviewRunCount: rows.length,
  };
  writeState(paths.stateFile, state);

  return {
    ok: true,
    due: true,
    conclusionPath: outPath,
    routingVerdict: routing.verdict,
    savingsVerdict: savings.verdict,
    markdown,
    summary: formatReportShort(routing, savings, dueInfo),
  };
}

function formatReportShort(routing, savings, due) {
  return [
    `Routing: ${routing.verdict} (${routing.badPct ?? '—'}% bad in sample of ${routing.sampleSize})`,
    `Savings: ${savings.verdict}`,
    `Trigger: ${due.trigger}`,
  ].join(' · ');
}

module.exports = {
  runReview,
  metricsPaths,
  reviewConfig,
  isReviewDue,
  DEFAULT_REVIEW,
};

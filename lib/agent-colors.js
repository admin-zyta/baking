'use strict';

/** Canonical agent colors (Claude Code palette + Cursor frontmatter). See AGENTS.md */
const AGENT_COLORS = {
  baking: { color: 'cyan', emoji: '🩵', label: 'Orchestrator' },
  planner: { color: 'purple', emoji: '🟣', label: 'Plan · Opus' },
  'planner-hyper': { color: 'magenta', emoji: '🩷', label: 'Deep plan · Fable' },
  'planner-hyper-cursor': { color: 'magenta', emoji: '🩷', label: 'Deep plan · Fable' },
  'planner-cursor': { color: 'yellow', emoji: '🟡', label: 'Plan · Grok' },
  'executor-cursor': { color: 'green', emoji: '🟢', label: 'Execute · Composer' },
  executor: { color: 'blue', emoji: '🔵', label: 'Execute · Sonnet' },
  'executor-mecanic': { color: 'orange', emoji: '🟠', label: 'Mecanic · Haiku' },
};

function delegationBanner(from, to, flow) {
  const meta = AGENT_COLORS[to] || { emoji: '▶️', label: to };
  return `${meta.emoji} **${from} → ${to}** · ${flow || meta.label}`;
}

module.exports = { AGENT_COLORS, delegationBanner };

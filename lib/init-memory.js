'use strict';

const fs = require('fs');
const path = require('path');
const { readConfig } = require('./config');

const DEFAULT_INIT = {
  agentsFile: 'AGENTS.md',
  projectRuleFile: '.cursor/rules/baking-project.mdc',
  scanDir: '.cursor/baking/init',
};

function initMemoryConfig() {
  const config = readConfig();
  return { ...DEFAULT_INIT, ...(config?.initMemory || {}) };
}

function safeRead(filePath, max = 8000) {
  try {
    if (!fs.existsSync(filePath)) return null;
    const text = fs.readFileSync(filePath, 'utf8');
    return text.length > max ? text.slice(0, max) + '\n…' : text;
  } catch {
    return null;
  }
}

function readJson(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function listFiles(dir, pattern, maxDepth = 3, depth = 0, out = []) {
  if (!fs.existsSync(dir) || depth > maxDepth) return out;
  for (const name of fs.readdirSync(dir)) {
    if (name === 'node_modules' || name === '.git' || name === 'dist' || name === '.next') continue;
    const full = path.join(dir, name);
    try {
      const st = fs.statSync(full);
      if (st.isDirectory()) listFiles(full, pattern, maxDepth, depth + 1, out);
      else if (!pattern || pattern.test(name)) out.push(full);
    } catch {
      /* skip */
    }
  }
  return out;
}

function detectStack(root) {
  const signals = [];
  const scripts = {};
  const pkg = readJson(path.join(root, 'package.json'));
  if (pkg) {
    signals.push('node');
    if (pkg.workspaces) signals.push('monorepo');
    Object.assign(scripts, pkg.scripts || {});
    if (pkg.dependencies?.next || pkg.devDependencies?.next) signals.push('next');
    if (pkg.dependencies?.react || pkg.devDependencies?.react) signals.push('react');
    if (pkg.dependencies?.vite || pkg.devDependencies?.vite) signals.push('vite');
  }
  if (fs.existsSync(path.join(root, 'pyproject.toml'))) signals.push('python');
  if (fs.existsSync(path.join(root, 'go.mod'))) signals.push('go');
  if (fs.existsSync(path.join(root, 'Cargo.toml'))) signals.push('rust');
  if (fs.existsSync(path.join(root, 'nest-cli.json'))) signals.push('nestjs');
  if (fs.existsSync(path.join(root, 'docker-compose.yml'))) signals.push('docker-compose');
  return { signals: [...new Set(signals)], scripts, packageName: pkg?.name || null };
}

function inferProjectSlug(root) {
  return path.basename(root).replace(/[^\w.-]+/g, '-').toLowerCase() || 'project';
}

function scanProject(cwd) {
  const root = path.resolve(cwd);
  const cfg = initMemoryConfig();
  const stack = detectStack(root);
  const slug = inferProjectSlug(root);

  const existing = {
    agents: fs.existsSync(path.join(root, cfg.agentsFile)),
    claude: fs.existsSync(path.join(root, 'CLAUDE.md')) || fs.existsSync(path.join(root, '.claude', 'CLAUDE.md')),
    cursorRules: listFiles(path.join(root, '.cursor', 'rules'), /\.mdc$/i, 1).map((p) => path.relative(root, p)),
    handoffs: listFiles(path.join(root, '.cursor', 'handoff'), /\.md$/i, 1).length,
  };

  const readme = safeRead(path.join(root, 'README.md'), 2000);
  const ci = ['.github/workflows', '.gitlab-ci.yml', 'azure-pipelines.yml']
    .map((p) => path.join(root, p))
    .filter((p) => fs.existsSync(p))
    .map((p) => path.relative(root, p));

  return {
    scannedAt: new Date().toISOString(),
    root,
    slug,
    mode: existing.agents || existing.claude ? 'audit' : 'create',
    stack,
    existing,
    readmeExcerpt: readme,
    ci,
    paths: cfg,
  };
}

function buildAgentsDraft(scan) {
  const { stack, slug } = scan;
  const lines = [
    `# ${stack.packageName || slug}`,
    '',
    '> Generado por `baking init-memory`. Completá con el agente (PLAN-ONLY) — borrá placeholders.',
    '',
    '## Stack (detectado)',
    '',
    stack.signals.length ? stack.signals.map((s) => `- ${s}`).join('\n') : '- (revisar manualmente)',
    '',
    '## Comandos',
    '',
  ];

  const pick = ['dev', 'start', 'build', 'test', 'lint', 'format'];
  const found = pick.filter((k) => stack.scripts[k]);
  if (found.length) {
    for (const k of found) lines.push(`- \`${k}\`: \`npm run ${k}\` — ${stack.scripts[k]}`);
  } else {
    lines.push('- TODO: comandos dev/test/build (no estándar en package.json)');
  }

  lines.push('', '## Arquitectura', '', '- TODO: entrypoints, carpetas clave, módulos principales', '');
  lines.push('## Convenciones', '', '- TODO: estilo, branches, commits, env vars requeridas', '');
  lines.push('## Gotchas', '', '- TODO: cosas que el agente suele inferir mal', '');

  if (scan.mode === 'audit') {
    lines.push('## Audit', '', 'Modo audit: ya existe AGENTS.md o CLAUDE.md — no sobrescribir; mergear lo detectado arriba.', '');
  }

  return lines.join('\n');
}

function buildEngramTopics(scan) {
  const topics = [
    { topic_key: `${scan.slug}/stack`, title: `Stack and dev commands (${scan.slug})`, type: 'architecture' },
    { topic_key: `${scan.slug}/structure`, title: `Project structure (${scan.slug})`, type: 'architecture' },
    { topic_key: `${scan.slug}/gotchas`, title: `Non-obvious gotchas (${scan.slug})`, type: 'discovery' },
  ];
  if (scan.stack.signals.includes('monorepo')) {
    topics.push({ topic_key: `${scan.slug}/monorepo`, title: `Monorepo layout (${scan.slug})`, type: 'architecture' });
  }
  if (scan.existing.handoffs > 0) {
    topics.push({ topic_key: `${scan.slug}/handoffs`, title: `Handoff conventions (${scan.slug})`, type: 'pattern' });
  }
  return { project: scan.slug, topics };
}

function buildProjectRule(scan) {
  return `---
description: Contexto del proyecto ${scan.slug} (Baking init-memory)
alwaysApply: true
---

# ${scan.slug}

Leé \`AGENTS.md\` en la raíz. Handoffs Baking: \`.cursor/handoff/\`.

Stack detectado: ${scan.stack.signals.join(', ') || 'ver AGENTS.md'}.

No re-explorar manifests en cada sesión — si falta algo, actualizá AGENTS.md o Engram (\`mem_save\`).
`;
}

function buildNextSteps(scan) {
  return `# Baking init-memory — siguiente paso (agente)

Modo: **${scan.mode}** · Proyecto: \`${scan.slug}\` · ${scan.scannedAt}

## Qué hizo el CLI

- \`.cursor/baking/init/scan.json\` — señales del repo
- \`.cursor/baking/init/AGENTS.draft.md\` — borrador (no commitear como final sin revisar)
- \`.cursor/baking/init/engram-topics.json\` — temas sugeridos para \`mem_save\`

## Corrida PLAN-ONLY (obligatoria)

Invocá Baking en modo **PLAN-ONLY** (planner, sin executor):

1. Leer \`scan.json\`, README, manifests, CI, handoffs existentes.
2. **${scan.mode === 'audit' ? 'Auditar' : 'Escribir'}** \`${scan.paths.agentsFile}\` — solo lo que el agente inferiría mal sin esto (como Claude \`/init\`).
3. Actualizar \`${scan.paths.projectRuleFile}\` si hace falta (conciso).
4. Por cada tema en \`engram-topics.json\`: **\`mem_save\`** estructurado (What/Why/Where/Learned) — **no** volcar AGENTS entero.
5. Handoff en \`.cursor/handoff/YYYY-MM-DD-init-memory.md\` con checklist de done.

## Cierre

YAML + métrica JSONL. Usuario revisa y commitea \`AGENTS.md\`.
`;
}

function runInitMemory(options = {}) {
  const cwd = options.cwd || process.cwd();
  const force = options.force === true;
  const dryRun = options.dryRun === true;
  const cfg = initMemoryConfig();
  const root = path.resolve(cwd);
  const scan = scanProject(root);
  const initDir = path.join(root, cfg.scanDir);
  const handoffDir = path.join(root, '.cursor', 'handoff');
  const agentsPath = path.join(root, cfg.agentsFile);
  const rulePath = path.join(root, cfg.projectRuleFile);

  const artifacts = {
    scanJson: path.join(initDir, 'scan.json'),
    agentsDraft: path.join(initDir, 'AGENTS.draft.md'),
    engramTopics: path.join(initDir, 'engram-topics.json'),
    nextMd: path.join(initDir, 'NEXT.md'),
    projectRule: rulePath,
  };

  const payload = {
    scan: JSON.stringify(scan, null, 2),
    agentsDraft: buildAgentsDraft(scan),
    engramTopics: JSON.stringify(buildEngramTopics(scan), null, 2),
    nextMd: buildNextSteps(scan),
    projectRule: buildProjectRule(scan),
  };

  if (dryRun) {
    return { ok: true, dryRun: true, scan, artifacts, wouldWrite: Object.keys(payload) };
  }

  fs.mkdirSync(initDir, { recursive: true });
  fs.mkdirSync(handoffDir, { recursive: true });
  fs.mkdirSync(path.dirname(rulePath), { recursive: true });

  fs.writeFileSync(artifacts.scanJson, payload.scan, 'utf8');
  fs.writeFileSync(artifacts.agentsDraft, payload.agentsDraft, 'utf8');
  fs.writeFileSync(artifacts.engramTopics, payload.engramTopics, 'utf8');
  fs.writeFileSync(artifacts.nextMd, payload.nextMd, 'utf8');

  if (!fs.existsSync(rulePath) || force) {
    fs.writeFileSync(rulePath, payload.projectRule, 'utf8');
  }

  if (scan.mode === 'create' && !fs.existsSync(agentsPath)) {
    fs.writeFileSync(agentsPath, payload.agentsDraft, 'utf8');
  }

  return {
    ok: true,
    scan,
    artifacts,
    agentsWritten: scan.mode === 'create' && !fs.existsSync(agentsPath),
    message:
      `Init-memory listo (${scan.mode}). Seguí ${path.relative(root, artifacts.nextMd)} con PLAN-ONLY + mem_save.`,
  };
}

module.exports = { runInitMemory, scanProject, initMemoryConfig };

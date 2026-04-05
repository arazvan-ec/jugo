#!/usr/bin/env node
/**
 * Workflow Gate Engine v2
 *
 * Improvements over v1:
 *   P3: Local file is THE source of truth (no fail-open)
 *   P5: agentmemory is async sync for history, not state
 *   P6: No more "WORKFLOW_STATE:" smart-search — state is JSON file
 *   P2: --reopen support, amendment versioning, needs-review state
 *   P1: Quality validation on --complete (schema per phase)
 *
 * State lives in: .claude/workflow/<feature>.json
 * History goes to: agentmemory (async, fire-and-forget)
 *
 * Usage:
 *   node gate-check.mjs <action>                          → check if action is allowed
 *   node gate-check.mjs --complete <phase> [feature]      → mark phase done (with validation)
 *   node gate-check.mjs --status [feature]                → show current state
 *   node gate-check.mjs --skip <phase> [reason]           → bypass a gate (audited)
 *   node gate-check.mjs --reset [feature]                 → start new workflow
 *   node gate-check.mjs --reopen <phase> [feature]        → go back to a phase (P2)
 *   node gate-check.mjs --list                            → list all active workflows
 *   node gate-check.mjs --next [feature]                  → show next pending phase
 *   node gate-check.mjs --validate <phase> [feature]      → dry-run validation without completing
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'fs';
import { join, basename } from 'path';

// ── Config ──────────────────────────────────────
const AGENTMEMORY_URL = process.env.AGENTMEMORY_URL || 'http://localhost:3111';
const PROJECT_DIR = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const STATE_DIR = join(PROJECT_DIR, '.claude', 'workflow');

// ── Phase Definitions ───────────────────────────
const PHASES = ['idea', 'spec', 'plan', 'build', 'test', 'review', 'ship'];

// Hard gates: what must be completed before an action is allowed
const HARD_GATES = {
  'Write':     ['spec', 'plan'],
  'Edit':      ['spec', 'plan'],
  'MultiEdit': ['spec', 'plan'],
  'ship':      ['spec', 'plan', 'build', 'test', 'review'],
};

// Actions that are always allowed (no gates)
const ALWAYS_ALLOWED = [
  'Read', 'Glob', 'Grep', 'LS', 'Bash',
  'Agent', 'TodoRead', 'TodoWrite',
];

// Phase dependencies: reopening a phase marks these as needs-review
const DOWNSTREAM = {
  idea:   ['spec', 'plan', 'build', 'test', 'review'],
  spec:   ['plan', 'build', 'test', 'review'],
  plan:   ['build', 'test', 'review'],
  build:  ['test', 'review'],
  test:   ['review'],
  review: [],
  ship:   [],
};

// ── Quality Validation Schemas (P1) ─────────────
// Each phase defines what the agent should have produced.
// Validation is advisory — it warns but the user can override.
const VALIDATION_HINTS = {
  idea: {
    description: 'Idea refinement complete',
    checks: [
      'At least 2 alternative approaches were considered',
      'A preferred approach was selected with rationale',
    ],
  },
  spec: {
    description: 'Specification complete',
    checks: [
      'Acceptance criteria defined (>=3)',
      'Boundary conditions / edge cases identified',
      'Testing strategy outlined',
    ],
  },
  plan: {
    description: 'Implementation plan complete',
    checks: [
      'Tasks broken down (>=2 tasks)',
      'Dependency order defined',
      'Each task has clear acceptance criteria',
    ],
  },
  build: {
    description: 'Implementation complete',
    checks: [
      'Code compiles / lints without errors',
      'No TODO/FIXME placeholders left unresolved',
      'Follows conventions from spec/plan',
    ],
  },
  test: {
    description: 'Testing complete',
    checks: [
      'At least 1 test passing',
      'Critical paths covered',
      'Edge cases from spec tested',
    ],
  },
  review: {
    description: 'Code review complete',
    checks: [
      'All review axes addressed (correctness, security, performance, readability, maintainability)',
      'No blocking issues remain',
    ],
  },
  ship: {
    description: 'Ship checklist complete',
    checks: [
      'Deployment checklist verified',
      'Rollback plan defined',
    ],
  },
};

// ── State File Operations (P3: local file = source of truth) ──
function ensureStateDir() {
  if (!existsSync(STATE_DIR)) {
    mkdirSync(STATE_DIR, { recursive: true });
  }
}

function stateFilePath(feature) {
  return join(STATE_DIR, `${feature}.json`);
}

function readState(feature = 'default') {
  const fp = stateFilePath(feature);
  try {
    if (!existsSync(fp)) return null;
    return JSON.parse(readFileSync(fp, 'utf8'));
  } catch { return null; }
}

function writeState(state) {
  ensureStateDir();
  state.updated = new Date().toISOString();
  writeFileSync(stateFilePath(state.feature), JSON.stringify(state, null, 2));
}

function defaultState(feature = 'default') {
  return {
    feature,
    project: PROJECT_DIR,
    phases: Object.fromEntries(PHASES.map(p => [p, {
      status: 'pending',   // pending | in-progress | done | needs-review | skipped
      version: 0,
      ts: null,
      skipReason: null,
    }])),
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  };
}

function getState(feature = 'default') {
  return readState(feature) || (() => {
    const s = defaultState(feature);
    writeState(s);
    return s;
  })();
}

function getActiveFeature() {
  // If there's a .claude/workflow/_active file, use that
  const activeFile = join(STATE_DIR, '_active');
  try {
    if (existsSync(activeFile)) {
      return readFileSync(activeFile, 'utf8').trim();
    }
  } catch {}
  return 'default';
}

function setActiveFeature(feature) {
  ensureStateDir();
  writeFileSync(join(STATE_DIR, '_active'), feature);
}

// ── Agentmemory Integration (P5+P6: history only, async) ──
async function logToMemory(title, content, type = 'workflow') {
  try {
    await fetch(`${AGENTMEMORY_URL}/agentmemory/remember`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content,
        project: PROJECT_DIR,
        type,
        title,
      }),
      signal: AbortSignal.timeout(2000),
    });
  } catch { /* Fire and forget — state is safe in local file */ }
}

async function memoryIsUp() {
  try {
    const r = await fetch(`${AGENTMEMORY_URL}/agentmemory/livez`, {
      signal: AbortSignal.timeout(1000),
    });
    return r.ok;
  } catch { return false; }
}

// ── Gate Check ──────────────────────────────────
function isPhaseOpen(phase, state) {
  const s = state.phases[phase]?.status;
  return s === 'done' || s === 'skipped';
}

function checkGate(state, action) {
  if (ALWAYS_ALLOWED.includes(action)) {
    return { allowed: true };
  }

  const required = HARD_GATES[action];
  if (!required) {
    return { allowed: true };
  }

  const missing = required.filter(phase => !isPhaseOpen(phase, state));

  if (missing.length === 0) {
    return { allowed: true };
  }

  return {
    allowed: false,
    missing,
    message: `Gate blocked: ${action} requires [${missing.join(', ')}] to be completed first.\n` +
             `Run: ${missing.map(m => `/${m}`).join(', ')} -- or /skip-gate ${missing[0]} "reason" to bypass.`,
  };
}

// ── Reopen Logic (P2: iteration without reset) ──
function reopenPhase(state, phase) {
  const current = state.phases[phase];
  // Mark this phase as in-progress (reopened)
  state.phases[phase] = {
    status: 'in-progress',
    version: (current.version || 0),  // version increments on next --complete
    ts: new Date().toISOString(),
    skipReason: null,
    reopenedFrom: current.status,
  };

  // Mark downstream phases as needs-review (P2.3: invalidate minimum)
  const downstream = DOWNSTREAM[phase] || [];
  for (const dp of downstream) {
    if (state.phases[dp].status === 'done') {
      state.phases[dp].status = 'needs-review';
      state.phases[dp].reviewReason = `${phase} was reopened`;
    }
  }

  return downstream.filter(dp => state.phases[dp].status === 'needs-review');
}

// ── Validation (P1: quality checks) ─────────────
function getValidationChecklist(phase) {
  const hints = VALIDATION_HINTS[phase];
  if (!hints) return null;
  return hints;
}

// ── Next Phase Helper (P4: meta-orchestration) ──
function getNextPhase(state) {
  for (const phase of PHASES) {
    const s = state.phases[phase].status;
    if (s === 'in-progress') return { phase, reason: 'in progress' };
    if (s === 'needs-review') return { phase, reason: 'needs review after reopen' };
  }
  for (const phase of PHASES) {
    if (state.phases[phase].status === 'pending') {
      return { phase, reason: 'next pending' };
    }
  }
  return null; // All done
}

// ── Status Formatting ───────────────────────────
function formatStatus(state) {
  const icons = {
    'done': '\u2713',
    'skipped': '\u2298',
    'pending': '\u25CB',
    'in-progress': '\u25BA',
    'needs-review': '\u26A0',
  };

  const lines = PHASES.map(p => {
    const s = state.phases[p];
    const icon = icons[s.status] || '?';
    const ver = s.version > 1 ? ` (v${s.version})` : '';
    const extra = s.status === 'skipped' ? ` (skipped: ${s.skipReason})` : '';
    const review = s.status === 'needs-review' ? ` (${s.reviewReason})` : '';
    return `  ${icon} ${p}${ver}${extra}${review}`;
  });

  const next = getNextPhase(state);
  const nextLine = next ? `\nNext: /${next.phase} (${next.reason})` : '\nAll phases complete!';

  return `Workflow: ${state.feature}\nProject: ${state.project}\n\n${lines.join('\n')}\n${nextLine}`;
}

// ── CLI ─────────────────────────────────────────
const args = process.argv.slice(2);
const command = args[0];

try {
  if (command === '--complete') {
    const phase = args[1];
    const feature = args[2] || getActiveFeature();
    if (!PHASES.includes(phase)) {
      console.error(`Unknown phase: ${phase}. Valid: ${PHASES.join(', ')}`);
      process.exit(1);
    }

    const state = getState(feature);
    const prev = state.phases[phase];

    // P1: Show validation checklist
    const validation = getValidationChecklist(phase);
    if (validation) {
      console.log(`\nValidation for "${phase}" — ${validation.description}:`);
      validation.checks.forEach((c, i) => console.log(`  ${i + 1}. ${c}`));
      console.log('');
    }

    // Update phase
    state.phases[phase] = {
      status: 'done',
      version: (prev.version || 0) + 1,
      ts: new Date().toISOString(),
      skipReason: null,
    };
    writeState(state);

    console.log(JSON.stringify({
      completed: phase,
      feature,
      version: state.phases[phase].version,
    }));

    // P6: Log transition to agentmemory as history (async)
    logToMemory(
      `Phase completed: ${phase} (${feature})`,
      `${phase} phase completed for feature "${feature}" (v${state.phases[phase].version}). Project: ${PROJECT_DIR}`,
      'workflow_transition'
    );

  } else if (command === '--skip') {
    const phase = args[1];
    const reason = args.slice(2).join(' ') || 'No reason provided';
    const feature = getActiveFeature();
    if (!PHASES.includes(phase)) {
      console.error(`Unknown phase: ${phase}`);
      process.exit(1);
    }

    const state = getState(feature);
    state.phases[phase] = {
      status: 'skipped',
      version: (state.phases[phase].version || 0),
      ts: new Date().toISOString(),
      skipReason: reason,
    };
    writeState(state);

    console.log(JSON.stringify({
      skipped: phase,
      reason,
      warning: 'This skip is recorded in the audit trail.',
    }));

    // Log skip to agentmemory audit trail
    logToMemory(
      `Gate skip: ${phase} -- ${reason}`,
      `GATE_SKIPPED: Phase "${phase}" was skipped for feature "${feature}". Reason: ${reason}`,
      'decision'
    );

  } else if (command === '--reopen') {
    // P2: Reopen a phase for amendment
    const phase = args[1];
    const feature = args[2] || getActiveFeature();
    if (!PHASES.includes(phase)) {
      console.error(`Unknown phase: ${phase}`);
      process.exit(1);
    }
    if (phase === 'ship') {
      console.error('Cannot reopen ship — once shipped, start a new workflow.');
      process.exit(1);
    }

    const state = getState(feature);
    const affected = reopenPhase(state, phase);
    writeState(state);

    console.log(JSON.stringify({
      reopened: phase,
      feature,
      affectedDownstream: affected,
      note: `${phase} is now in-progress. ${affected.length ? `Downstream phases marked needs-review: [${affected.join(', ')}]` : 'No downstream phases affected.'}`,
    }));

    // Log reopen to agentmemory
    logToMemory(
      `Phase reopened: ${phase} (${feature})`,
      `${phase} phase reopened for amendment in feature "${feature}". Downstream affected: [${affected.join(', ')}]`,
      'workflow_transition'
    );

  } else if (command === '--status') {
    const feature = args[1] || getActiveFeature();
    const state = getState(feature);
    console.log(formatStatus(state));

  } else if (command === '--reset') {
    const feature = args[1] || 'default';
    const state = defaultState(feature);
    writeState(state);
    setActiveFeature(feature);
    console.log(JSON.stringify({ reset: true, feature }));

    logToMemory(
      `New workflow: ${feature}`,
      `Workflow reset/created for feature "${feature}" in ${PROJECT_DIR}`,
      'workflow_transition'
    );

  } else if (command === '--list') {
    ensureStateDir();
    const files = readdirSync(STATE_DIR)
      .filter(f => f.endsWith('.json'))
      .map(f => {
        const state = JSON.parse(readFileSync(join(STATE_DIR, f), 'utf8'));
        const done = PHASES.filter(p => isPhaseOpen(p, state)).length;
        return {
          feature: state.feature,
          progress: `${done}/${PHASES.length}`,
          updated: state.updated,
        };
      });
    const active = getActiveFeature();
    console.log(`Active: ${active}\n`);
    if (files.length === 0) {
      console.log('No workflows found.');
    } else {
      files.forEach(f => {
        const marker = f.feature === active ? ' <-- active' : '';
        console.log(`  ${f.feature}: ${f.progress} phases done (updated ${f.updated})${marker}`);
      });
    }

  } else if (command === '--next') {
    const feature = args[1] || getActiveFeature();
    const state = getState(feature);
    const next = getNextPhase(state);
    if (next) {
      console.log(JSON.stringify(next));
    } else {
      console.log(JSON.stringify({ phase: null, reason: 'all phases complete' }));
    }

  } else if (command === '--validate') {
    const phase = args[1];
    if (!PHASES.includes(phase)) {
      console.error(`Unknown phase: ${phase}`);
      process.exit(1);
    }
    const validation = getValidationChecklist(phase);
    if (validation) {
      console.log(`Validation for "${phase}" — ${validation.description}:`);
      validation.checks.forEach((c, i) => console.log(`  ${i + 1}. ${c}`));
    } else {
      console.log(`No validation schema for phase: ${phase}`);
    }

  } else {
    // Default: gate check for an action
    const action = command || 'Write';
    const feature = getActiveFeature();
    const state = getState(feature);
    const result = checkGate(state, action);

    if (!result.allowed) {
      process.stderr.write(result.message);
      process.exit(2);
    }
    process.exit(0);
  }
} catch (err) {
  // P3: Fail-closed — if we can't read state, block the action
  // but only for gate checks, not for management commands
  if (!command || !command.startsWith('--')) {
    console.error(`Gate engine error (fail-closed): ${err.message}`);
    console.error('Cannot verify workflow state. Fix the issue or use /skip-gate to bypass.');
    process.exit(2);
  }
  console.error(`Gate engine error: ${err.message}`);
  process.exit(1);
}

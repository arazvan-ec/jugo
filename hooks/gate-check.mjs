#!/usr/bin/env node
/**
 * Workflow Gate Engine
 * 
 * Checks if the current workflow phase allows the requested action.
 * Uses agentmemory as persistent backend with local cache for speed.
 * 
 * Usage:
 *   node gate-check.mjs <action>        → check if action is allowed
 *   node gate-check.mjs --complete <phase> [feature]  → mark phase done
 *   node gate-check.mjs --status [feature]            → show current state
 *   node gate-check.mjs --skip <phase> [reason]       → bypass a gate
 *   node gate-check.mjs --reset [feature]             → reset workflow
 *   node gate-check.mjs --list                        → list active workflows
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

// ── Config ──────────────────────────────────────
const AGENTMEMORY_URL = process.env.AGENTMEMORY_URL || 'http://localhost:3111';
const PROJECT_DIR = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const CACHE_DIR = join(PROJECT_DIR, '.claude', 'workflow');
const CACHE_FILE = join(CACHE_DIR, 'state.json');
const CACHE_TTL_MS = 30_000; // 30s cache

// ── Phase Definitions ───────────────────────────
// Order matters: index = progression level
const PHASES = ['idea', 'spec', 'plan', 'build', 'test', 'review', 'ship'];

// Hard gates: what must be completed before an action is allowed
// Key = action type, Value = required phases
const HARD_GATES = {
  // Can't write code without spec + plan
  'Write':     ['spec', 'plan'],
  'Edit':      ['spec', 'plan'],
  'MultiEdit': ['spec', 'plan'],
  // Can't ship without test + review
  'ship':      ['spec', 'plan', 'build', 'test', 'review'],
};

// Actions that are always allowed (no gates)
const ALWAYS_ALLOWED = [
  'Read', 'Glob', 'Grep', 'LS', 'Bash',
  'Agent', 'TodoRead', 'TodoWrite',
];

// ── Cache Layer ─────────────────────────────────
function ensureCacheDir() {
  if (!existsSync(CACHE_DIR)) {
    mkdirSync(CACHE_DIR, { recursive: true });
  }
}

function readCache() {
  try {
    if (!existsSync(CACHE_FILE)) return null;
    const data = JSON.parse(readFileSync(CACHE_FILE, 'utf8'));
    if (Date.now() - data._ts > CACHE_TTL_MS) return null; // Stale
    return data;
  } catch { return null; }
}

function writeCache(state) {
  ensureCacheDir();
  state._ts = Date.now();
  writeFileSync(CACHE_FILE, JSON.stringify(state, null, 2));
}

// ── Agentmemory Integration ─────────────────────
async function memoryIsUp() {
  try {
    const r = await fetch(`${AGENTMEMORY_URL}/agentmemory/livez`, { signal: AbortSignal.timeout(1000) });
    return r.ok;
  } catch { return false; }
}

async function loadStateFromMemory(feature) {
  try {
    const r = await fetch(`${AGENTMEMORY_URL}/agentmemory/smart-search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: `workflow-gate ${feature} ${PROJECT_DIR}` }),
      signal: AbortSignal.timeout(2000),
    });
    if (!r.ok) return null;
    const data = await r.json();
    // Find the latest workflow state memory
    const mem = data.results?.find(r => r.content?.startsWith('WORKFLOW_STATE:'));
    if (!mem) return null;
    return JSON.parse(mem.content.replace('WORKFLOW_STATE:', ''));
  } catch { return null; }
}

async function saveStateToMemory(state) {
  try {
    await fetch(`${AGENTMEMORY_URL}/agentmemory/remember`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: `WORKFLOW_STATE:${JSON.stringify(state)}`,
        project: PROJECT_DIR,
        type: 'workflow',
        title: `Workflow: ${state.feature} [${Object.entries(state.phases).filter(([,v]) => v.done).map(([k]) => k).join(',')}]`,
      }),
      signal: AbortSignal.timeout(2000),
    });
  } catch { /* Fire and forget */ }
}

// ── State Management ────────────────────────────
function defaultState(feature = 'default') {
  return {
    feature,
    project: PROJECT_DIR,
    phases: Object.fromEntries(PHASES.map(p => [p, { done: false, ts: null, skipped: false, skipReason: null }])),
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  };
}

async function getState(feature = 'default') {
  // 1. Try cache
  let cached = readCache();
  if (cached?.feature === feature) return cached;

  // 2. Try agentmemory
  if (await memoryIsUp()) {
    const memState = await loadStateFromMemory(feature);
    if (memState) {
      writeCache(memState);
      return memState;
    }
  }

  // 3. Default (new workflow)
  const state = defaultState(feature);
  writeCache(state);
  return state;
}

async function saveState(state) {
  state.updated = new Date().toISOString();
  writeCache(state);
  if (await memoryIsUp()) {
    await saveStateToMemory(state);
  }
}

// ── Gate Check ──────────────────────────────────
function checkGate(state, action) {
  // Always-allowed actions pass through
  if (ALWAYS_ALLOWED.includes(action)) {
    return { allowed: true };
  }

  const required = HARD_GATES[action];
  if (!required) {
    return { allowed: true }; // No gate defined = allowed
  }

  const missing = required.filter(phase => {
    const p = state.phases[phase];
    return !p.done && !p.skipped;
  });

  if (missing.length === 0) {
    return { allowed: true };
  }

  return {
    allowed: false,
    missing,
    message: `Gate blocked: ${action} requires [${missing.join(', ')}] to be completed first.\n` +
             `Run: ${missing.map(m => `/${m}`).join(', ')} — or /skip-gate ${missing[0]} "reason" to bypass.`,
  };
}

// ── CLI ─────────────────────────────────────────
const args = process.argv.slice(2);
const command = args[0];

try {
  if (command === '--complete') {
    // Mark a phase as completed
    const phase = args[1];
    const feature = args[2] || 'default';
    if (!PHASES.includes(phase)) {
      console.error(`Unknown phase: ${phase}. Valid: ${PHASES.join(', ')}`);
      process.exit(1);
    }
    const state = await getState(feature);
    state.phases[phase] = { done: true, ts: new Date().toISOString(), skipped: false, skipReason: null };
    await saveState(state);
    console.log(JSON.stringify({ completed: phase, feature }));

  } else if (command === '--skip') {
    // Skip a gate with reason (audit trail)
    const phase = args[1];
    const reason = args.slice(2).join(' ') || 'No reason provided';
    const state = await getState();
    if (!PHASES.includes(phase)) {
      console.error(`Unknown phase: ${phase}`);
      process.exit(1);
    }
    state.phases[phase] = { done: false, ts: new Date().toISOString(), skipped: true, skipReason: reason };
    await saveState(state);
    // Also log the skip to agentmemory as a separate observation
    if (await memoryIsUp()) {
      await fetch(`${AGENTMEMORY_URL}/agentmemory/remember`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: `GATE_SKIPPED: Phase "${phase}" was skipped. Reason: ${reason}`,
          project: PROJECT_DIR,
          type: 'decision',
          title: `Gate skip: ${phase} — ${reason}`,
        }),
        signal: AbortSignal.timeout(2000),
      }).catch(() => {});
    }
    console.log(JSON.stringify({ skipped: phase, reason, warning: 'This skip is recorded in memory audit trail.' }));

  } else if (command === '--status') {
    const feature = args[1] || 'default';
    const state = await getState(feature);
    const summary = PHASES.map(p => {
      const s = state.phases[p];
      const icon = s.done ? '✓' : s.skipped ? '⊘' : '○';
      const extra = s.skipped ? ` (skipped: ${s.skipReason})` : '';
      return `  ${icon} ${p}${extra}`;
    }).join('\n');
    console.log(`Workflow: ${state.feature}\nProject: ${state.project}\n\n${summary}\n`);

  } else if (command === '--reset') {
    const feature = args[1] || 'default';
    const state = defaultState(feature);
    await saveState(state);
    console.log(JSON.stringify({ reset: true, feature }));

  } else if (command === '--list') {
    const state = await getState();
    console.log(JSON.stringify(state));

  } else {
    // Default: gate check for an action
    const action = command || 'Write';
    const state = await getState();
    const result = checkGate(state, action);
    
    if (!result.allowed) {
      // Output to stderr for Claude to see
      process.stderr.write(result.message);
      process.exit(2); // Block the action
    }
    // Allowed — silent success
    process.exit(0);
  }
} catch (err) {
  // On any error, fail open (don't block work)
  console.error(`Gate engine error: ${err.message}`);
  process.exit(0);
}

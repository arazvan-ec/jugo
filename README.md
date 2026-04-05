# Agent Toolkit

**Skills + Memory + Workflow Gates for Claude Code**

Combines [agent-skills](https://github.com/addyosmani/agent-skills) (structured engineering workflows) with [agentmemory](https://github.com/rohitg00/agentmemory) (persistent cross-session memory), enforced by hard workflow gates that prevent skipping phases.

## How It Works

```
/new-feature auth-system

  /work              ← auto-detect next phase
  -- or manually --
  ○ /idea    → refine the concept (recommended, not required)
  ○ /spec    → write specification          ← GATE: must complete before code
  ○ /plan    → break into tasks             ← GATE: must complete before code
              ↓ Write/Edit unlocked
  ○ /build   → implement slice by slice
  ○ /test    → TDD: failing test → green
  ○ /review  → 5-axis code review
              ↓ /ship unlocked
  ○ /ship    → deploy checklist
```

**Hard gates**: Claude literally cannot write/edit files until `/spec` and `/plan` are done. A PreToolUse hook blocks the action with exit code 2.

**Fail-closed**: If state can't be read, actions are blocked (not silently allowed).

**Iteration**: Changed your mind during `/build`? Use `--reopen spec` to go back. Downstream phases get marked "needs-review" — no progress is destroyed.

**Quality validation**: Each phase has a validation checklist verified on completion — not just a checkbox.

**Memory**: Every transition persists to agentmemory as history. Start a new session and it knows where you left off.

**Emergency bypass**: `/skip-gate spec "production hotfix"` — skips the gate but records it permanently.

## Prerequisites

- [Claude Code](https://docs.claude.com/en/docs/claude-code) installed
- Node.js >= 20
- Git

## Quick Install

```bash
git clone https://github.com/YOUR_USER/agent-toolkit.git ~/.agent-toolkit
cd ~/.agent-toolkit
chmod +x install.sh
./install.sh
```

The installer:
1. Clones both upstream repos
2. Builds agentmemory + installs local embeddings
3. Installs 4 hooks in `~/.claude/settings.json` (SessionStart, PreToolUse, PostToolUse, Stop)
4. Creates slash commands

## Usage

```bash
# 1. Start memory server (optional — gates work without it)
~/.agent-toolkit/scripts/start-memory.sh

# 2. Open Claude Code in any project
cd my-project && claude

# 3. Start a feature
> /new-feature user-auth

# 4. Let /work guide you (recommended)
> /work              ← auto-detects next phase
> /work              ← keeps going...

# -- or run phases manually --
> /spec
> /plan
> /build   ← now Write/Edit is allowed
> /test
> /review
> /ship    ← only after test + review

# Check status anytime
> /workflow

# Go back to a phase (iteration)
> # gate-check.mjs --reopen spec

# Emergency bypass
> /skip-gate spec "critical hotfix for prod"
```

## Commands

### Primary Commands (user-facing)

| Command | Purpose |
|---------|---------|
| `/work` | **Meta-orchestrator** — auto-detect and run next phase |
| `/work <phase>` | Jump to a specific phase |
| `/workflow` | Show current gate status + all workflows |
| `/new-feature <name>` | Start fresh workflow |
| `/skip-gate <phase> <reason>` | Emergency bypass (audited) |
| `/recall <query>` | Search past sessions |
| `/remember <text>` | Save to long-term memory |

### Phase Commands (invoked by /work or directly)

| Command | Phase | What it unlocks |
|---------|-------|-----------------|
| `/idea` | Define | nothing (recommended, not required) |
| `/spec` | Define | Write/Edit (with /plan) |
| `/plan` | Plan | Write/Edit (with /spec) |
| `/build` | Build | — |
| `/test` | Verify | /ship (with /review) |
| `/review` | Review | /ship (with /test) |
| `/ship` | Ship | — |

### Support Commands (no gates)

`/context` `/frontend` `/api` `/browser` `/debug` `/security` `/perf` `/git` `/cicd` `/docs` `/simplify` `/deprecate`

## State Management

**Local file is the source of truth**: `.claude/workflow/<feature>.json`

- Gates always read from local file (sync, <1ms, no network dependency)
- agentmemory stores transition history (async, for cross-session search)
- Each feature gets its own state file — no collisions
- State files are per-project (in `.claude/workflow/`, add to `.gitignore`)

### Phase States

| State | Icon | Meaning |
|-------|------|---------|
| `pending` | ○ | Not started |
| `in-progress` | ► | Currently being worked on |
| `done` | ✓ | Completed (with version number) |
| `needs-review` | ⚠ | Marked for review after upstream reopen |
| `skipped` | ⊘ | Bypassed with audit trail |

### Iteration (Reopen)

```bash
# Discovered spec was wrong during build?
node gate-check.mjs --reopen spec

# Result:
#   spec: in-progress (reopened)
#   plan: needs-review (downstream)
#   build: unchanged (code is still there)
#   Write/Edit: still allowed (spec existed before)
```

Reopening a phase:
- Marks it as `in-progress`
- Marks downstream phases as `needs-review`
- Does NOT destroy any progress
- On next `--complete`, version increments (v1 → v2)

## Architecture

```
~/.agent-toolkit/
├── install.sh / uninstall.sh
├── CLAUDE.md                       # Routing doc for Claude Code
├── .claude/
│   ├── settings.json
│   └── commands/                   # Slash commands
│       ├── work.md                 # Meta-orchestrator (primary)
│       ├── spec.md → agent-skills/spec-driven-development
│       ├── plan.md → agent-skills/planning-and-task-breakdown
│       ├── ...
│       ├── recall.md               # agentmemory search
│       ├── remember.md             # agentmemory save
│       ├── workflow.md             # gate status
│       ├── new-feature.md          # reset gates
│       └── skip-gate.md            # emergency bypass
├── hooks/
│   ├── gate-check.mjs              # Gate engine v2 (local state + validation)
│   ├── pre-tool-use.sh             # HARD GATE: blocks Write/Edit
│   ├── session-start.sh            # Injects state + memory context
│   ├── post-tool-use.sh            # Captures observations
│   └── session-end.sh              # Triggers compression
├── scripts/
│   ├── start-memory.sh
│   └── stop-memory.sh
└── vendor/                         # Cloned upstream repos
    ├── agent-skills/
    └── agentmemory/
```

## Hooks Overview

| Hook | Event | Mode | Purpose |
|------|-------|------|---------|
| `pre-tool-use.sh` | PreToolUse | **sync/blocking** | Gate: blocks Write/Edit without spec+plan |
| `session-start.sh` | SessionStart | sync | Injects workflow state + past context |
| `post-tool-use.sh` | PostToolUse | async | Captures observations silently |
| `session-end.sh` | Stop | async | Triggers memory compression |

## Configuration

### agentmemory (optional)

Edit `~/.agentmemory/.env`:

```bash
EMBEDDING_PROVIDER=local          # Free, no API key
TOKEN_BUDGET=2000                 # Context injection budget
# ANTHROPIC_API_KEY=sk-ant-...   # Optional: for LLM compression
```

### Customizing Gates

Edit `hooks/gate-check.mjs` → `HARD_GATES` object to change which phases block which actions.

### Customizing Validation

Edit `hooks/gate-check.mjs` → `VALIDATION_HINTS` object to adjust quality checks per phase.

### Overriding Skills

Copy and edit any skill for your project:

```bash
cp ~/.agent-toolkit/vendor/agent-skills/skills/test-driven-development/SKILL.md \
   .claude/skills/tdd/SKILL.md
```

## Updating

```bash
cd ~/.agent-toolkit && ./install.sh --update
```

## Uninstalling

```bash
~/.agent-toolkit/uninstall.sh
```

## License

MIT. Upstream: agent-skills (MIT), agentmemory (Apache-2.0).

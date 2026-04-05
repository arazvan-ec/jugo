# Agent Toolkit

**Skills + Memory + Workflow Gates for Claude Code**

Combines [agent-skills](https://github.com/addyosmani/agent-skills) (structured engineering workflows) with [agentmemory](https://github.com/rohitg00/agentmemory) (persistent cross-session memory), enforced by hard workflow gates that prevent skipping phases.

## How It Works

```
/new-feature auth-system

  ○ /idea    → refine the concept (optional)
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

**Memory**: Every decision and phase completion persists across sessions via agentmemory. Start a new Claude Code session and it knows where you left off.

**Emergency bypass**: `/skip-gate spec "production hotfix"` — skips the gate but records it in the audit trail permanently.

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
4. Creates 24 slash commands

## Usage

```bash
# 1. Start memory server (once)
~/.agent-toolkit/scripts/start-memory.sh

# 2. Open Claude Code in any project
cd my-project && claude

# 3. Start a feature
> /new-feature user-auth

# 4. Follow the workflow
> /spec
> /plan
> /build   ← now Write/Edit is allowed
> /test
> /review
> /ship    ← only after test + review

# Check status anytime
> /workflow

# Emergency bypass
> /skip-gate spec "critical hotfix for prod"
```

## All Commands

### Phase Commands (gated)

| Command | Phase | What it unlocks |
|---------|-------|-----------------|
| `/idea` | Define | nothing (optional) |
| `/spec` | Define | Write/Edit (with /plan) |
| `/plan` | Plan | Write/Edit (with /spec) |
| `/build` | Build | — |
| `/test` | Verify | /ship (with /review) |
| `/review` | Review | /ship (with /test) |
| `/ship` | Ship | — |

### Support Commands (no gates)

`/context` `/frontend` `/api` `/browser` `/debug` `/security` `/perf` `/git` `/cicd` `/docs` `/simplify` `/deprecate`

### Workflow & Memory

| Command | Purpose |
|---------|---------|
| `/new-feature <name>` | Start fresh workflow |
| `/workflow` | Show gate status |
| `/skip-gate <phase> <reason>` | Emergency bypass (audited) |
| `/recall <query>` | Search past sessions |
| `/remember <text>` | Save to long-term memory |

## Architecture

```
~/.agent-toolkit/
├── install.sh / uninstall.sh
├── CLAUDE.md                       # Routing doc for Claude Code
├── .claude/
│   ├── settings.json
│   └── commands/                   # 24 slash commands
│       ├── spec.md → agent-skills/spec-driven-development
│       ├── plan.md → agent-skills/planning-and-task-breakdown
│       ├── ...
│       ├── recall.md               # agentmemory search
│       ├── remember.md             # agentmemory save
│       ├── workflow.md             # gate status
│       ├── new-feature.md          # reset gates
│       └── skip-gate.md            # emergency bypass
├── hooks/
│   ├── gate-check.mjs              # Gate engine (state + agentmemory)
│   ├── pre-tool-use.sh             # HARD GATE: blocks Write/Edit
│   ├── session-start.sh            # Injects memory context
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
| `session-start.sh` | SessionStart | sync | Injects past context from agentmemory |
| `post-tool-use.sh` | PostToolUse | async | Captures observations silently |
| `session-end.sh` | Stop | async | Triggers memory compression |

## Configuration

### agentmemory

Edit `~/.agentmemory/.env`:

```bash
EMBEDDING_PROVIDER=local          # Free, no API key
TOKEN_BUDGET=2000                 # Context injection budget
# ANTHROPIC_API_KEY=sk-ant-...   # Optional: for LLM compression
```

### Customizing Gates

Edit `hooks/gate-check.mjs` → `HARD_GATES` object to change which phases block which actions.

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

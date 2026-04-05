# Agent Toolkit

This toolkit integrates **agent-skills** (engineering workflows) with **agentmemory** (persistent memory) for Claude Code, enforced by **workflow gates** that prevent skipping phases.

## Quick Start

Use `/work` to let the system guide you through the next phase automatically. Or invoke phases directly.

## Workflow Gates

Every feature follows a gated process. **You cannot write code until spec + plan are done.**

```
/new-feature <name>   <- Start a new workflow (resets gates)

  /work               <- Auto-detect and run next phase (recommended)
  -- or manually --
  /idea               <- (recommended) Refine the concept
  /spec               <- Write specification             <- REQUIRED before code
  /plan               <- Break into tasks                <- REQUIRED before code
                        | gate opens: Write/Edit allowed
  /build              <- Implement slice by slice
  /test               <- TDD: failing test -> green
  /review             <- 5-axis code review
                        | gate opens: ship allowed
  /ship               <- Deploy checklist

/workflow             <- Check current state
/skip-gate <phase> <reason>  <- Emergency bypass (audited)
```

### Hard Gates (enforced by PreToolUse hook)

| Action | Requires |
|--------|----------|
| Write, Edit, MultiEdit | `spec` + `plan` completed |
| /ship | `spec` + `plan` + `build` + `test` + `review` completed |

### Gate Behavior

- **Fail-closed**: If state can't be read, actions are BLOCKED (not silently allowed)
- **Local state**: `.claude/workflow/<feature>.json` is the source of truth (no network dependency)
- **agentmemory**: Optional async sync for cross-session history and search

### Gate Bypass

For hotfixes: `/skip-gate spec "production 500 error, hotfix needed"`
Skips are **permanently recorded** in the audit trail.

### Iteration (Reopen)

If you discover the spec was wrong during build, you can go back:
```
gate-check.mjs --reopen spec
```
- Reopened phase: marked `in-progress`
- Downstream phases: marked `needs-review`
- No progress is destroyed

### Quality Validation

Each phase has a validation checklist shown on `--complete`:
- spec: acceptance criteria, boundary conditions, testing strategy
- plan: tasks with dependencies and acceptance criteria
- build: compiles, no TODO placeholders
- test: tests passing, critical paths covered
- review: all axes addressed, no blockers

## Available Commands

### Primary Commands (user-facing)

| Command | Purpose |
|---------|---------|
| `/work` | Meta-orchestrator: auto-detect next phase |
| `/workflow` | Show current gate status |
| `/new-feature <name>` | Start new workflow |
| `/skip-gate <phase> <reason>` | Emergency bypass |
| `/recall <query>` | Search past sessions |
| `/remember <insight>` | Save to long-term memory |

### Phase Commands (invoked by /work or directly)

| Command | Phase | Gate |
|---------|-------|------|
| `/idea` | Define | none (recommended) |
| `/spec` | Define | unlocks Write/Edit |
| `/plan` | Plan | unlocks Write/Edit |
| `/build` | Build | -- |
| `/test` | Verify | unlocks /ship |
| `/review` | Review | unlocks /ship |
| `/ship` | Ship | requires all above |

### Support Commands (no gates)

| Command | Purpose |
|---------|---------|
| `/context` | Optimize context loading |
| `/frontend` | UI engineering patterns |
| `/api` | API design patterns |
| `/browser` | Browser testing with DevTools |
| `/debug` | Systematic debugging |
| `/security` | Security hardening |
| `/perf` | Performance optimization |
| `/git` | Git workflow |
| `/cicd` | CI/CD automation |
| `/docs` | ADRs, documentation |
| `/simplify` | Code simplification |
| `/deprecate` | Deprecation/migration |

## Phase States

| State | Icon | Meaning |
|-------|------|---------|
| `pending` | ○ | Not started |
| `in-progress` | ► | Currently being worked on (or reopened) |
| `done` | ✓ | Completed (tracks version number) |
| `needs-review` | ⚠ | Downstream of a reopened phase |
| `skipped` | ⊘ | Bypassed via /skip-gate |

## Memory Integration

When agentmemory is running (port 3111):
- **Session start**: Workflow state + past context injected automatically
- **Phase completion**: Transition logged to agentmemory as searchable history
- **Gate skips**: Recorded in audit trail
- **Session end**: Observations compressed into structured memory

When agentmemory is NOT running:
- Gates still work (local state file)
- Cross-session memory is unavailable
- Warning shown at session start

## Skill Loading

Phase commands use conditional loading:
- First invocation: reads full SKILL.md
- Subsequent invocations in same session: uses verification checklist only

## Skill Locations

Skills loaded from `~/.agent-toolkit/vendor/agent-skills/skills/`. Each contains a `SKILL.md` with a complete workflow. Follow skill workflows completely -- do not skip verification steps.

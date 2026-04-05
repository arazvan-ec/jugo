# Agent Toolkit

This toolkit integrates **agent-skills** (engineering workflows) with **agentmemory** (persistent memory) for Claude Code, enforced by **workflow gates** that prevent skipping phases.

## Workflow Gates

Every feature follows a gated process. **You cannot write code until spec + plan are done.**

```
/new-feature <name>   ← Start a new workflow (resets gates)

  /idea               ← (optional) Refine the concept
  /spec               ← Write specification         ← REQUIRED before code
  /plan               ← Break into tasks             ← REQUIRED before code
                        ↓ gate opens: Write/Edit allowed
  /build              ← Implement slice by slice
  /test               ← TDD: failing test → green
  /review             ← 5-axis code review
                        ↓ gate opens: ship allowed
  /ship               ← Deploy checklist

/workflow             ← Check current state
/skip-gate <phase> <reason>  ← Emergency bypass (audited)
```

### Hard Gates (enforced by PreToolUse hook)

| Action | Requires |
|--------|----------|
| Write, Edit, MultiEdit | `spec` + `plan` completed |
| /ship | `spec` + `plan` + `build` + `test` + `review` completed |

### Gate Bypass

For hotfixes: `/skip-gate spec "production 500 error, hotfix needed"`
Skips are **permanently recorded** in agentmemory's audit trail.

## Available Commands

### Phase Commands (register completion in workflow)

| Command | Phase | Gate |
|---------|-------|------|
| `/idea` | Define | none |
| `/spec` | Define | unlocks Write/Edit |
| `/plan` | Plan | unlocks Write/Edit |
| `/build` | Build | — |
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

### Workflow & Memory Commands

| Command | Purpose |
|---------|---------|
| `/new-feature <name>` | Start new workflow |
| `/workflow` | Show current gate status |
| `/skip-gate <phase> <reason>` | Emergency bypass |
| `/recall <query>` | Search past sessions |
| `/remember <insight>` | Save to long-term memory |

## Memory Integration

When agentmemory is running (port 3111):
- **Session start**: Past context + workflow state injected automatically
- **During work**: Tool observations captured, gates enforced
- **Phase completion**: State persisted to agentmemory (survives restarts)
- **Session end**: Observations compressed into structured memory

## Skill Locations

Skills loaded from `~/.agent-toolkit/vendor/agent-skills/skills/`. Each contains a `SKILL.md` with a complete workflow. Follow skill workflows completely — do not skip verification steps.

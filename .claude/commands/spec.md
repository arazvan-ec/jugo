# spec

**Phase: Define** — Write structured specifications before code: vision, PRD, tasks, acceptance criteria.

## 1. Check prerequisites

```bash
node ~/.agent-toolkit/hooks/gate-check.mjs --status
```

## 2. Check if /idea was run (P8: soft warning)

If the status shows `idea: pending`, warn the user:

> Starting /spec without /idea. You may be anchoring on the first solution.
> Consider running `/idea` first to explore alternatives, or continue if the problem is well-understood.

Before writing the spec, **brainstorm at least 3 alternative approaches** and select the best one with rationale. This replaces /idea if it was skipped.

## 3. Load the skill workflow (conditional — P7)

If this is the first time loading the spec skill in this session, read the full skill:

```bash
cat ~/.agent-toolkit/vendor/agent-skills/skills/spec-driven-development/SKILL.md
```

If the skill was already loaded earlier in this conversation, skip re-reading and go directly to execution using the verification checklist from the skill.

## 4. Execute the skill workflow

Follow the skill completely. **Do not skip verification steps.**

## 5. Validate and mark phase complete

Review the validation checklist before marking done:

```bash
node ~/.agent-toolkit/hooks/gate-check.mjs --validate spec
```

Ensure all checks pass, then mark complete:

```bash
node ~/.agent-toolkit/hooks/gate-check.mjs --complete spec
```

## 6. Save decisions to memory

```bash
curl -sf -X POST http://localhost:3111/agentmemory/remember \
  -H "Content-Type: application/json" \
  -d '{"content": "SUMMARY_OF_SPEC_DECISIONS", "project": "'$CLAUDE_PROJECT_DIR'", "type": "workflow_transition", "title": "Spec completed"}' 2>/dev/null || true
```

Show the updated workflow status:

```bash
node ~/.agent-toolkit/hooks/gate-check.mjs --status
```

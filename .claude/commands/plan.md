# plan

**Phase: Plan** — Break work into concrete tasks with dependencies, estimates, and acceptance criteria.

## 1. Check prerequisites

```bash
node ~/.agent-toolkit/hooks/gate-check.mjs --status
```

## 2. Load the skill workflow (conditional — P7)

If this is the first time loading the plan skill in this session, read the full skill:

```bash
cat ~/.agent-toolkit/vendor/agent-skills/skills/planning-and-task-breakdown/SKILL.md
```

If already loaded earlier in this conversation, skip re-reading and use the verification checklist.

## 3. Execute the skill workflow

Follow the skill completely. **Do not skip verification steps.**

## 4. Validate and mark phase complete

```bash
node ~/.agent-toolkit/hooks/gate-check.mjs --validate plan
node ~/.agent-toolkit/hooks/gate-check.mjs --complete plan
```

## 5. Save to memory and show status

```bash
curl -sf -X POST http://localhost:3111/agentmemory/remember \
  -H "Content-Type: application/json" \
  -d '{"content": "SUMMARY_OF_PLAN", "project": "'$CLAUDE_PROJECT_DIR'", "type": "workflow_transition", "title": "Plan completed"}' 2>/dev/null || true
node ~/.agent-toolkit/hooks/gate-check.mjs --status
```

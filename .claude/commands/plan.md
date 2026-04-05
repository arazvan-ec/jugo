# plan

**Phase: Plan** — Break work into small, verifiable tasks with acceptance criteria, dependency ordering, and checkpoints.

## 1. Check prerequisites

```bash
node ~/.agent-toolkit/hooks/gate-check.mjs --status
```

## 2. Load the skill workflow

Read the full skill and follow it step by step:

```bash
cat ~/.agent-toolkit/vendor/agent-skills/skills/planning-and-task-breakdown/SKILL.md
```

If the skill references additional files in its directory, read those too:

```bash
ls ~/.agent-toolkit/vendor/agent-skills/skills/planning-and-task-breakdown/
```

## 3. Check memory for past context

```bash
curl -sf -X POST http://localhost:3111/agentmemory/smart-search \
  -H "Content-Type: application/json" \
  -d '{"query": "plan planning-and-task-breakdown"}' 2>/dev/null || echo "Memory not available"
```

## 4. Execute the skill workflow

Follow the skill completely. **Do not skip verification steps.**

## 5. Mark phase complete

Once all verification steps pass, mark this phase as done:

```bash
node ~/.agent-toolkit/hooks/gate-check.mjs --complete plan
```

## 6. Save decisions to memory

```bash
curl -sf -X POST http://localhost:3111/agentmemory/remember \
  -H "Content-Type: application/json" \
  -d '{"content": "SUMMARY_OF_DECISIONS", "project": "'$CLAUDE_PROJECT_DIR'"}' 2>/dev/null || true
```

Show the updated workflow status after completing:

```bash
node ~/.agent-toolkit/hooks/gate-check.mjs --status
```

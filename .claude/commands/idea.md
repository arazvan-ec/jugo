# idea

**Phase: Define** — Refine ideas through structured divergent and convergent thinking.

## 1. Check current state

```bash
node ~/.agent-toolkit/hooks/gate-check.mjs --status
```

## 2. Load the skill workflow (conditional — P7)

If this is the first time loading the idea skill in this session, read the full skill:

```bash
cat ~/.agent-toolkit/vendor/agent-skills/skills/idea-refine/SKILL.md
```

If already loaded earlier in this conversation, skip re-reading and use the verification checklist.

## 3. Execute the skill workflow

Follow the skill completely. **Do not skip verification steps.**

## 4. Validate and mark phase complete

```bash
node ~/.agent-toolkit/hooks/gate-check.mjs --validate idea
node ~/.agent-toolkit/hooks/gate-check.mjs --complete idea
```

## 5. Save to memory and show status

```bash
curl -sf -X POST http://localhost:3111/agentmemory/remember \
  -H "Content-Type: application/json" \
  -d '{"content": "SUMMARY_OF_IDEA", "project": "'$CLAUDE_PROJECT_DIR'", "type": "workflow_transition", "title": "Idea refined"}' 2>/dev/null || true
node ~/.agent-toolkit/hooks/gate-check.mjs --status
```

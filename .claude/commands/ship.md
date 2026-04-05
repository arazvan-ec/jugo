# ship

**Phase: Ship** — Deployment checklist: final verification, rollback plan, deploy, monitor.

## 1. Check prerequisites (all phases required)

```bash
node ~/.agent-toolkit/hooks/gate-check.mjs --status
```

Verify that spec, plan, build, test, and review are all completed before proceeding.

## 2. Load the skill workflow (conditional — P7)

If this is the first time loading the ship skill in this session, read the full skill:

```bash
cat ~/.agent-toolkit/vendor/agent-skills/skills/shipping-and-launch/SKILL.md
```

If already loaded earlier in this conversation, skip re-reading and use the verification checklist.

## 3. Execute the skill workflow

Follow the skill completely. **Do not skip verification steps.**

## 4. Validate and mark phase complete

```bash
node ~/.agent-toolkit/hooks/gate-check.mjs --validate ship
node ~/.agent-toolkit/hooks/gate-check.mjs --complete ship
```

## 5. Save to memory and show status

```bash
curl -sf -X POST http://localhost:3111/agentmemory/remember \
  -H "Content-Type: application/json" \
  -d '{"content": "SUMMARY_OF_DEPLOYMENT", "project": "'$CLAUDE_PROJECT_DIR'", "type": "workflow_transition", "title": "Shipped"}' 2>/dev/null || true
node ~/.agent-toolkit/hooks/gate-check.mjs --status
```

Congratulate the user and suggest starting a new workflow with `/new-feature` for the next piece of work.

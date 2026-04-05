# build

**Phase: Build** — Build in thin vertical slices — implement one piece, test, verify, then expand. Feature flags, safe defaults, rollback-friendly.

## 1. Check prerequisites

```bash
node ~/.agent-toolkit/hooks/gate-check.mjs --status
```

## 2. Load the skill workflow

Read the full skill and follow it step by step:

```bash
cat ~/.agent-toolkit/vendor/agent-skills/skills/incremental-implementation/SKILL.md
```

If the skill references additional files in its directory, read those too:

```bash
ls ~/.agent-toolkit/vendor/agent-skills/skills/incremental-implementation/
```

## 3. Check memory for past context

```bash
curl -sf -X POST http://localhost:3111/agentmemory/smart-search \
  -H "Content-Type: application/json" \
  -d '{"query": "build incremental-implementation"}' 2>/dev/null || echo "Memory not available"
```

## 4. Execute the skill workflow

Follow the skill completely. **Do not skip verification steps.**

## 5. Mark phase complete

Once all verification steps pass, mark this phase as done:

```bash
node ~/.agent-toolkit/hooks/gate-check.mjs --complete build
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

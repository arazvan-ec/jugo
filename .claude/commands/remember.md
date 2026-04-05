# remember

Save a decision, pattern, or insight to long-term memory.

Use the argument as the content to remember. The memory will persist across sessions.

```
curl -sf -X POST http://localhost:3111/agentmemory/remember \
  -H "Content-Type: application/json" \
  -d "{\"content\": \"$ARGUMENTS\", \"project\": \"$CLAUDE_PROJECT_DIR\"}" 2>/dev/null || echo "agentmemory not running. Start it with: ~/.agent-toolkit/scripts/start-memory.sh"
```

Confirm to the user what was saved.

# recall

Search agentmemory for relevant context from past sessions.

Use the argument as a search query to find past decisions, patterns, and observations.

```
curl -sf -X POST http://localhost:3111/agentmemory/smart-search \
  -H "Content-Type: application/json" \
  -d '{"query": "$ARGUMENTS"}' 2>/dev/null || echo "agentmemory not running. Start it with: ~/.agent-toolkit/scripts/start-memory.sh"
```

If results are found, summarize the key findings for the user.
If specific IDs look relevant, expand them for full details:

```
curl -sf -X POST http://localhost:3111/agentmemory/smart-search \
  -H "Content-Type: application/json" \
  -d '{"expandIds": ["ID_HERE"]}' 2>/dev/null
```

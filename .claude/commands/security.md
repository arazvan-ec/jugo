# security

Security-first review: OWASP Top 10, input validation, auth patterns, secrets management, dependency audit.

Read the full skill workflow and follow it step by step:

```
cat ~/.agent-toolkit/vendor/agent-skills/skills/security-and-hardening/SKILL.md
```

If the skill references additional files in its directory, read those too:

```
ls ~/.agent-toolkit/vendor/agent-skills/skills/security-and-hardening/
```

Before starting, check if agentmemory has relevant context from past sessions:

```
curl -sf -X POST http://localhost:3111/agentmemory/smart-search \
  -H "Content-Type: application/json" \
  -d '{"query": "security security-and-hardening"}' 2>/dev/null || echo "Memory not available"
```

Follow the skill workflow completely. Do not skip verification steps.
When done, save key decisions to memory:

```
curl -sf -X POST http://localhost:3111/agentmemory/remember \
  -H "Content-Type: application/json" \
  -d '{"content": "SUMMARY_HERE", "project": "'"$CLAUDE_PROJECT_DIR"'"}' 2>/dev/null || true
```

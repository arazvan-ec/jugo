# workflow

Show the current workflow state — which phases are completed, pending, or skipped.

```bash
node ~/.agent-toolkit/hooks/gate-check.mjs --status
```

Present the output clearly to the user. If phases are blocked, suggest which `/command` to run next.

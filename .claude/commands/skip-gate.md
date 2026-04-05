# skip-gate

Bypass a workflow gate. Use for hotfixes or urgent changes that can't follow the full process.

**This skip is recorded in the audit trail** — agentmemory will remember it was skipped and why.

Parse the argument to extract the phase name and reason. Format: `/skip-gate <phase> <reason>`

Example: `/skip-gate spec "hotfix for production 500 error"`

```bash
node ~/.agent-toolkit/hooks/gate-check.mjs --skip "$ARGUMENTS"
```

After skipping, inform the user:
- Which phase was skipped
- That it's recorded in the audit trail
- Recommend completing the skipped phase retroactively when time allows

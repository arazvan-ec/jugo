# workflow

Show the current workflow state — which phases are completed, pending, in-progress, needs-review, or skipped.

```bash
node ~/.agent-toolkit/hooks/gate-check.mjs --status
```

Also list all active workflows:

```bash
node ~/.agent-toolkit/hooks/gate-check.mjs --list
```

Present the output clearly. Suggest:
- `/work` to continue with the next phase
- `/work <phase>` to jump to a specific phase
- `/<phase>` to run a specific phase directly
- `/skip-gate <phase> "reason"` if a gate needs bypassing

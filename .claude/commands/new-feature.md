# new-feature

Start a new feature workflow. Resets all gates to pending and sets this feature as active.

Use the argument as the feature name. If no argument, use "default".

```bash
node ~/.agent-toolkit/hooks/gate-check.mjs --reset $ARGUMENTS
```

After resetting, show the workflow status:

```bash
node ~/.agent-toolkit/hooks/gate-check.mjs --status
```

Then suggest:
- `/idea` to explore and refine the concept (recommended for new features)
- `/spec` to write the specification (required before coding)
- `/work` to let the system guide you through the next phase automatically

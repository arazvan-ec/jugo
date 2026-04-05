# new-feature

Start a new feature workflow. Resets all gates to pending.

Use the argument as the feature name. If no argument, use "default".

```bash
node ~/.agent-toolkit/hooks/gate-check.mjs --reset $ARGUMENTS
```

After resetting, show the workflow status:

```bash
node ~/.agent-toolkit/hooks/gate-check.mjs --status
```

Then suggest the user start with `/idea` or `/spec` to begin the development process.

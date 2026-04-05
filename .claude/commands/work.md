# work

**Meta-orchestrator** — Reads workflow state and executes the right phase automatically.

## Usage

- `/work` — auto-detect and run the next pending phase
- `/work test` — jump to a specific phase (if gates allow)
- `/work --status` — alias for /workflow
- `/work --skip spec "reason"` — alias for /skip-gate

## 1. Parse arguments

If the argument is `--status`, run:

```bash
node ~/.agent-toolkit/hooks/gate-check.mjs --status
```

If the argument starts with `--skip`, run:

```bash
node ~/.agent-toolkit/hooks/gate-check.mjs --skip $ARGUMENTS
```

Otherwise, continue below.

## 2. Check current workflow state

```bash
node ~/.agent-toolkit/hooks/gate-check.mjs --status
```

## 3. Determine target phase

If the user provided a phase name as argument (e.g., `/work test`), use that as the target phase.

If no argument, determine the next phase automatically:

```bash
node ~/.agent-toolkit/hooks/gate-check.mjs --next
```

## 4. Load and execute the target phase skill

Based on the target phase, load the corresponding skill:

| Phase | Skill directory |
|-------|----------------|
| idea | idea-refine |
| spec | spec-driven-development |
| plan | task-breakdown |
| build | incremental-implementation |
| test | tdd-workflow |
| review | code-review |
| ship | deployment |

Read the skill:

```bash
cat ~/.agent-toolkit/vendor/agent-skills/skills/<skill-directory>/SKILL.md
```

Follow the skill workflow completely. Do not skip verification steps.

## 5. Mark phase complete

After the skill workflow is done and verified:

```bash
node ~/.agent-toolkit/hooks/gate-check.mjs --complete <phase>
```

## 6. Show updated status

```bash
node ~/.agent-toolkit/hooks/gate-check.mjs --status
```

Then suggest what comes next based on the workflow state.

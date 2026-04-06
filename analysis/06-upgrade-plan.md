# 6. Best-of-Breed Upgrade Plan — Making Our Workflow Scalable

> Concrete plan combining the best techniques from each competitor

---

## 6.1 Design Philosophy

**Preserve our strengths:**
- Hard gate enforcement (PreToolUse blocking)
- Fail-closed behavior
- Simplicity (/work meta-orchestrator)
- Iteration without reset (--reopen)
- Audited bypasses (/skip-gate)

**Adopt the best from each leader:**
- Anti-rationalization from Superpowers
- Sub-agent isolation from GSD
- Progressive disclosure memory from claude-mem
- Static spec validation from OpenSpec
- Search-first from ECC
- TDD deletion enforcement from Superpowers
- Adversarial review from ECC + Harper Reed
- Circuit breaker from Cursor
- Prompt injection detection from GSD

---

## 6.2 Implementation Phases

### Phase 1: CRITICAL (immediate — doubles compliance, eliminates context rot)

#### 1A. Anti-Rationalization Tables in Every Phase Skill
**Source:** Superpowers (empirically pressure-tested)
**What:** Add a rationalization table to each slash command (spec, plan, build, test, review, ship) with 8-12 excuses + counter-arguments.
**How:** Study Superpowers' tables, adapt to our phases, test under pressure.
**Files:** All `.claude/commands/*.md` phase files
**Effort:** 2-3 hours

#### 1B. Sub-Agent Dispatch for /build Tasks
**Source:** GSD + Superpowers (subagent-driven-development)
**What:** /build dispatches fresh Agent per task from the plan. Each gets only its task context + relevant files.
**How:** Update /build and /work to use Claude Code's Agent tool for each task.
**Files:** `.claude/commands/build.md`, `.claude/commands/work.md`
**Effort:** 2-3 hours

#### 1C. 2-Stage Review (Spec Compliance then Code Quality)
**Source:** Superpowers
**What:** /review dispatches two sequential subagents: (1) does implementation match spec? (2) is code quality acceptable?
**How:** Update /review command to dispatch 2 Agent subagents sequentially.
**Files:** `.claude/commands/review.md`
**Effort:** 1-2 hours

#### 1D. Search-First Mandate in /build
**Source:** ECC
**What:** Before writing ANY code, search: repo files, existing tests, npm/pip packages. Decision: Adopt / Extend / Compose / Build.
**How:** Add search-first step to /build skill.
**Files:** `.claude/commands/build.md`
**Effort:** 30 minutes

### Phase 2: HIGH (next iteration — machine-checkable quality)

#### 2A. Spec Validation Engine
**Source:** OpenSpec
**What:** `gate-check.mjs --complete spec` validates spec structure: has acceptance criteria (>=3), has boundary conditions, has GIVEN/WHEN/THEN scenarios, has boundaries (Always/Ask/Never).
**How:** Add structural validation to gate-check.mjs --complete. Parse spec file, check sections.
**Files:** `hooks/gate-check.mjs`, `.claude/commands/spec.md`
**Effort:** 3-4 hours

#### 2B. TDD Deletion Enforcement
**Source:** Superpowers
**What:** In /build, if code is written before its test, instruction to DELETE and restart with test first.
**How:** Add Iron Law + deletion enforcement + 11 rationalizations to /build and /test skills.
**Files:** `.claude/commands/build.md`, `.claude/commands/test.md`
**Effort:** 1-2 hours

#### 2C. AI Adversarial Critique of Specs
**Source:** Harper Reed + BMAD (Edge Case Hunter)
**What:** After spec is written, before marking complete, dispatch a "critic" subagent that tries to find holes: missing edge cases, implicit assumptions, feasibility concerns.
**How:** Add critique subagent step to /spec command.
**Files:** `.claude/commands/spec.md`
**Effort:** 1-2 hours

#### 2D. Prompt Injection Detection Hook
**Source:** GSD (gsd-prompt-guard.js)
**What:** PreToolUse hook scans writes to .claude/ and planning files for injection patterns.
**How:** New hook or extension of pre-tool-use.sh.
**Files:** `hooks/pre-tool-use.sh` or new `hooks/injection-guard.mjs`
**Effort:** 2-3 hours

#### 2E. Circuit Breaker
**Source:** Cursor
**What:** Max 3 attempts to fix the same linter/test error on the same file. After 3, escalate to human.
**How:** Track fix attempts in local state. Pre-tool-use hook checks count.
**Files:** `hooks/gate-check.mjs`, `hooks/pre-tool-use.sh`
**Effort:** 2-3 hours

### Phase 3: MEDIUM (when ready — memory + monitoring)

#### 3A. Progressive Disclosure Memory
**Source:** claude-mem
**What:** 3-layer search for agentmemory: (1) compact index, (2) timeline, (3) full details. ~10x token savings.
**How:** Refactor session-start.sh to use layered queries instead of full context injection.
**Files:** `hooks/session-start.sh`
**Effort:** 3-4 hours

#### 3B. Additional Enforcement Hooks
**Source:** GSD
**What:** Add hooks for:
- Scope guard: is the file being edited part of the plan?
- Test guard: is there a test for this change?
- Security guard: is this touching auth/crypto/validation?
- Context monitor: warn at >40% context window usage
**How:** New hook scripts + settings.json configuration.
**Files:** New hooks, `install.sh`
**Effort:** 4-6 hours

#### 3C. Model Routing Guidance
**Source:** ECC
**What:** Add model routing recommendations per task type to /work:
- Haiku: search, exploration, simple edits
- Sonnet: multi-file implementation
- Opus: architecture, security analysis, complex debugging
**How:** Update /work command with model guidance.
**Files:** `.claude/commands/work.md`
**Effort:** 30 minutes

#### 3D. Santa Method for Critical Reviews
**Source:** ECC
**What:** Optional mode for /review: dispatch 2 independent reviewers with no shared context. Both must pass.
**How:** Add --critical flag to /review that triggers dual review.
**Files:** `.claude/commands/review.md`
**Effort:** 2-3 hours

### Phase 4: EXPERIMENTAL (future — autonomy + learning)

#### 4A. Autonomous Loop (/loop command)
**Source:** autoresearch + Ralph Wiggum + GSD v2
**What:** `/loop` runs /work continuously: auto-detect next phase, execute, verify, next. With:
- Intelligent exit detection (all phases complete)
- Circuit breaker (3 failures = stop)
- Crash recovery (resume from last committed state)
- Time-boxing (configurable max duration)
**Files:** New `.claude/commands/loop.md`, `hooks/gate-check.mjs`
**Effort:** 4-6 hours

#### 4B. Instinct-Based Learning
**Source:** ECC
**What:** Post-session, extract "instincts" — atomic learned behaviors:
- "In this project, tests use vitest not jest"
- "API endpoints follow /api/v1/ pattern"
- With confidence scores (0.3-0.9)
- Project-scoped isolation
**Files:** New `hooks/learning.mjs`, update `hooks/session-end.sh`
**Effort:** 6-8 hours

#### 4C. Council for Architecture Decisions
**Source:** ECC
**What:** For /spec on architecture decisions, dispatch 4 voices (Architect, Skeptic, Pragmatist, Critic). Anti-anchoring: each gets only the question.
**Files:** `.claude/commands/spec.md` or new `/council` command
**Effort:** 2-3 hours

#### 4D. Compound Error Learning
**Source:** Compound Engineering
**What:** Every error/bug found becomes a permanent rule in CLAUDE.md or project rules. Inverts the complexity curve: each bug makes future bugs less likely.
**Files:** Update review/test commands, CLAUDE.md
**Effort:** 2-3 hours

---

## 6.3 Best-of-Breed Source Map

| Phase | Current Source | Upgrade Source | Technique |
|-------|--------------|---------------|-----------|
| **Ideation** | agent-skills | + Superpowers brainstorming + ECC Council | Hard design gate, 4-voice anti-anchoring |
| **Spec** | agent-skills | + OpenSpec validation + Harper Reed critique + agent-skills boundaries | Machine-checkable specs, adversarial critique, Always/Ask/Never |
| **Plan** | agent-skills | + Superpowers precision (file paths, no pseudocode) + GSD parallel research | Exact file paths, plan reviewer subagent |
| **Build** | agent-skills | + GSD sub-agent isolation + ECC search-first + Superpowers TDD | Fresh context per task, search before code, deletion enforcement |
| **Test** | agent-skills | + Superpowers Iron Law + Kent Beck human-tests | Deletion enforcement, 11 rationalizations, human defines what to test |
| **Review** | agent-skills | + Superpowers 2-stage + ECC Santa Method + agent-skills 5-axis | Spec compliance then quality, dual adversarial for critical paths |
| **Ship** | agent-skills | + Superpowers fresh-evidence + agent-skills launch checklist + ECC kill switches | Fresh verification before completion, quantitative rollback thresholds |
| **Memory** | agentmemory | + claude-mem progressive disclosure + ECC instincts | 3-layer search (10x savings), learned behaviors with confidence |
| **Enforcement** | PreToolUse | + GSD multi-hook + Superpowers anti-rationalization + Cursor circuit breaker | 5+ hooks, rationalization tables, max 3 fix attempts |

---

## 6.4 Expected Impact

| Metric | Current | After Phase 1 | After Phase 2 | After All |
|--------|---------|--------------|--------------|-----------|
| **LLM compliance** | ~33% (baseline) | ~72% (anti-rationalization) | ~80% (validation) | ~90% |
| **Context rot** | Degrades after 5 files | Eliminated (sub-agents) | Eliminated | Eliminated |
| **Spec quality** | Advisory checklist | Advisory + rationalization | Machine-validated | Adversarial-tested |
| **TDD adherence** | Optional | Strongly encouraged | Deletion-enforced | Iron Law |
| **Token efficiency** | Full injection | Same | Progressive disclosure | ~10x savings |
| **Competitive score** | 31/55 | ~38/55 | ~44/55 | ~50/55 |

---

## 6.5 What We DON'T Adopt (and Why)

| Technique | Source | Why Not |
|-----------|-------|---------|
| 61 slash commands | GSD | Violates our simplicity principle. /work handles routing |
| 6 agent personas | BMAD | Overhead for solo dev. Council (4 voices) achieves similar with less |
| Full formal specs (SHALL/MUST) | OpenSpec | Too heavy for most features. Adopt structural validation, not language |
| Spec-as-source (code disposable) | Tessl | Too radical for most teams. Specs guide code, code is still primary |
| 38 specialized agents | ECC | Pick the 5-8 most valuable patterns, not the full framework |
| Full autonomous loop | autoresearch | Great for research, dangerous for production code. Offer as opt-in |
| Party Mode | BMAD | Fun but token-expensive. Council is more focused |
| Skill marketplace | v0/SkillsMP | Premature. Build great default skills first |

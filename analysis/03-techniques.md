# 3. Technique Deep-Dive — The 20 Most Impactful Techniques

> Ranked by impact potential for our toolkit

---

## Tier 1: Game-Changers (adopt immediately)

### T1. Anti-Rationalization Tables (Superpowers)
**What:** Every skill contains a table mapping excuses LLMs use to skip steps, with explicit counter-arguments. Built empirically by pressure-testing agents WITHOUT the skill and documenting verbatim rationalizations.

**Evidence:** Meincke et al. 2025 showed persuasion techniques doubled LLM compliance (33% to 72%, p < .001) across 28K conversations.

**Why it matters:** Our skills say "do not skip verification steps" but don't anticipate HOW the LLM will try to skip. Superpowers anticipates and blocks 11 specific excuses per skill.

**Effort:** Medium. Requires testing each skill under pressure to discover rationalizations.

### T2. Sub-Agent Context Isolation (GSD / Superpowers)
**What:** Each task gets a fresh sub-agent with clean 200K context window. No context rot from accumulated conversation.

**Evidence:** GSD's architecture directly solves "context rot" — the #1 quality degradation cause cited by multiple practitioners. Superpowers uses fresh subagent per task with 2-stage review.

**Why it matters:** In long sessions, our agent accumulates context and quality degrades after 3-5 files changed (Microsoft Research 2024). Fresh context per task eliminates this.

**Effort:** Low-Medium. Claude Code supports Agent tool natively.

### T3. Progressive Disclosure Memory (claude-mem)
**What:** 3-layer search: (1) compact semantic indices (~50-100 tokens), (2) chronological timeline for selected results, (3) full details (~500-1000 tokens) only for specific IDs. Achieves ~10x token savings.

**Why it matters:** Our agentmemory injects full context at session start. Progressive disclosure lets us inject 10x more history in the same token budget.

**Effort:** Medium. Requires refactoring agentmemory integration.

### T4. Search-First Before Writing (ECC)
**What:** Before writing ANY code, search: repo internals, npm/PyPI, MCP servers, skills directory, GitHub. Decision matrix: Adopt / Extend / Compose / Build. "Jumping to code" is an anti-pattern.

**Why it matters:** AI tends to reinvent what already exists. Forcing search-first prevents unnecessary code and leverages existing solutions.

**Effort:** Low. Add to /build skill instructions.

### T5. Static Spec Validation (OpenSpec)
**What:** `openspec validate` runs static checks on spec files: verifies scenario presence, header format, normative terminology. Acts as "compilation step before coding."

**Why it matters:** Our --complete just shows a checklist. OpenSpec actually validates spec structure. Machine-checkable > advisory checklist.

**Effort:** Medium. Build a spec validator into gate-check.mjs.

---

## Tier 2: Major Improvements (adopt in next iteration)

### T6. Deletion Enforcement for TDD (Superpowers)
**What:** Code written before its test gets DELETED entirely. Not adapted, not kept as reference, not looked at. "Delete means delete."

**Why it matters:** Creates a real cost for violating TDD, not just a warning. The most effective TDD enforcement in any framework.

**Effort:** Low. Add to /test and /build skill instructions.

### T7. Santa Method — Dual Adversarial Review (ECC)
**What:** Generator produces output. Two independent reviewers (no shared context) evaluate against identical rubric. BOTH must pass. Max 3 iterations then escalate to human.

**Why it matters:** Single reviewers have blind spots. Two independent reviewers with no shared context catch different issues. Used for security-critical code.

**Effort:** Medium. Implement as optional mode for /review.

### T8. Prompt Injection Detection (GSD)
**What:** `gsd-prompt-guard.js` scans writes to planning artifacts for embedded injection vectors. Planning files become LLM system prompts — poisoning them is an attack vector.

**Evidence:** Snyk ToxicSkills study: 36% of 3,984 public skills contained prompt injection (cited by ECC).

**Why it matters:** Our .claude/workflow/ files and SKILL.md files are consumed as LLM context. Malicious content in these files = prompt injection.

**Effort:** Medium. Add scanning hook for planning artifacts.

### T9. Circuit Breaker (Cursor)
**What:** "Do NOT loop more than 3 times on fixing linter errors on the same file." Prevents infinite fix loops.

**Why it matters:** AI can get stuck in fix loops during /build and /test. A circuit breaker prevents wasting tokens and time.

**Effort:** Low. Add to pre-tool-use hook or skill instructions.

### T10. Instinct-Based Learning (ECC)
**What:** Sessions convert into "instincts" — atomic learned behaviors with confidence scores (0.3-0.9). Project-scoped. `/evolve` clusters instincts into skills. `/promote` elevates to global.

**Why it matters:** Our agentmemory stores observations but doesn't convert them into actionable behaviors. Instincts bridge memory to action.

**Effort:** High. Requires new learning system.

---

## Tier 3: Valuable Additions (adopt when ready)

### T11. Council — Four-Voice Decision Framework (ECC)
**What:** Architect (correctness), Skeptic (assumptions), Pragmatist (shipping), Critic (failures). Anti-anchoring: each voice gets only the question, not full context.

### T12. Model Routing (ECC)
**What:** Haiku for search/exploration, Sonnet for multi-file implementation, Opus for architecture/security.

### T13. Party Mode — Multi-Agent Roundtable (BMAD)
**What:** All agents active in single conversation. They debate, disagree, build on each other's ideas.

### T14. AI Adversarial Critique of Specs (Harper Reed)
**What:** After spec is written, AI role-plays as critic finding holes, missing edge cases, bad assumptions.

### T15. Constraint-as-Safety (autoresearch / Karpathy)
**What:** By constraining to 1 file, 1 metric, no new deps — the agent can run truly unsupervised. Safety from constraints, not permissions.

### T16. De-Sloppify Pattern (ECC)
**What:** Instead of constraining one agent ("don't do X"), add a second cleanup agent pass. Two focused agents outperform one constrained agent.

### T17. PRFAQ — Amazon-Style Backward Working (BMAD)
**What:** Write the press release and FAQ for the feature BEFORE building it. Forces product thinking.

### T18. JIT Rule Loading (Cursor Memory Bank)
**What:** Load rules just-in-time instead of all at once. Reduces context window usage from 70% to 15-20%.

### T19. Brownfield Delta Specs (OpenSpec)
**What:** Changes specify only ADDED/MODIFIED/REMOVED relative to existing specs. Merged atomically at archive time.

### T20. Git-as-Experiment-Tracker (autoresearch)
**What:** Each experiment is a commit. Success advances branch, failure gets git reset. Branch IS the experiment history.

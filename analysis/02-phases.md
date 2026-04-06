# 2. Phase-by-Phase Comparison — Who Does Each Phase Best?

> For each development phase, which framework has the best approach and why

---

## 2.1 IDEATION / EXPLORATION

| Framework | Approach | Strength | Weakness |
|-----------|----------|----------|----------|
| **Superpowers** | brainstorming skill: Socratic questioning, 9-step checklist, design-before-implementation gate | Hard gate: never implement before design approval. "Too simple for design" explicitly rejected | Rigid — even trivial ideas go through process |
| **agent-skills** | idea-refine: HMW statement, 5-8 variations via lenses, "Not Doing" list | "Not Doing" list is unique — forces explicit trade-offs | Less rigorous enforcement |
| **BMAD** | Analyst agent (Mary) + PRFAQ exercise (Amazon-style backward working) | PRFAQ is powerful for product discovery | Heavy process for small features |
| **OpenSpec** | `/opsx:explore` — investigation without commitment | Zero-cost exploration; no artifacts until you decide | No structured divergent thinking |
| **Miessler** | "Generate then curate" — AI produces 3 candidates | Fast for option generation | No deep analysis of trade-offs |
| **ECC** | Council (4-voice framework): Architect, Skeptic, Pragmatist, Critic | Anti-anchoring: each voice gets only the question, not conversation | Overhead for simple decisions |

**WINNER: Superpowers + ECC Council** — Socratic brainstorming for ideas, Council for architectural decisions.
**KEY TECHNIQUE TO ADOPT:** ECC's anti-anchoring (subagents don't see full context) + Superpowers' hard gate on design-before-implementation.

---

## 2.2 SPECIFICATION

| Framework | Approach | Strength | Weakness |
|-----------|----------|----------|----------|
| **agent-skills** | 6-section spec: objective, commands, structure, style, testing, boundaries (Always/Ask/Never) | Three-tier boundary system is practical and clear | No formal validation |
| **OpenSpec** | Formal normative language (SHALL/MUST) + Gherkin scenarios (GIVEN/WHEN/THEN) | Static validation (`openspec validate`); machine-checkable | Formal language can feel heavy |
| **BMAD** | PRD by PM agent (John) + Architecture by Architect (Winston) | Separate roles catch different concerns | Two documents to maintain |
| **GSD** | PROJECT.md + REQUIREMENTS.md with scoped feature IDs | Structured requirements with traceability | Natural language only |
| **GitHub Spec Kit** | Constitution > Specify with scoring/validation | Official GitHub backing; validates and scores specs | Young, less battle-tested |
| **Tessl** | Spec Registry (10K+ pre-built specs) | Reuse existing specs like npm packages | Vendor dependency |
| **Harper Reed** | AI critiques the spec, asks adversarial questions | Solves the "yes-man problem" | Manual, not automated |
| **AISP** | Mathematical notation from formal logic | Reduces LLM decision points from 40-65% to <2% | Steep learning curve |

**WINNER: OpenSpec format + Harper Reed critique + agent-skills boundaries**
- OpenSpec's SHALL/MUST + Gherkin gives machine-checkable specs
- Harper Reed's AI critique step catches blind spots
- agent-skills' Always/Ask/Never boundaries are practical

**KEY TECHNIQUE TO ADOPT:**
1. Static spec validation (from OpenSpec)
2. AI adversarial critique step (from Harper Reed)
3. Three-tier boundaries (from agent-skills)

---

## 2.3 PLANNING

| Framework | Approach | Strength | Weakness |
|-----------|----------|----------|----------|
| **Superpowers** | writing-plans: 2-5 min tasks, exact file paths, no pseudocode, reviewer subagent | Extreme precision; reviewer catches gaps | Can be over-prescriptive |
| **agent-skills** | planning-and-task-breakdown: vertical slices, XS-XL sizing, dependency graphs | Task sizing table (XS-XL) is actionable; "XL = too large, break down" | No automated plan review |
| **GSD** | 4 parallel research agents > synthesizer > PLAN.md | Parallel research waves discover more options | Heavy infrastructure |
| **BMAD** | Architect agent + story-level planning with Scrum Master | Well-structured for team environments | Overkill for solo dev |
| **RPI** | FACTS validation scale for plans | Measurable plan quality | Limited tooling |
| **ECC** | Ralphinho: RFC decomposition into dependency DAG | Formal DAG ensures correct ordering; merge queue with eviction | Complex setup |

**WINNER: Superpowers precision + agent-skills sizing + GSD parallel research**
- Superpowers' exact-file-paths + no-pseudocode rule eliminates ambiguity
- agent-skills' XS-XL sizing gives clear "too big" threshold
- GSD's parallel research agents discover angles a single agent misses

**KEY TECHNIQUE TO ADOPT:**
1. Plans must have exact file paths (from Superpowers)
2. Task sizing with XL = must split (from agent-skills)
3. Plan reviewer subagent (from Superpowers)
4. Parallel research before planning (from GSD)

---

## 2.4 BUILDING / IMPLEMENTATION

| Framework | Approach | Strength | Weakness |
|-----------|----------|----------|----------|
| **Superpowers** | subagent-driven-dev: fresh agent per task, 2-stage review (spec then quality) | Fresh context per task eliminates context rot | Overhead per task |
| **agent-skills** | incremental-implementation: vertical slices, contract-first, risk-first | 3 slicing strategies; feature flag guidance | No subagent isolation |
| **GSD** | Fresh 200K context per sub-agent task, atomic git commits | Solves context rot (the #1 quality degradation cause) | Infrastructure heavy |
| **autoresearch** | 1 file, 1 metric, 5-min experiments, git reset on failure | Radical simplicity; git-as-experiment-tracker | Only works for research |
| **ECC** | Search-first (search before ANY code); model routing (Haiku/Sonnet/Opus per task) | Prevents reinventing; right model for right task | Complex routing logic |
| **BMAD** | Developer agent (Amelia) implements stories sequentially | Clear story-by-story progression | Sequential only |
| **Cursor Memory Bank** | CREATIVE mode for design exploration + BUILD mode for implementation | Separates thinking from typing | Cursor-specific |

**WINNER: GSD sub-agent isolation + Superpowers 2-stage review + ECC search-first**
- GSD's fresh 200K context per task is the #1 technique for quality at scale
- Superpowers' 2-stage review (spec compliance THEN quality) catches different bugs
- ECC's search-first prevents unnecessary code

**KEY TECHNIQUE TO ADOPT:**
1. Fresh context per task (from GSD/Superpowers)
2. 2-stage review: spec compliance then code quality (from Superpowers)
3. Search before writing ANY code (from ECC)
4. Model routing: cheap for search, expensive for architecture (from ECC)
5. Atomic git commits per task (from GSD)

---

## 2.5 TESTING

| Framework | Approach | Strength | Weakness |
|-----------|----------|----------|----------|
| **Superpowers** | Iron Law: NO CODE WITHOUT FAILING TEST. Deletion enforcement. 11 rationalizations with rebuttals | Strongest TDD enforcement in any framework. Deletion is real cost for violation | Aggressive — some devs resist |
| **agent-skills** | Prove-it pattern for bugs, test pyramid (80/15/5), Beyonce Rule, DAMP over DRY | Google eng practices; comprehensive anti-pattern list | Softer enforcement |
| **ECC** | Eval-Driven Development (EDD): evals as "unit tests of AI dev"; pass@k vs pass^k | Novel: evals for AI-generated code quality, not just functionality | Specialized |
| **ECC** | Santa Method: dual independent adversarial review | Two reviewers with no shared context; both must pass | Expensive (2 extra agents) |
| **GSD** | `/gsd:verify-work` + security auditor agent | Dedicated security verification | Less TDD-focused |
| **Kent Beck** | Human writes tests, AI implements to pass them | Strongest correctness guarantee | Slower |

**WINNER: Superpowers TDD Iron Law + Kent Beck's human-tests-first + ECC Santa Method**
- Superpowers' deletion enforcement is the most effective TDD gate
- Kent Beck's human-writes-tests pattern is the gold standard for correctness
- ECC's Santa Method for critical paths (dual adversarial review)

**KEY TECHNIQUE TO ADOPT:**
1. Iron Law + deletion enforcement (from Superpowers)
2. Anti-rationalization table with 11 rebuttals (from Superpowers)
3. Human defines WHAT to test, AI writes tests, AI implements (from Kent Beck)
4. Santa Method for security-critical code (from ECC)

---

## 2.6 CODE REVIEW

| Framework | Approach | Strength | Weakness |
|-----------|----------|----------|----------|
| **agent-skills** | 5-axis review: correctness, readability, architecture, security, performance. Severity labels | Comprehensive axes; practical severity system | Single reviewer |
| **Superpowers** | 2-stage: spec compliance then code quality. Performative agreement banned | Banning "Great point!" forces genuine evaluation | Strict |
| **ECC** | Santa Method (dual adversarial) + Council (4-voice decisions) | Strongest verification: 2 independent reviewers + 4 architectural voices | Token-expensive |
| **BMAD** | Adversarial Review + Edge Case Hunter skills | Dedicated adversarial thinking | Advisory only |
| **GSD** | `/gsd:review` + `/gsd:secure-phase` | Includes security review | Less structured |

**WINNER: Superpowers 2-stage + agent-skills 5-axis + ECC Santa for critical paths**

**KEY TECHNIQUE TO ADOPT:**
1. Ban performative agreement (from Superpowers)
2. 5-axis review with severity labels (from agent-skills)
3. 2-stage: spec compliance BEFORE code quality (from Superpowers)
4. Santa Method for security/architecture reviews (from ECC)

---

## 2.7 SHIPPING / DEPLOYMENT

| Framework | Approach | Strength | Weakness |
|-----------|----------|----------|----------|
| **agent-skills** | shipping-and-launch: pre-launch checklist (6 categories), staged rollout, rollback thresholds | Most comprehensive launch checklist; quantitative rollback thresholds | Single-pass |
| **Superpowers** | verification-before-completion: "NO COMPLETION WITHOUT FRESH EVIDENCE" | Strongest verification gate; "I'm confident" is not acceptable | Narrow focus |
| **GSD** | `/gsd:ship` creates PRs, advances phases | Clean CI integration | Less deployment detail |
| **agent-skills** | ci-cd-and-automation: shift-left pipeline, feature flag lifecycle, staged rollouts | Full CI/CD guidance; build cop role | Framework-specific examples |
| **ECC** | Kill switches, dead-man switches, heartbeat patterns | Agent safety for autonomous loops | Specialized |

**WINNER: agent-skills launch checklist + Superpowers fresh-evidence verification + ECC safety patterns**

**KEY TECHNIQUE TO ADOPT:**
1. Pre-launch checklist with 6 categories (from agent-skills)
2. Fresh evidence verification before ANY completion claim (from Superpowers)
3. Quantitative rollback thresholds (from agent-skills)
4. Kill switches for autonomous operations (from ECC)

---

## 2.8 CROSS-CUTTING: MEMORY / PERSISTENCE

| Framework | Approach | Strength |
|-----------|----------|----------|
| **claude-mem** | 3-layer progressive disclosure (index > timeline > full details) | ~10x token savings |
| **ECC** | Instinct-based learning: sessions > instincts (with confidence) > skills | Continuous improvement across sessions |
| **GSD** | `.planning/STATE.md` + file-based persistence | Simple, reliable |
| **Cursor Memory Bank** | JIT rule loading, reduces context from 70% to 15-20% | Massive token savings |
| **Compound Engineering** | Errors become permanent improvement rules | Inverts the complexity curve |
| **autoresearch** | Git branch IS memory; results.tsv for metrics | Zero infrastructure |
| **Our toolkit** | agentmemory (port 3111) + local state files | Dual: local state + semantic search |

**KEY TECHNIQUE TO ADOPT:**
1. Progressive disclosure 3-layer (from claude-mem)
2. Instinct-based learning with confidence scores (from ECC)
3. JIT rule loading to minimize context (from Cursor Memory Bank)
4. Errors-as-permanent-improvement pattern (from Compound Engineering)

---

## 2.9 CROSS-CUTTING: ENFORCEMENT

| Framework | Mechanism | Strength |
|-----------|-----------|----------|
| **GSD** | 9 hooks including prompt-injection detection | Most comprehensive enforcement |
| **Our toolkit** | PreToolUse blocks Write/Edit without spec+plan | Simple, effective |
| **Superpowers** | Anti-rationalization + deletion + 1% rule | Behavioral enforcement (persuasion) |
| **OpenSpec** | Static validation (`openspec validate`) | Machine-checkable specs |
| **ECC** | AgentShield + kill switches + dead-man switches | Agent security |
| **Cursor** | Linter error circuit breaker (max 3 attempts) | Prevents infinite loops |
| **PULSE** | 30-minute rule + time-boxed work | Prevents time waste |

**KEY TECHNIQUE TO ADOPT:**
1. Anti-rationalization tables in every skill (from Superpowers)
2. Prompt injection detection on planning artifacts (from GSD)
3. Circuit breaker: max 3 fix attempts per file (from Cursor)
4. Time-boxing for long operations (from PULSE)

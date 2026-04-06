# 5. Scalability Gaps — What Breaks at Scale

> Analysis of what prevents our toolkit from scaling to larger projects, teams, and autonomous operations

---

## 5.1 Context Scalability

**Problem:** In sessions longer than ~30 minutes or changes touching >5 files, AI output quality degrades. Microsoft Research 2024 confirmed this. GSD calls it "context rot."

**Current state:** Our /work command runs phases sequentially in a single conversation. By the time we reach /build, the context window is loaded with spec, plan, and conversation history.

**What the leaders do:**
- **GSD:** Fresh 200K context per sub-agent task. Each task gets only the relevant slice of the plan.
- **Superpowers:** Fresh subagent per task. Reviewer subagents also get fresh context.
- **ECC:** Model routing (Haiku for search, Opus for architecture). Keeps cheap tasks cheap.
- **Cursor Memory Bank:** JIT rule loading reduces context from 70% to 15-20%.
- **RPI Strategy:** "Dumb Zone" warning at >40% context usage.

**Gap:** We have no sub-agent isolation, no context monitoring, and no model routing.

---

## 5.2 Quality Scalability

**Problem:** As projects grow, "spec done" and "plan done" checkboxes don't guarantee quality. Our validation is advisory (VALIDATION_HINTS shown but not enforced).

**What the leaders do:**
- **OpenSpec:** `openspec validate` — static structural validation of specs. Machine-checkable.
- **Superpowers:** Anti-rationalization tables prevent LLM shortcuts. Pressure-tested empirically.
- **ECC:** Santa Method — dual independent adversarial review for critical paths.
- **ECC:** Eval-Driven Development — evals as unit tests for AI output quality.
- **GitHub Spec Kit:** Scoring and tracing of specifications.

**Gap:** We show a checklist; we don't validate. We don't have anti-rationalization. We don't have adversarial review.

---

## 5.3 Enforcement Scalability

**Problem:** Our PreToolUse hook checks spec+plan for Write/Edit. But it doesn't check:
- Is the code within the planned scope?
- Is there a test for this change?
- Is this file part of the plan?
- Is the change touching security-sensitive code?

**What the leaders do:**
- **GSD:** 9 hooks covering prompt injection, phase boundaries, file reads, commits, context monitoring, session state.
- **Superpowers:** Behavioral enforcement via anti-rationalization + 1% invocation rule.
- **ECC:** AgentShield for scanning skills; kill switches for autonomous loops.
- **Cursor:** Circuit breaker (max 3 fix attempts per file).
- **PULSE:** 30-minute time-box with automatic checkpoint reminders.

**Gap:** We have 1 enforcement hook. GSD has 9. We don't detect scope creep, missing tests, or security-sensitive changes.

---

## 5.4 Memory Scalability

**Problem:** agentmemory (port 3111) stores observations but:
- Requires a running service (network dependency for history)
- Full context injection (no progressive disclosure)
- No learning from past mistakes (same errors repeat)
- No cross-project knowledge transfer

**What the leaders do:**
- **claude-mem:** 3-layer progressive disclosure (~10x token savings).
- **ECC:** Instinct-based learning — sessions become atomic behaviors with confidence scores.
- **Compound Engineering:** Errors become permanent improvement rules.
- **GSD:** File-based state (STATE.md) + no service dependency.
- **autoresearch:** Git branch IS the memory. Zero infrastructure.

**Gap:** Our memory is either too heavy (agentmemory service) or too simple (local JSON). We need progressive disclosure and learning.

---

## 5.5 Autonomy Scalability

**Problem:** Our workflow requires human invocation at every phase (/spec, /plan, /build, etc.). For autonomous or semi-autonomous operation, this doesn't scale.

**What the leaders do:**
- **autoresearch:** "Never stop" — fully autonomous with git reset as safety net.
- **Ralph Wiggum/Loop:** Continuous autonomous loop with intelligent exit detection.
- **GSD v2:** Auto-advance through milestones, crash recovery, stuck-loop detection.
- **ECC:** NanoClaw REPL (session-aware persistent loop) + completion signals.
- **Refly:** Intervenable runtime — autonomous but pausable/re-steerable mid-execution.

**Gap:** Our /work auto-detects next phase but still requires human invocation. No autonomous loop, no crash recovery, no stuck detection.

---

## 5.6 Team Scalability

**Problem:** Our toolkit is single-developer focused. No support for:
- Multiple developers working on same project
- Shared skill customization
- Team conventions enforcement
- Cross-session knowledge sharing between team members

**What the leaders do:**
- **Refly:** Skill Registry with version control, team sharing, RBAC governance.
- **GSD:** Model profiles (quality/balanced/budget) per team/budget.
- **BMAD:** Module marketplace for team-specific extensions.
- **v0 skills.sh:** 34K+ community skills with sharing.
- **Continue.dev:** Source-controlled checks shared via PRs.

**Gap:** Skills are local files. No sharing, no versioning, no team governance.

---

## 5.7 Summary: Scalability Gap Priorities

| Gap | Severity | Fix Complexity | Impact if Fixed |
|-----|----------|---------------|----------------|
| **Context rot (no sub-agent isolation)** | Critical | Medium | Eliminates #1 quality degradation cause |
| **No anti-rationalization** | Critical | Medium | Doubles LLM compliance per research |
| **Advisory-only validation** | High | Medium | Machine-checkable specs vs checkboxes |
| **Single enforcement hook** | High | Medium | Catches scope creep, missing tests, security |
| **Full-blast memory injection** | Medium | Medium | 10x token savings |
| **No autonomous loop** | Medium | High | Enables overnight/background work |
| **No team features** | Low (for now) | High | Required for team adoption |

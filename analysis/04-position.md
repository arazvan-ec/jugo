# 4. Our Position Analysis — Where We Stand

> Honest assessment of agent-toolkit vs the competition

---

## 4.1 What We Have That Others Don't

| Feature | Details | Who else has it? |
|---------|---------|-----------------|
| **Hard PreToolUse gates** | Write/Edit blocked until spec+plan done | Only GSD (workflow-guard). BMAD/OpenSpec/Superpowers don't block tools |
| **Fail-closed gate** | If state can't be read, action blocked (not allowed) | Nobody. GSD fails open. Superpowers has no runtime gates |
| **Audited skip-gate** | Bypass with permanent audit trail | Nobody has formal bypass-with-audit |
| **Reopen/amendment** | Go back to a phase without destroying progress | Nobody. All others require reset |
| **Phase versioning** | spec v1 > v2 > v3 tracked | Nobody else tracks phase versions |
| **Local-first state** | .claude/workflow/<feature>.json, no network dependency | GSD uses STATE.md (similar). Others need services running |
| **Per-feature isolation** | Each feature has its own state file | OpenSpec has per-change isolation (similar concept) |

## 4.2 What We're Missing (Critical Gaps)

| Gap | Impact | Who does it well? | Priority |
|-----|--------|-------------------|----------|
| **No anti-rationalization tables** | LLM finds creative ways to skip steps | Superpowers (every skill has one) | CRITICAL |
| **No sub-agent isolation** | Context rot after 3-5 files | GSD (200K fresh per task), Superpowers (subagent-driven-dev) | CRITICAL |
| **No search-first mandate** | AI reinvents existing solutions | ECC (search before ANY code) | HIGH |
| **No static spec validation** | "spec done" = checkbox, not quality | OpenSpec (machine-checkable), GitHub Spec Kit (scoring) | HIGH |
| **No TDD enforcement with teeth** | /test is advisory, not enforced | Superpowers (deletion enforcement) | HIGH |
| **No prompt injection protection** | Planning artifacts could be poisoned | GSD (prompt-guard hook) | HIGH |
| **No circuit breaker** | Agent can loop forever on fix attempts | Cursor (max 3 per file) | MEDIUM |
| **No model routing** | Uses same model for search and architecture | ECC (Haiku/Sonnet/Opus per task) | MEDIUM |
| **No progressive disclosure memory** | Full context injection | claude-mem (3-layer, 10x savings) | MEDIUM |
| **No adversarial spec review** | Spec accepted at face value | Harper Reed (AI critique), BMAD (edge case hunter) | MEDIUM |
| **No continuous learning** | Same mistakes repeated across sessions | ECC (instincts), Compound Engineering | LOW |
| **No formal normative specs** | Natural language specs are ambiguous | OpenSpec (SHALL/MUST + Gherkin) | LOW |

## 4.3 Competitive Position Matrix

Rating: 1-5 (1=missing, 3=adequate, 5=best-in-class)

| Dimension | Us | Superpowers | GSD | BMAD | OpenSpec | ECC |
|-----------|-----|-------------|-----|------|---------|-----|
| **Gate enforcement** | 5 | 3 | 4 | 2 | 1 | 3 |
| **TDD rigor** | 2 | 5 | 3 | 3 | 2 | 4 |
| **Spec quality** | 2 | 3 | 3 | 4 | 5 | 3 |
| **Planning precision** | 2 | 5 | 4 | 4 | 3 | 3 |
| **Build safety** | 3 | 4 | 5 | 3 | 3 | 4 |
| **Context management** | 2 | 3 | 5 | 4 | 4 | 5 |
| **Memory/persistence** | 3 | 2 | 3 | 3 | 3 | 5 |
| **Review thoroughness** | 3 | 5 | 3 | 4 | 3 | 5 |
| **Ship safety** | 3 | 4 | 3 | 3 | 2 | 4 |
| **Scalability** | 2 | 4 | 5 | 4 | 4 | 5 |
| **Ease of use** | 4 | 3 | 2 | 2 | 3 | 2 |
| **TOTAL** | 31/55 | 41/55 | 40/55 | 36/55 | 33/55 | 43/55 |

## 4.4 Our Strengths to Preserve

1. **Simplicity** — One install, few dependencies. GSD has 61 commands; we have ~25. BMAD has 6 agent personas. We have /work.
2. **Hard gates that actually block** — Nobody else blocks the Write tool. This is our unique enforcement.
3. **Fail-closed behavior** — Security-first: if in doubt, block.
4. **Iteration without reset** — --reopen is unique and valuable.
5. **Audited bypasses** — /skip-gate with permanent record.

## 4.5 Key Insight

We're **#1 in enforcement** but **below average in everything else**. The path forward is clear: keep our enforcement advantage, adopt the best techniques from each competitor for the phases where we're weak.

Our biggest risk: GSD is the only competitor with real hook-based enforcement AND better context management, memory, and tooling. If GSD adds fail-closed behavior and audited bypasses, they would strictly dominate us.

Our biggest opportunity: combine our enforcement with Superpowers' anti-rationalization, GSD's context isolation, ECC's learning, and OpenSpec's validation. No single competitor has all of these.

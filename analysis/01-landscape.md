# 1. Landscape Map — AI Development Workflow Frameworks

> 60+ frameworks, tools, and methodologies mapped by category

---

## 1.1 Major Workflow Frameworks (>10K stars)

| Framework | Stars | Creator | Philosophy | Phases | Enforcement | Target |
|-----------|-------|---------|-----------|--------|-------------|--------|
| **everything-claude-code** | 140K | affaan-m | Comprehensive: 38 agents, 161 skills, 72 commands | Agent-first routing | Hooks + adversarial review | Claude Code, Codex, Cursor |
| **Superpowers** | 136K | Jesse Vincent (obra) | Persuasion psychology on LLMs | Brainstorm > Plan > TDD Build > Review > Ship | Anti-rationalization tables, deletion enforcement, 1% rule | Claude Code, OpenCode, Codex |
| **autoresearch** | 66K | Andrej Karpathy | Radical constraint-based autonomy | Loop: modify > run > evaluate > keep/reset | Single metric + git reset on failure | Claude Code (research) |
| **GSD** | 48K | TACHES | Context engineering + execution | Init > Discuss > Plan > Execute > Verify > Ship | 9 real hooks (prompt-guard, workflow-guard, phase-boundary) | Claude Code |
| **claude-mem** | 45K | thedotmack | Progressive disclosure memory | N/A (memory layer) | 3-layer search (index > timeline > full) | Claude Code |
| **BMAD** | 43K | bmad-code-org | Agent personas + docs-as-source-of-truth | Analysis > Planning > Solutioning > Implementation | Advisory readiness gate (no hooks) | Claude Code, Cursor |
| **awesome-cursorrules** | 38K | PatrickJS | Constraint collections per stack | N/A (rules layer) | Per-project .cursorrules | Cursor |
| **OpenSpec** | 37K | Fission-AI (YC) | Specs as persistent asset, brownfield-first | Propose > Spec > Design > Tasks > Apply > Archive | Static validation (`openspec validate`), no blocking | 20+ AI tools |
| **awesome-claude-code** | 36K | hesreallyhim | Curated ecosystem directory | N/A (meta) | N/A | Claude Code |
| **Goose** | 27K | Block/Square | Open-source extensible agent | Recipes (YAML workflows) | MCP-based | Terminal, any LLM |
| **VoltAgent** | 14K | VoltAgent | Curated official dev team skills | N/A (1060+ skills) | N/A | Multi-platform |

## 1.2 Mid-Tier Frameworks (1K-10K stars)

| Framework | Stars | Philosophy | Unique Contribution |
|-----------|-------|-----------|---------------------|
| **refly-ai** | 7K | Vibe workflow builder | Intervenable runtime (pause/re-steer mid-execution), skill registry |
| **GStack** (Garry Tan) | ~10K | Role-based personas (CEO, Designer, Eng, QA) | YC president's workflow; persona-switching via commands |
| **GitHub Spec Kit** | ~5K | Official GitHub spec-first | Constitution > Specify > Plan > Tasks > Implement; validates/scores specs |
| **Cursor Memory Bank** | 3K | JIT rule loading | Reduces context from 70% to 15-20%; CREATIVE mode (Anthropic Think tool) |
| **OpenAgentsControl** | 3K | Plan-first with approval gates | ContextScout pattern discovery; multi-language |
| **agent-skills** (Osmani) | 3.4K | Google eng culture codified | 19 skills, Hyrum's Law, Beyonce Rule, Chesterton's Fence, OWASP |

## 1.3 Emerging / Niche Frameworks (<1K stars)

| Framework | Stars | Unique Angle |
|-----------|-------|-------------|
| **n8n-as-code** | 639 | 537 automation nodes + 7700 templates for AI agents |
| **spec_driven_develop** | 603 | Single SKILL.md file, platform-agnostic |
| **AI Maestro** | 589 | Dashboard for managing Claude/Codex, agent-to-agent messaging |
| **Orchestrator-Supaconductor** | 309 | Board of Directors pattern, bundled Superpowers |
| **AGENT-ZERO** | 163 | Single canonical AGENTS.md guide |
| **ContextKit** | 163 | 4-phase planning (discover, design, plan, build) |
| **AISP** | 136 | Mathematical notation for specs, <2% LLM decision points |
| **ANWS** | 135 | Spec-driven for Google Antigravity IDE |
| **AIWG** | 104 | Multi-platform SDLC (Claude, Codex, Copilot, Cursor, Factory, Warp, Windsurf) |
| **closedloop-ai** | 83 | LLM quality judges + self-learning |
| **Dossier** | 72 | Visual planning + context control per feature |
| **AAMAD** | 44 | Context engineering for multi-agent apps |
| **Co-OmniSpec** (ZTE) | 42 | Bidirectional spec workflows (forward + reverse) |
| **CCJK** | 40 | "Cognitive Enhancement Engine" |
| **PULSE** | 28 | 30-minute rule, loop detection, time-boxed work |
| **bkit** | 16 | PDCA (Plan-Do-Check-Act) for AI |
| **SpecPact** | 13 | Tiered workflows (nano/feature/system) |

## 1.4 Commercial / IDE-Native Tools

| Tool | Creator | Model | Key Differentiator |
|------|---------|-------|--------------------|
| **Amazon Kiro** | AWS | Full IDE with spec workflow | Agent Hooks on file-save; native spec > design > tasks |
| **Tessl** | Tessl (Series A) | Spec Registry platform | 10K+ pre-built specs (like npm for agent context); vibe-specs |
| **Windsurf/Cascade** | Codeium → Cognition | AI-native IDE | trajectory_search across sessions; $82M ARR; acquired by Devin |
| **Devin** | Cognition AI | Autonomous AI engineer | Full autonomy; 14/20 task failures in real tests |
| **Google Antigravity** | Google | Agentic platform | Manager Surface for spawning/observing multiple agents |
| **v0** | Vercel | AI-first dev platform | skills.sh marketplace (34K+ skills); 3200 PRs merged/day |
| **Cline** | Cline | VS Code agent | Plan mode (strategy) separated from Act mode (execution) |
| **Continue.dev** | Continue | CLI for PR checks | Source-controlled markdown checks as GitHub status checks |
| **Aider** | Paul Gauthier | Terminal pair programmer | Deep git integration; repo map of function signatures |

## 1.5 Methodologies (Blog Posts / Thought Leadership)

| Author | Methodology | Core Insight |
|--------|------------|-------------|
| **Harper Reed** | Waterfall-in-15-min | Spec > AI critique > chunks > execution; ~80% AI code at his company |
| **Kent Beck** | Augmented Coding | "AI is my intern"; TDD as superpower; spend MORE time thinking |
| **Simon Willison** | Agentic Engineering | Coined the term; 77+ apps by prompting; collect patterns |
| **Martin Fowler** | SDD Taxonomy | 3 types: spec-first, spec-anchored, spec-as-source |
| **Compound Engineering** | Error-driven learning | Each mistake becomes permanent improvement; inverts complexity curve |
| **Ralph Wiggum/Loop** | Autonomous loop | Continuous dev loop with intelligent exit detection |
| **RPI Strategy** | Research > Plan > Implement | FAR/FACTS validation scales; "Dumb Zone" (>40% context = degraded) |
| **AWS AI-DLC** | AI-Driven Dev Lifecycle | Full SDLC embedding AI into every phase |
| **swyx** | Agent Engineering | "Rise of the AI Engineer"; scaling without slop |

## 1.6 Academic Research

| Paper / Source | Key Finding |
|---------------|-------------|
| Microsoft Research 2024 | AI gains concentrated in boilerplate, not architecture |
| Google Internal Study 2024 | Implementation faster, debugging time increased |
| GitClear Study 2024 | Code churn +39% in AI-heavy codebases |
| Meincke et al. 2025 | Persuasion techniques doubled LLM compliance (33% > 72%) |
| ACM TOSEM 2025 | "SE by and for Humans in an AI Era" |
| DFKI 2025 | "Generative AI in Software Engineering" |
| arXiv 2026 | "Spec-Driven Development: From Code to Contract" |

## 1.7 Key Marketplaces

| Platform | Scale |
|----------|-------|
| SkillsMP | 700K+ agent skills |
| SkillHub | 7K+ AI-evaluated skills |
| v0 skills.sh | 34K+ community skills |
| VoltAgent | 1060+ official vendor skills |
| ClaudeMarketplaces | Curated plugins |

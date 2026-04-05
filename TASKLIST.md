# Agent Toolkit — Plan de Mejoras

> Ultima actualizacion: 2026-04-05
> Estado global: IMPLEMENTADO (v2)
> Origen: Revision socratica de decisiones de diseno

---

## Contexto

Este toolkit combina dos repos open source:
- **[agent-skills](https://github.com/addyosmani/agent-skills)** (Addy Osmani) — 19 skills de ingenieria como markdown
- **[agentmemory](https://github.com/rohitg00/agentmemory)** (rohitg00) — Memoria persistente para agentes con MCP, BM25+vector search, knowledge graph

La integracion anade:
- **Workflow gates** (PreToolUse hook) que bloquean Write/Edit sin spec+plan
- **Slash commands** que mapean a skills y registran completitud de fases
- **Hooks** que capturan observaciones y persisten estado cross-session

Tras una revision socratica se identificaron 8 problemas de diseno. Este documento registra el estado de cada uno.

---

## Resumen de implementacion

| Problema | Estado | Solucion implementada |
|----------|--------|-----------------------|
| P3: Fail-open | DONE | Fail-closed: si no se puede leer estado, se bloquea. Local file es primary |
| P5: Doble fuente de verdad | DONE | `.claude/workflow/<feature>.json` es THE source of truth. agentmemory es async history |
| P6: Estado como memoria semantica | DONE | Eliminado `WORKFLOW_STATE:` smart-search. Estado = JSON local. Historia = agentmemory |
| P2: Waterfall rigido | DONE | `--reopen <phase>`: marca downstream como needs-review. Amendment versioning |
| P4: Demasiados commands | DONE | `/work` meta-orchestrator. Primary commands: work, workflow, new-feature, skip-gate, recall, remember |
| P1: Gates sin validacion | DONE | `VALIDATION_HINTS` por fase. Checklist mostrado en --complete |
| P7: Recarga de skills | DONE | Carga condicional en slash commands: full read 1a vez, checklist despues |
| P8: /idea opcional | DONE | Soft warning en /spec si idea no fue completada. Brainstorm integrado en spec |

---

## P3: Fail-open en el gate

### Tareas

- [x] **P3.1** Trade-off fail-open vs fail-closed
  - Decision: **fail-closed**. Si gate-check.mjs falla, exit 2 (bloquea). Solo para gate checks, no para management commands.

- [x] **P3.2** Cache local como fallback real
  - Eliminado TTL de 30s. El fichero local se lee SIEMPRE, sin expiracion.

- [x] **P3.3** Fichero local como source of truth primaria
  - `.claude/workflow/<feature>.json` = estado real
  - agentmemory = log de transiciones (async, fire-and-forget)

- [x] **P3.4** gate-check.mjs lee SIEMPRE del fichero local
  - `readState()` lee sync del fichero. Sin fetch a agentmemory para estado.
  - `logToMemory()` es async fire-and-forget para historial.

- [x] **P3.5** Eliminada doble fuente de verdad
  - Estado: fichero JSON local
  - Historial: agentmemory (tipo `workflow_transition`)

- [x] **P3.6** Warning en SessionStart si agentmemory no responde
  - session-start.sh muestra warning + comando para arrancar

---

## P5: Cache local vs agentmemory

- [x] **P5.1** Fichero local primary, agentmemory sync → confirmado
- [x] **P5.2** Medir latencia → no aplica, ya no se usa agentmemory para estado
- [x] **P5.3** Sync bidireccional → simplificado: local write + async logToMemory()
- [x] **P5.4** KV endpoints → no necesarios, estado es local
- [x] **P5.5** state.json en proyecto → SI: `.claude/workflow/<feature>.json`

---

## P6: Estado como memoria semantica

- [x] **P6.1** Endpoints exactos → no necesarios para estado, solo para historial
- [x] **P6.2** Separado estado (JSON local) de historial (agentmemory)
- [x] **P6.3** Formato historial: tipo `workflow_transition` con titulo descriptivo
- [x] **P6.4** Eliminado patron `WORKFLOW_STATE:` de gate-check.mjs
- [x] **P6.5** Test multi-feature: cada feature tiene su propio .json

---

## P2: Iteracion sin reset

- [x] **P2.1** Modelo de estados con transiciones validas
  - Estados: pending, in-progress, done, needs-review, skipped
  - ship no se puede reopen

- [x] **P2.2** Actions de agentmemory → postergado, no necesario para v2
- [x] **P2.3** Regla de regresion
  - Reopen marca downstream como `needs-review`
  - No invalida build/test (el codigo sigue ahi)

- [x] **P2.4** Amendment versioning
  - Cada --complete incrementa version
  - `{ status: 'done', version: 2, ts: ... }`

- [x] **P2.5** --reopen implementado en gate-check.mjs
  - `reopenPhase()` con logica de downstream afectado

- [x] **P2.6** Sketches → postergado para v3

---

## P4: Reducir commands

- [x] **P4.1** Meta-command /work creado
  - Lee estado, determina siguiente fase, carga skill correspondiente

- [x] **P4.2** Descubrimiento → los commands siguen siendo slash commands para discoverability
- [x] **P4.3** Agrupacion: 6 primary + 7 phases + 12 support
- [x] **P4.4** Tier 2 siguen siendo slash commands (el usuario puede invocarlos directamente)
- [x] **P4.5** /work.md creado con logica de auto-deteccion

- [x] **P4.6** Support commands contextuales → postergado para v3

---

## P1: Validacion de calidad

- [x] **P1.1** Exit criteria extraidos de SKILL.md pattern
- [x] **P1.2** Prompt hooks → postergado, se usa checklist advisory por ahora
- [x] **P1.3** Agent hooks → postergado para v3
- [x] **P1.4** Schema minimo por fase → `VALIDATION_HINTS` en gate-check.mjs
- [x] **P1.5** Validacion en --complete (no en cada PreToolUse)
  - `--validate <phase>` para dry-run
  - Checklist mostrado en consola al completar

- [x] **P1.6** Decision: advisory checklist (no LLM judge por ahora)
  - v3: LLM judge automatico con fallback a pregunta al usuario

---

## P7: Recarga de skills

- [x] **P7.1-P7.5** Carga condicional implementada en todos los slash commands
  - Instruccion: "If this is the first time loading... read full SKILL.md"
  - "If already loaded earlier... skip re-reading and use verification checklist"

---

## P8: /idea opcional

- [x] **P8.1** Leer SKILL.md → evaluado
- [x] **P8.2** Soft warning implementado en /spec
  - Si idea=pending, muestra warning + sugiere alternativas
- [x] **P8.3** Brainstorm integrado en /spec
  - "Before writing the spec, brainstorm at least 3 alternative approaches"
- [x] **P8.4** Por tipo de tarea → usuario decide (el warning es no-bloqueante)
- [x] **P8.5** ADR → documentado en este tasklist como decision

---

## Registro de decisiones

| Fecha | Decision | Contexto |
|-------|----------|----------|
| 2026-04-05 | Creado agent-toolkit v0.1 | Combina agent-skills + agentmemory + workflow gates |
| 2026-04-05 | Opcion 3 (hibrida) para gates | PreToolUse hard block + agentmemory contextual |
| 2026-04-05 | Identificados 8 problemas | Revision socratica de decisiones de diseno |
| 2026-04-05 | Prioridad: P3+P5+P6 primero | Son el mismo problema de estado/persistencia |
| 2026-04-05 | Implementados 8 problemas (v2) | gate-check.mjs reescrito, /work creado, commands actualizados |
| 2026-04-05 | Fail-closed | Si no se puede leer estado, se bloquea la accion |
| 2026-04-05 | Local file primary | .claude/workflow/<feature>.json es source of truth |
| 2026-04-05 | Advisory validation (no LLM) | Checklist por fase, mostrado en --complete |
| 2026-04-05 | /idea soft warning | Warning en /spec si idea no completada |
| 2026-04-05 | /work meta-orchestrator | Auto-detecta y ejecuta siguiente fase |

---

## Pendiente para v3

- [ ] LLM judge automatico para validacion de calidad (P1.2, P1.3)
- [ ] Support commands contextuales (auto-detect debug/security/etc) (P4.6)
- [ ] Sketches de agentmemory para exploracion (P2.6)
- [ ] Medir tokens por skill y optimizar si necesario (P7.4)
- [ ] ADR formal para decision de /idea (P8.5)

---

## Como recuperar esta tasklist

En una nueva sesion de Claude (web o Code):
```
/recall agent-toolkit tasklist
```

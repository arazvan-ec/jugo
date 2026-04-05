# Agent Toolkit — Plan de Mejoras

> Última actualización: 2026-04-05
> Estado global: INVESTIGACIÓN
> Origen: Revisión socrática de decisiones de diseño

---

## Contexto

Este toolkit combina dos repos open source:
- **[agent-skills](https://github.com/addyosmani/agent-skills)** (Addy Osmani) — 19 skills de ingeniería como markdown
- **[agentmemory](https://github.com/rohitg00/agentmemory)** (rohitg00) — Memoria persistente para agentes con MCP, BM25+vector search, knowledge graph

La integración añade:
- **Workflow gates** (PreToolUse hook) que bloquean Write/Edit sin spec+plan
- **Slash commands** que mapean a skills y registran completitud de fases
- **Hooks** que capturan observaciones y persisten estado cross-session

Tras una revisión socrática se identificaron 8 problemas de diseño. Este documento es el plan de investigación e implementación para cada uno.

---

## Orden de ejecución

| Prioridad | Grupo | Tareas | Razón |
|-----------|-------|--------|-------|
| 🔴 1 | P3 + P5 + P6 | 16 tareas | Son el mismo problema (estado/persistencia). Resolverlos juntos simplifica todo lo demás |
| 🟠 2 | P2 | 6 tareas | Sin iteración el workflow es waterfall y nadie lo usará en la práctica |
| 🟡 3 | P4 | 6 tareas | Reducir de 24 a ~5 commands mejora la experiencia inmediatamente |
| 🟢 4 | P1 | 6 tareas | Quality gates son el siguiente nivel después de que los basics funcionen |
| 🔵 5 | P7 | 5 tareas | Optimización de tokens — solo importa si es un bottleneck real |
| ⚪ 6 | P8 | 5 tareas | Decisión de diseño que se puede tomar después de usar el sistema |

---

## 🔴 P3: Fail-open en el gate

**Problema**: Si agentmemory no está corriendo, gate-check.mjs falla silenciosamente (exit 0) y todo pasa sin verificación. Un sistema de bloqueo que no bloquea cuando falla es inútil.

**Decisión clave**: ¿Fail-open o fail-closed?

### Tareas

- [ ] **P3.1** Investigar trade-off fail-open vs fail-closed
  - Fail-closed: el dev no puede trabajar sin agentmemory arrancado. Más seguro, más fricción
  - Fail-open: si falla, no hay protección. Menos fricción, menos valor
  - **Investigar**: ¿cómo lo resuelven otros sistemas? (GitButler hooks, Husky pre-commit)

- [ ] **P3.2** Investigar caché local como fallback real
  - Actualmente el caché se ignora si está "stale" (>30s)
  - **Cambio propuesto**: si el caché tiene estado, usarlo SIEMPRE aunque agentmemory esté caído
  - Solo crear estado nuevo requiere agentmemory (o aceptar defaults)

- [ ] **P3.3** Diseñar política: fichero local como source of truth primaria
  - `.claude/workflow/state.json` = el estado real
  - agentmemory = sync backend para cross-session y búsqueda semántica
  - **Esto invierte la jerarquía actual** (ahora agentmemory es primary)

- [ ] **P3.4** Prototipo: gate-check.mjs lee SIEMPRE del fichero local
  ```
  // Pseudo-lógica nueva:
  1. Leer .claude/workflow/state.json (sync, <1ms)
  2. Si no existe → crear default state → escribir fichero
  3. Evaluar gate contra el state local
  4. Si agentmemory está arriba → sync async en background
  5. Si agentmemory está caído → funcionar solo con local
  ```

- [ ] **P3.5** Eliminar doble fuente de verdad
  - El fichero local ES el estado
  - agentmemory almacena el log de transiciones (historial, no estado)
  - smart-search busca en historial, no en estado actual

- [ ] **P3.6** Añadir warning en SessionStart si agentmemory no responde
  - Inyectar como additionalContext: "⚠️ Memory server not running. Gates use local state. Run: ~/.agent-toolkit/scripts/start-memory.sh"

### Implementación estimada
- Modificar: `hooks/gate-check.mjs` (refactor lectura de estado)
- Modificar: `hooks/session-start.sh` (health check warning)
- Sin cambios en: slash commands, install.sh

---

## 🔴 P5: Caché local vs agentmemory — doble fuente de verdad

**Problema**: El estado vive en dos sitios que pueden desincronizarse. El caché tiene TTL de 30s pero eso no elimina el riesgo.

**Nota**: Se resuelve junto con P3. Si el fichero local es primary, no hay doble fuente de verdad.

### Tareas

- [ ] **P5.1** Decidir: fichero local primary, agentmemory sync
  - **Resolución esperada**: sí, se confirma con P3.3

- [ ] **P5.2** Medir latencia real de llamada a localhost:3111
  ```bash
  # Test a ejecutar:
  time curl -sf http://localhost:3111/agentmemory/livez
  # Si <50ms, el caché con TTL no aporta
  # Si >100ms, el fichero local como primary tiene sentido adicional
  ```

- [ ] **P5.3** Implementar sync bidireccional
  - Al completar una fase: escribir fichero local + POST a agentmemory (async)
  - Al arrancar sesión: leer fichero local + pedir a agentmemory "¿hay estado más reciente?" (por timestamp)
  - Conflicto: gana el más reciente por `updated` timestamp

- [ ] **P5.4** Investigar KV endpoints de agentmemory
  - ¿Existe un GET/PUT directo por key sin pasar por smart-search?
  - Si no, evaluar usar facet-tag como alternativa

- [ ] **P5.5** Evaluar: state.json en proyecto (.claude/) vs global (~/.agentmemory/)
  - En proyecto: permite que cada repo tenga su workflow. Se puede commitear o gitignorear
  - Global: un solo lugar, pero mezcla workflows de distintos proyectos
  - **Inclinación**: en proyecto (.claude/workflow/state.json), en .gitignore

### Implementación estimada
- Se implementa como parte de P3.4 (mismo refactor de gate-check.mjs)

---

## 🔴 P6: Estado de workflow guardado como "memoria" semántica

**Problema**: Buscar "WORKFLOW_STATE:" por smart-search es frágil. Con 50 features puede devolver el estado equivocado.

**Nota**: Se resuelve con P3+P5. Si el estado es un fichero JSON local, no necesita estar en agentmemory como "memoria".

### Tareas

- [ ] **P6.1** Investigar endpoints de agentmemory para queries exactas
  - mem::facet-tag: permite taggear por {project, feature} y hacer query AND/OR
  - Si existe, úsalo para el historial de transiciones (no para estado)

- [ ] **P6.2** Separar estado (JSON local) de historial (agentmemory)
  - **Estado**: `.claude/workflow/state.json` → machine-readable, gate-check lo lee
  - **Historial**: agentmemory → human-readable, "el 5 de abril se completó /spec para auth-system"
  - Cada --complete escribe al JSON local Y hace POST a agentmemory como observación de historial

- [ ] **P6.3** Diseñar formato del historial en agentmemory
  ```json
  {
    "type": "workflow_transition",
    "title": "Phase completed: spec (auth-system)",
    "content": "spec phase completed for feature auth-system. Output: PRD with 5 acceptance criteria, 3 boundary conditions.",
    "project": "/path/to/project"
  }
  ```
  - Esto es buscable semánticamente ("¿qué specs hemos hecho?") sin contaminar el estado

- [ ] **P6.4** Eliminar el patrón "WORKFLOW_STATE:" de gate-check.mjs
  - Reemplazar loadStateFromMemory() por lectura directa de fichero
  - Mantener saveStateToMemory() pero como log, no como state

- [ ] **P6.5** Test: crear 5 features distintas y verificar que no hay colisiones
  ```bash
  node gate-check.mjs --reset feature-a
  node gate-check.mjs --reset feature-b
  node gate-check.mjs --complete spec feature-a
  node gate-check.mjs --status feature-a  # spec: ✓
  node gate-check.mjs --status feature-b  # spec: ○ (no contaminado)
  ```

### Implementación estimada
- Modificar: `hooks/gate-check.mjs` (eliminar smart-search, usar fichero + historial)
- Sin cambios en: hooks de shell, slash commands

---

## 🟠 P2: Modelo waterfall rígido — no permite iteración

**Problema**: Si en /build descubres que la spec estaba mal, tienes que hacer /reset y empezar de cero. No hay forma de volver a una fase anterior sin perder progreso.

### Tareas

- [ ] **P2.1** Investigar modelo de estados con transiciones válidas
  ```
  Transiciones permitidas (no solo forward):
  build → spec    (descubrí que la spec estaba mal)
  build → plan    (falta un task que no preví)
  review → build  (el review encontró problemas)
  review → spec   (cambio fundamental de approach)
  test → build    (tests revelan bug de diseño)
  
  Transiciones bloqueadas:
  ship → *        (una vez shipped, es otro workflow)
  ```

- [ ] **P2.2** Investigar acciones de agentmemory reutilizables
  - mem::action-create tiene "typed dependencies" (requires, unlocks, gated_by)
  - mem::sketch-create tiene "ephemeral action graphs" para exploración
  - ¿Se puede mapear el workflow de fases a un grafo de actions?

- [ ] **P2.3** Diseñar regla de "regresión"
  ```
  Si reabres /spec desde /build:
  - spec → marked "in-progress" (reabierta)
  - plan → marked "needs-review" (puede necesitar cambios)
  - build → NO se invalida (el código sigue ahí)
  - test → marked "needs-review" (puede necesitar actualización)
  
  Principio: invalidar lo mínimo necesario, no destruir progreso.
  ```

- [ ] **P2.4** Diseñar concepto de "amendment"
  - /spec segunda vez no resetea, sino que crea spec v2
  - gate-check.mjs registra: `{ done: true, ts: ..., version: 2, amendedFrom: v1 }`
  - Historial en agentmemory: "spec reabierta y enmendada: cambiamos de REST a GraphQL"

- [ ] **P2.5** Prototipo: añadir --reopen a gate-check.mjs
  ```bash
  node gate-check.mjs --reopen spec
  # → spec: in-progress
  # → plan: needs-review  (downstream dependency)
  # → build: unchanged
  # → Write/Edit: siguen permitidos (spec existía antes)
  ```

- [ ] **P2.6** Investigar "sketches" de agentmemory para exploraciones
  - ¿Se pueden crear sub-workflows temporales para investigar sin comprometer el principal?
  - Ejemplo: "quiero probar si GraphQL funciona mejor antes de enmendar la spec"

### Implementación estimada
- Modificar: `hooks/gate-check.mjs` (añadir --reopen, lógica de regresión, versionado)
- Modificar: slash commands de fases (detectar si es primera vez o amendment)
- Nuevo: estado "needs-review" además de done/pending/skipped

---

## 🟡 P4: Demasiados commands — sobrecarga cognitiva

**Problema**: 24 slash commands. Nadie va a recordarlos todos. La mayoría de sesiones solo necesitan 3-4.

### Tareas

- [ ] **P4.1** Investigar meta-command /work
  ```
  /work               → lee estado, ejecuta la siguiente fase
  /work test          → ir directo a /test (si el gate lo permite)
  /work --skip spec   → alias de /skip-gate spec
  /work --status      → alias de /workflow
  ```
  - El agente decide qué skill cargar basándose en el estado del workflow

- [ ] **P4.2** Investigar descubrimiento de commands en Claude Code
  - ¿Aparecen en autocomplete al escribir "/"?
  - ¿Hay límite práctico de commands?
  - Si autocomplete los muestra todos, 24 es ruido visual

- [ ] **P4.3** Diseñar agrupación final
  ```
  Tier 1 — Usuario invoca directamente (5 commands):
    /work              meta-orquestador
    /recall <query>    buscar memoria
    /remember <text>   guardar en memoria
    /workflow           ver estado
    /skip-gate          bypass de emergencia

  Tier 2 — El agente invoca internamente (19 skills):
    spec, plan, build, test, review, ship, idea,
    context, frontend, api, browser, debug, security,
    perf, git, cicd, docs, simplify, deprecate
  ```

- [ ] **P4.4** Evaluar: ¿los Tier 2 siguen siendo slash commands o son skills que el agente descubre?
  - Si /work carga el skill correcto, no necesitan ser commands
  - Pero perder /test como invocación directa puede frustrar

- [ ] **P4.5** Prototipo: crear /work command
  ```markdown
  # work
  Read the current workflow state:
  ```bash
  node ~/.agent-toolkit/hooks/gate-check.mjs --status
  ```
  
  If argument provided, treat as target phase and load that skill.
  If no argument, determine the next pending phase and load its skill.
  After completing, mark the phase done.
  ```

- [ ] **P4.6** Investigar si support commands (debug, security, perf) deberían ser contextuales
  - El agente detecta "test is failing" → carga debug skill automáticamente
  - El agente detecta "API endpoint" → carga api skill automáticamente
  - Sin necesidad de que el usuario invoque nada

### Implementación estimada
- Nuevo: `.claude/commands/work.md` (meta-orquestador)
- Modificar: mover los 19 skill commands a un directorio interno (no como slash commands)
- O: mantenerlos como slash commands pero documentar solo los 5 principales

---

## 🟢 P1: Gates sin validación de calidad

**Problema**: Marcar "done" no verifica que el output tenga calidad real. El gate es un checkbox, no un quality gate.

### Tareas

- [ ] **P1.1** Investigar verification steps de agent-skills
  - Leer cada SKILL.md y extraer los exit criteria medibles
  - ¿Hay patrones comunes? (ej: "spec must have acceptance criteria", "plan must have tasks with estimates")

- [ ] **P1.2** Investigar prompt hooks de Claude Code
  ```json
  {
    "type": "prompt",
    "prompt": "Based on the following spec output, does it contain: 1) clear acceptance criteria, 2) boundary conditions, 3) testing strategy? Respond YES or NO with brief reason. Output: $ARGUMENTS"
  }
  ```
  - ¿Cuánta latencia añade? ¿Qué modelo usa (Haiku)?

- [ ] **P1.3** Investigar agent hooks para validación profunda
  - Un subagent que lee el output de /spec y verifica secciones
  - Más lento pero más thorough que prompt hooks

- [ ] **P1.4** Diseñar schema mínimo por fase
  ```
  spec:   ≥3 acceptance criteria, boundaries defined, testing approach
  plan:   ≥2 tasks, each with acceptance criteria, dependency order
  build:  code compiles/lints, no TODO placeholders
  test:   ≥1 test passing, coverage on critical paths
  review: all review axes addressed, no blockers
  ```

- [ ] **P1.5** Prototipo: validación en phase --complete (no en cada PreToolUse)
  - Validar cuando se marca la fase, no en cada Write/Edit (menos latencia)
  - Si la validación falla: "spec marked done but missing acceptance criteria. Fix and re-run /spec"

- [ ] **P1.6** Decidir: ¿LLM judge automático o confirmación del usuario?
  - Automático: menos fricción, pero false negatives pueden frustrar
  - Manual: "¿Apruebas esta spec? [sí/no]" — más seguro pero más lento
  - **Híbrido**: LLM valida automáticamente, si pasa → done. Si falla → pregunta al usuario

### Implementación estimada
- Modificar: slash commands de fases (añadir validación antes de --complete)
- Nuevo: schema de validación por fase (fichero de config)
- Posible: prompt hooks o agent hooks para validación LLM

---

## 🔵 P7: Recarga innecesaria de skills

**Problema**: Cada slash command lee el SKILL.md completo. En sesión larga, el mismo skill se lee 3-4 veces quemando tokens.

### Tareas

- [ ] **P7.1** Investigar gestión de contexto en Claude Code
  - ¿Los skills cargados persisten en la conversación?
  - ¿PreCompact los descarta?
  - Si persisten, la segunda lectura es redundante

- [ ] **P7.2** Investigar progressive disclosure en los skills de Osmani
  - ¿Tienen frontmatter con resumen corto + body con detalle?
  - ¿Se puede cargar solo el resumen en invocaciones posteriores?

- [ ] **P7.3** Diseñar carga condicional
  ```markdown
  # En el slash command:
  Check if this skill was already loaded in this session.
  If loaded: show only the verification checklist.
  If not loaded: read the full SKILL.md.
  ```

- [ ] **P7.4** Medir tokens por skill
  ```bash
  # Contar tokens aproximados de cada SKILL.md
  for f in vendor/agent-skills/skills/*/SKILL.md; do
    wc -w "$f"
  done
  # Si <500 words avg, la optimización no merece la pena
  ```

- [ ] **P7.5** Evaluar: ¿Claude Code ya optimiza con compactación automática?
  - Si el context window se compacta y los skills se pierden, NECESITAS recargarlos
  - Si no se pierden, la recarga es desperdicio
  - Esto depende de cómo funcione PreCompact internamente

### Implementación estimada
- Modificar: slash commands (condicional de carga)
- O: no hacer nada si la medición muestra que no es problema

---

## ⚪ P8: /idea — ¿obligatorio u opcional?

**Problema**: /spec sin /idea puede producir specs que asumen la primera solución. Pero forzar ideación sobre algo claro añade fricción.

### Tareas

- [ ] **P8.1** Leer el SKILL.md de idea-refine
  ```bash
  cat vendor/agent-skills/skills/idea-refine/SKILL.md
  ```
  - ¿Qué hace exactamente? ¿Diverge+converge? ¿Solo estructura?

- [ ] **P8.2** Evaluar: /idea como gate "soft"
  - No bloquea, pero inyecta warning: "Starting /spec without /idea. You may be anchoring on the first solution."
  - El agente lo muestra, el usuario decide si continuar

- [ ] **P8.3** Evaluar: integrar ideación DENTRO de /spec
  - Paso 1 de /spec = "before writing the spec, brainstorm 3 alternative approaches"
  - Elimina la necesidad de un command separado

- [ ] **P8.4** Evaluar por tipo de tarea
  ```
  Feature nueva     → /idea recomendado (hay espacio para explorar)
  Bugfix            → /idea skip (el problema es concreto)
  Refactor          → /idea recomendado (hay múltiples approaches)
  Hotfix            → /idea skip (urgencia)
  ```
  - ¿Se puede detectar el tipo automáticamente? Probablemente no sin preguntar

- [ ] **P8.5** Documentar decisión como ADR
  - Cualquiera que sea la decisión, escribir un ADR con el contexto y trade-offs
  - Guardarlo en docs/adr/ del repo

### Implementación estimada
- Modificar: gate-check.mjs (añadir soft warning para idea) O slash command de spec (integrar ideación)
- Nuevo: docs/adr/001-idea-phase-optional.md

---

## Registro de decisiones

| Fecha | Decisión | Contexto |
|-------|----------|----------|
| 2026-04-05 | Creado agent-toolkit v0.1 | Combina agent-skills + agentmemory + workflow gates |
| 2026-04-05 | Opción 3 (híbrida) para gates | PreToolUse hard block + agentmemory contextual |
| 2026-04-05 | Identificados 8 problemas | Revisión socrática de decisiones de diseño |
| 2026-04-05 | Prioridad: P3+P5+P6 primero | Son el mismo problema de estado/persistencia |
| | | |

---

## Cómo recuperar esta tasklist

En una nueva sesión de Claude (web o Code):
```
/recall agent-toolkit tasklist
```

O buscar en chats pasados:
```
conversation_search "agent-toolkit tasklist"
```

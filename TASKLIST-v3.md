# Agent Toolkit v3 — Workflow Evolution Plan

> Fecha: 2026-04-05
> Estado: INVESTIGACION
> Objetivo: Redisenar el workflow de desarrollo con IA basado en analisis de lo que realmente funciona

---

## 1. Analisis del paisaje actual

### 1.1 Enfoques existentes

| Repo/Tool | Enfoque | Fortaleza | Debilidad |
|-----------|---------|-----------|-----------|
| **agent-skills** (Osmani) | 19 skills markdown, flujo lineal | Cobertura completa del ciclo, coherente | Prompts genericos, no entiende contexto del proyecto |
| **Superpowers** (obra) | 136k stars, psicologia de persuasion en LLMs | Anti-racionalizacion, borrado punitivo, subagents, regla 1% | Menos cobertura tecnica (no security/perf/deprecation) |
| **claude-mem** (thedotmack) | 45k stars, memoria auto-captura | Comprime con AI, inyecta en futuras sesiones | Solo memoria, sin workflow |
| **Cursor Rules** (PatrickJS) | 38k stars, reglas por framework/lenguaje | Muy especificas al stack, faciles de adoptar | Sin flujo de trabajo, solo constraints |
| **Harper Reed workflow** | Spec -> AI critique -> plan -> slices | Muy practico, probado en produccion | Manual, no automatizado |
| **Kent Beck approach** | "AI is my intern", tasks pequenas | Pragmatico, basado en decadas de experiencia | No formalizado, depende del criterio del senior |
| **Daniel Miessler** | "Generate then curate" | Rapido para explorar, menos friccion | Riesgo de anclar en output mediocre |

### 1.2 Que funciona segun la evidencia

Fuentes: Kent Beck (Substack), Thorsten Ball (blog), Simon Willison, Google internal study 2024, Microsoft Research 2024, GitClear study.

**Consenso entre practitioners:**

1. **AI amplifica el juicio del dev, no lo reemplaza** — Los que mas beneficio sacan son los que podrian escribir el codigo ellos mismos
2. **Spec-first para produccion, exploration-first para prototipos** — No hay un unico modo correcto
3. **AI es excelente en: tests, boilerplate, refactoring, docs** — Ganancias reales
4. **AI es malo en: arquitectura, concurrencia, seguridad, decisiones de producto** — Riesgo real
5. **El debugging AUMENTA cuando el dev no entiende el codigo AI** — Google study
6. **Code churn +39% en codebases con AI** — GitClear: codigo se commitea prematuro
7. **"Borrar y re-promptear" es mejor que "arreglar codigo AI"** — Thorsten Ball
8. **Tests humanos + implementacion AI = mejor combo** — Kent Beck

### 1.3 Modos de fallo documentados

| Fallo | Descripcion | Cita |
|-------|-------------|------|
| **LGTM trap** | Dev aprueba output AI sin review real | GitClear study |
| **Context window** | Cambios >3-5 ficheros degradan calidad | Multiples practitioners |
| **Plausible nonsense** | Compila, pasa review superficial, tiene bugs sutiles | Simon Willison |
| **Abstraction astronaut** | AI sobre-abstrae, anade patrones innecesarios | Thorsten Ball |
| **Yes-man** | AI acepta cualquier approach, no pushbackea | Simon Willison |
| **Intern confidence** | Junior usa AI para ir mas rapido al desastre | Charity Majors |

---

## 2. Tareas de investigacion: repos existentes

### 2.0 Hallazgos de Superpowers (investigacion completada)

**Repo**: https://github.com/obra/superpowers (136K stars, MIT)
**Creador**: Jesse Vincent. En marketplace oficial de Claude Code desde enero 2026.

**Skills de Superpowers**:
- `test-driven-development` — RED-GREEN-REFACTOR estricto. 11 excusas documentadas con rebuttals. **BORRA codigo escrito antes del test**.
- `systematic-debugging` — 4 fases: reproducir, localizar, reducir, fix+guard
- `verification-before-completion` — Evidencia requerida antes de declarar "done"
- `brainstorming` — Refinamiento socratico con preguntas antes de codigo
- `writing-plans` — Tareas de 2-5 min con paths exactos y pasos de verificacion
- `executing-plans` — Ejecucion batch con checkpoints humanos
- `dispatching-parallel-agents` — Fan-out a subagentes
- `subagent-driven-development` — Subagente fresco por tarea, review en 2 fases
- `using-git-worktrees` — Workspace aislado en branch nuevo
- `using-superpowers` — Meta-skill: "si hay 1% de chance, DEBES invocar el skill"

**Tecnicas clave de Superpowers (que no tiene agent-skills)**:
1. **Anti-racionalizacion**: Tablas de excusas del LLM + rebuttals explicitos
2. **Borrado punitivo**: Codigo pre-test se borra, no se adapta
3. **Invocacion obligatoria**: Regla del 1% — threshold muy bajo
4. **Prioridad 3-tier**: User > Skills > System prompt
5. **Subagent architecture**: Tareas complejas a agentes frescos con review

**Tecnicas clave de agent-skills (que no tiene Superpowers)**:
1. Seguridad: OWASP Top 10, hardening
2. Performance: Core Web Vitals, profiling
3. API design: Hyrum's Law, contratos
4. Deprecation/migration: safe removal patterns
5. CI/CD y ADRs: documentacion de decisiones

**Otros repos relevantes descubiertos**:
| Repo | Stars | Utilidad |
|------|-------|----------|
| claude-mem (thedotmack) | 45K | Auto-captura + compresion de contexto |
| awesome-cursorrules (PatrickJS) | 38K | 100+ .cursorrules por framework |
| awesome-claude-code (hesreallyhim) | 36K | Curado de skills, hooks, plugins |
| VoltAgent/awesome-agent-skills | 14K | 1060+ skills de equipos oficiales |
| refly-ai/refly | 7K | Builder de skills via "vibe workflow" |
| system-prompts-and-models (x1xhlol) | 134K | System prompts extraidos de 30+ tools |

### 2.1-2.6 Tareas de analisis profundo

- [ ] **2.1** Descargar Superpowers y extraer las anti-rationalization tables
  - Mapear cada tabla a nuestras fases
  - Incorporar las que apliquen a nuestros SKILL.md
  - **Decision**: Adoptar el patron de borrado punitivo en TDD? (agresivo pero efectivo)

- [ ] **2.2** Analizar PatrickJS/awesome-cursorrules (38K stars)
  - Extraer los 10 constraints mas comunes cross-framework
  - **Pregunta**: Hay constraints universales que deberian estar en nuestro toolkit?

- [ ] **2.3** Incorporar pattern de Harper Reed: AI critique entre spec y plan
  - AI genera contra-argumentos a la spec antes de planificar
  - Resuelve el "yes-man problem" documentado por Simon Willison

- [ ] **2.4** Adoptar Kent Beck TDD pattern: tests humanos primero
  - Humano define QUE testear, AI escribe los tests, AI implementa para pasar tests
  - **Progressive disclosure**: spec -> tests -> implementacion (no spec -> implementacion -> tests)

- [ ] **2.5** Evaluar "generate then curate" de Miessler para fase de idea
  - AI genera 3 implementaciones candidatas, humano elige
  - Solo para fase exploratoria, no para produccion

- [ ] **2.6** Compilar prompt hibrido best-of-breed por fase
  | Fase | Base | Mejora Superpowers | Mejora otros |
  |------|------|--------------------|-------------|
  | Idea | Osmani idea-refine | Brainstorming socratico | Miessler multi-gen |
  | Spec | Osmani spec-driven | Anti-rationalization table | Harper Reed AI critique |
  | Plan | Osmani task-breakdown | writing-plans (2-5 min tasks) | Exact file paths |
  | Build | Osmani incremental | subagent-driven-dev | Kent Beck test-first |
  | Test | Osmani TDD | **Borrado punitivo** + 11 rebuttals | Kent Beck human-tests |
  | Review | Superpowers code-review | 2-stage review (spec + quality) | Osmani 5-axis |
  | Ship | Osmani shipping | verification-before-completion | Cursor Rules safety |

---

## 3. Analisis del proceso organico de desarrollo con IA

### Que pasa REALMENTE cuando un dev senior usa AI

- [ ] **3.1** Mapear el proceso organico real (no el teorico)
  ```
  Proceso real observado:
  1. Dev tiene idea vaga
  2. Dev hace research (lee docs, busca precedentes)
  3. Dev diseña en su cabeza o en papel (NO en AI)
  4. Dev pide a AI que implemente una pieza pequena
  5. Dev revisa, ajusta, pide otra pieza
  6. Dev se da cuenta de que algo no encaja → vuelve al paso 3
  7. Loop entre 4-6 hasta que funciona
  8. Dev escribe/pide tests
  9. Dev hace review final
  
  Lo que NO pasa:
  - Dev no hace "spec formal" para cosas pequenas
  - Dev no sigue fases lineales
  - Dev no espera a terminar todo para testear
  ```

- [ ] **3.2** Identificar los "momentos de verdad" del proceso
  - Momento 1: **Cuando el dev entiende el problema** (pre-spec)
  - Momento 2: **Cuando el dev valida la primera pieza** (post-build-slice-1)
  - Momento 3: **Cuando el dev dice "esto funciona"** (pre-ship)
  - Gates deberian estar en estos momentos, no en fases artificiales

- [ ] **3.3** Mapear donde el dev necesita proteccion de si mismo
  - Querer ir rapido y saltarse el diseño
  - Aceptar output AI sin entenderlo
  - Dejar que AI tome decisiones de arquitectura
  - Commitear sin tests
  - No revisar diffs sino ficheros enteros

- [ ] **3.4** Definir los "anti-patterns" que el sistema deberia detectar
  - Cambio grande sin tests → warning
  - Nuevo fichero de abstraccion → "Necesitas esta abstraccion?"
  - Cambio en >5 ficheros → "Considera dividir este cambio"
  - Codigo de seguridad (auth, crypto, input) → "Review manual recomendado"
  - TODO/FIXME en codigo → "No commitear placeholders"

---

## 4. Propuesta original: Confidence-Based Development (CBD)

### Un enfoque diferente al phase-based gating

La mayoria de workflows imponen fases lineales. Pero el dev real no es lineal — es un loop con niveles de confianza crecientes. Mi propuesta:

- [ ] **4.1** Disenar el modelo de Confidence-Based Development
  ```
  En lugar de: idea -> spec -> plan -> build -> test -> review -> ship
  
  Propongo: El sistema detecta en que NIVEL DE CONFIANZA esta el trabajo
  y ajusta las restricciones dinamicamente.
  
  Nivel 0 — EXPLORING
    Permitido: leer, buscar, discutir, generar sketches
    Bloqueado: escribir codigo en el proyecto
    Trigger salida: dev escribe algo que parece una decision
  
  Nivel 1 — DESIGNING  
    Permitido: escribir specs, ADRs, diagramas, prototipos aislados
    Bloqueado: modificar codigo de produccion
    Trigger salida: spec con acceptance criteria existe
  
  Nivel 2 — BUILDING (constrained)
    Permitido: escribir codigo en scope definido por el plan
    Restriccion: maximo N ficheros por cambio, cada cambio necesita test
    Trigger salida: tests pasan para el slice actual
  
  Nivel 3 — BUILDING (expanded)
    Permitido: refactoring, integracion, cambios cross-cutting
    Restriccion: review automatico de diffs, no nuevas abstracciones sin justificar
    Trigger salida: todos los tests pasan, coverage en critical paths
  
  Nivel 4 — SHIPPING
    Permitido: deploy, release
    Restriccion: checklist de seguridad, rollback plan
    Trigger salida: deployed + monitored
  ```

- [ ] **4.2** Disenar "Dual-Track" (Thinking vs Typing)
  ```
  Track 1 — HUMAN THINKS
    El dev diseña, decide, valida
    AI contribuye: rubber duck, generar alternativas, buscar precedentes
    AI NO contribuye: tomar decisiones, elegir arquitectura
    
  Track 2 — AI TYPES
    AI implementa lo que el humano decidio
    Humano contribuye: review, ajustes, direccion
    Humano NO contribuye: boilerplate, scaffolding, tests mecanicos
  
  El workflow deberia hacer explicito cuando estas en cada track.
  ```

- [ ] **4.3** Disenar "Progressive Disclosure of AI Capability"
  ```
  Idea clave: no es "spec+plan done = todo permitido"
  Sino una apertura gradual:
  
  1. Sin spec: AI solo puede leer y discutir
  2. Con spec: AI puede escribir TESTS (no implementacion)
  3. Con tests: AI puede escribir implementacion para hacer pasar los tests
  4. Con tests passing: AI puede refactorizar
  5. Con review: AI puede preparar deployment
  
  Esto invierte el TDD clasico hacia algo mas poderoso:
  el humano define QUE (spec), el test define COMO SE VERIFICA,
  y la AI completa el COMO SE IMPLEMENTA.
  ```

- [ ] **4.4** Disenar "Anti-Pattern Detection" como gates inteligentes
  ```
  En lugar de: "completaste spec? si/no"
  
  Detectar patrones peligrosos en tiempo real:
  
  PreToolUse para Write/Edit:
    - Fichero nuevo? → "Necesitas un fichero nuevo? Existe algo reutilizable?"
    - >100 lineas en un cambio? → "Cambio grande. Divide en slices?"
    - Toca auth/crypto/validation? → "Codigo de seguridad. Review humano recomendado"
    - Sin test asociado? → "No hay test para este cambio. Escribe test primero?"
    
  PostToolUse para Write/Edit:
    - Anade dependencia nueva? → "Nueva dependencia detectada. Justificada?"
    - Introduce TODO/FIXME? → "Placeholder detectado. No commitear"
    - Duplica codigo existente? → "Posible duplicacion. Reutilizar?"
  ```

- [ ] **4.5** Disenar "Verification Loops" automaticos
  ```
  En lugar de: fases lineales con verificacion manual
  
  Despues de cada cambio:
    1. Lint automatico (si existe linter)
    2. Tests automaticos (si existen tests)
    3. Diff review (mostrar al dev que cambio)
    4. Si hay errores → loop automatico de fix
    5. Si pasa → siguiente slice
    
  Esto no necesita que el dev invoque /test —
  los tests corren SIEMPRE despues de cada build slice.
  ```

- [ ] **4.6** Disenar "Context Anchoring"
  ```
  Problema: AI pierde contexto en sesiones largas
  
  Solucion: en cada cambio, el sistema mantiene un "anchor document":
  
  .claude/workflow/anchor.md:
    ## What we're building
    [auto-extracted from spec]
    
    ## Current plan
    [auto-extracted from plan, with completed items marked]
    
    ## Last 3 changes
    [auto-captured diffs resumidos]
    
    ## Key decisions
    [auto-captured de /remember y phase completions]
    
  Este fichero se inyecta en cada prompt como contexto fijo.
  Se actualiza automaticamente (no manualmente).
  ```

---

## 5. Plan de implementacion hibrido

### Combinar lo mejor de cada approach

- [ ] **5.1** Definir las fuentes para cada fase
  ```
  FASE      | BASE           | MEJORA CON           | ORIGINAL CBD
  ----------|----------------|----------------------|------------------
  Idea      | Osmani         | Miessler (multi-gen) | Nivel 0 exploring
  Spec      | Osmani         | Harper Reed (critique)| Nivel 1 designing
  Plan      | Osmani         | Superpowers prompts  | Dual-track explicit
  Build     | Osmani         | Kent Beck (TDD-first)| Progressive disclosure
  Test      | Osmani         | Kent Beck (human test)| Auto-verification loops
  Review    | Superpowers    | Osmani (5-axis)      | Anti-pattern detection
  Ship      | Osmani         | Cursor Rules (safety)| Nivel 4 constraints
  ```

- [ ] **5.2** Disenar la arquitectura v3
  ```
  Componentes:
  
  1. gate-check.mjs v3
     - Confidence levels en lugar de (o ademas de) fases
     - Anti-pattern detection
     - Progressive disclosure logic
     
  2. verification-loop.mjs (NUEVO)
     - Corre lint+tests automaticamente post-cambio
     - Captura diffs y los resume
     - Actualiza anchor document
  
  3. anchor-manager.mjs (NUEVO)
     - Mantiene .claude/workflow/anchor.md actualizado
     - Inyecta como contexto en cada prompt
     
  4. Slash commands actualizados
     - /work sigue siendo el meta-orchestrator
     - Fases usan prompts hibridos (best-of-breed)
     - Nuevos: /explore, /anchor, /confidence
  ```

- [ ] **5.3** Decidir que implementar primero (MVP)
  ```
  Fase 1 (inmediato):
    - Sustituir SKILL.md por prompts hibridos best-of-breed
    - Anadir AI critique entre spec y plan
    - Forzar test-first en /build
    
  Fase 2 (siguiente):
    - Anti-pattern detection en PreToolUse
    - Verification loops automaticos (lint+test post-cambio)
    - Anchor document auto-generado
    
  Fase 3 (experimental):
    - Confidence-based gating completo
    - Progressive disclosure de capacidades
    - Dual-track UI (indicators de thinking vs typing)
  ```

---

## 6. Preguntas abiertas

- [ ] **6.1** Es el phase-based gating fundamentalmente erroneo o solo necesita mejoras?
  - Argumento pro-fases: estructura predecible, facil de entender
  - Argumento pro-confidence: refleja el proceso real, menos friccion
  - Posible respuesta: fases como guide, confidence como enforcement

- [ ] **6.2** Deberia el sistema adaptarse al tipo de tarea automaticamente?
  - Feature nueva → full workflow con spec+plan
  - Bugfix → skip to build+test (con skip auditado)
  - Refactor → plan+build+test (sin spec)
  - Hotfix → todo abierto (con audit trail)
  
- [ ] **6.3** Como medimos si el workflow realmente mejora la calidad?
  - Metricas posibles: code churn post-deploy, bugs en prod, tiempo por feature
  - Necesitamos datos antes y despues

- [ ] **6.4** El "yes-man problem" se puede resolver con workflow?
  - La AI nunca va a pushback naturalmente
  - Podemos forzarlo con prompts de "devil's advocate" en review?
  - Podemos anadir un "challenger mode" que argumente en contra?

- [ ] **6.5** Agentmemory es la mejor opcion para cross-session, o hay alternativas?
  - Ficheros locales + git ya persisten entre sesiones
  - Agentmemory anade busqueda semantica — pero la necesitamos?
  - Alternativa: CLAUDE.md + anchor.md + git log = suficiente?

---

## Registro de decisiones

| Fecha | Decision | Contexto |
|-------|----------|----------|
| 2026-04-05 | Crear plan v3 | Despues de implementar v2, analizar como mejorar fundamentalmente |
| 2026-04-05 | Investigar 6 enfoques | Osmani, Superpowers, Cursor Rules, Harper Reed, Kent Beck, Miessler |
| 2026-04-05 | Proponer CBD | Confidence-Based Development como enfoque original |
| | | |

#!/usr/bin/env bash
# ─────────────────────────────────────────────
# SessionStart Hook v2
# 1. Checks agentmemory health (warns if down)
# 2. Injects workflow state from local file
# 3. Injects past memory context if agentmemory is up
# ─────────────────────────────────────────────
set -uo pipefail

AGENTMEMORY_URL="${AGENTMEMORY_URL:-http://localhost:3111}"
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
TOOLKIT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
GATE_ENGINE="$TOOLKIT_DIR/hooks/gate-check.mjs"

PARTS=""

# ── 1. Always show workflow state from local file ──
WORKFLOW_STATUS=$(node "$GATE_ENGINE" --status 2>/dev/null || echo "")
if [ -n "$WORKFLOW_STATUS" ]; then
  PARTS="Current workflow:\n$WORKFLOW_STATUS"
fi

# ── 2. Check agentmemory health ──
MEMORY_UP=false
if curl -sf --max-time 2 "$AGENTMEMORY_URL/agentmemory/livez" >/dev/null 2>&1; then
  MEMORY_UP=true
else
  PARTS="$PARTS\n\nMemory server not running. Gates use local state only. Cross-session memory disabled.\nRun: $TOOLKIT_DIR/scripts/start-memory.sh"
fi

# ── 3. If memory is up, inject past context ──
if [ "$MEMORY_UP" = true ]; then
  SESSION_CONTEXT=$(curl -sf -X POST "$AGENTMEMORY_URL/agentmemory/session/start" \
    -H "Content-Type: application/json" \
    -d "{\"project\": \"$PROJECT_DIR\"}" 2>/dev/null || echo "")

  if [ -n "$SESSION_CONTEXT" ]; then
    MEMORY_CONTEXT=$(echo "$SESSION_CONTEXT" | node -e "
      const chunks = [];
      process.stdin.on('data', d => chunks.push(d));
      process.stdin.on('end', () => {
        try {
          const data = JSON.parse(chunks.join(''));
          const parts = [];
          if (data.context) parts.push(data.context);
          if (data.profile) {
            const p = data.profile;
            if (p.topConcepts?.length) parts.push('Key concepts: ' + p.topConcepts.join(', '));
            if (p.topFiles?.length) parts.push('Active files: ' + p.topFiles.slice(0, 10).join(', '));
            if (p.conventions?.length) parts.push('Conventions: ' + p.conventions.join('; '));
          }
          if (data.memories?.length) {
            parts.push('Past decisions: ' + data.memories.map(m => m.title || m.content).slice(0, 5).join('; '));
          }
          const output = parts.filter(Boolean).join('\n');
          if (output) console.log(output);
        } catch {}
      });
    " 2>/dev/null || echo "")

    if [ -n "$MEMORY_CONTEXT" ]; then
      PARTS="$PARTS\n\nPast context:\n$MEMORY_CONTEXT"
    fi
  fi
fi

# ── Output ──
if [ -n "$PARTS" ]; then
  echo "{\"additionalContext\": \"$(echo -e "$PARTS" | sed 's/"/\\"/g' | tr '\n' ' ')\"}"
fi

exit 0

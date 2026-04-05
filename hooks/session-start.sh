#!/usr/bin/env bash
# ─────────────────────────────────────────────
# SessionStart Hook
# Injects past memory context from agentmemory
# ─────────────────────────────────────────────
set -uo pipefail

AGENTMEMORY_URL="${AGENTMEMORY_URL:-http://localhost:3111}"
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"

# Check if agentmemory is running
if ! curl -sf "$AGENTMEMORY_URL/agentmemory/health" >/dev/null 2>&1; then
  # Not running — exit cleanly, don't block the session
  exit 0
fi

# Start session in agentmemory
SESSION_CONTEXT=$(curl -sf -X POST "$AGENTMEMORY_URL/agentmemory/session/start" \
  -H "Content-Type: application/json" \
  -d "{\"project\": \"$PROJECT_DIR\"}" 2>/dev/null || echo "")

if [ -z "$SESSION_CONTEXT" ]; then
  exit 0
fi

# Extract context for Claude (injected as additionalContext)
CONTEXT=$(echo "$SESSION_CONTEXT" | node -e "
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

      const output = parts.filter(Boolean).join('\n\n');
      if (output) {
        console.log(JSON.stringify({ additionalContext: output }));
      }
    } catch(e) {
      // Silently fail
    }
  });
" 2>/dev/null || echo "")

if [ -n "$CONTEXT" ]; then
  echo "$CONTEXT"
fi

exit 0

#!/usr/bin/env bash
# ─────────────────────────────────────────────
# Stop Hook (async)
# Triggers observation compression and session end
# ─────────────────────────────────────────────
set -uo pipefail

AGENTMEMORY_URL="${AGENTMEMORY_URL:-http://localhost:3111}"
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"

# Check if agentmemory is running
if ! curl -sf --max-time 1 "$AGENTMEMORY_URL/agentmemory/livez" >/dev/null 2>&1; then
  exit 0
fi

# Trigger session summary + compression
curl -sf -X POST "$AGENTMEMORY_URL/agentmemory/session/end" \
  -H "Content-Type: application/json" \
  -d "{\"project\": \"$PROJECT_DIR\"}" >/dev/null 2>&1 || true

exit 0

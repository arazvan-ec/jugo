#!/usr/bin/env bash
# ─────────────────────────────────────────────
# PreToolUse Hook — Workflow Gate Enforcement v2
# Blocks Write/Edit/MultiEdit if required phases
# haven't been completed.
#
# v2: Reads from local state file (no agentmemory dependency)
# ─────────────────────────────────────────────
set -uo pipefail

TOOLKIT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
GATE_ENGINE="$TOOLKIT_DIR/hooks/gate-check.mjs"

# Read the tool name from stdin JSON
INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | node -e "
  const chunks = [];
  process.stdin.on('data', d => chunks.push(d));
  process.stdin.on('end', () => {
    try {
      const data = JSON.parse(chunks.join(''));
      console.log(data.tool_name || '');
    } catch { console.log(''); }
  });
" 2>/dev/null)

# Only gate Write, Edit, MultiEdit
case "$TOOL_NAME" in
  Write|Edit|MultiEdit)
    RESULT=$(node "$GATE_ENGINE" "$TOOL_NAME" 2>&1)
    EXIT_CODE=$?
    if [ $EXIT_CODE -ne 0 ]; then
      # Output the gate message for Claude to see
      echo "$RESULT" >&2
      exit $EXIT_CODE
    fi
    exit 0
    ;;
  *)
    exit 0
    ;;
esac

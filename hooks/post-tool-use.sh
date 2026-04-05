#!/usr/bin/env bash
# ─────────────────────────────────────────────
# PostToolUse Hook (async)
# Captures tool observations to agentmemory
# ─────────────────────────────────────────────
set -uo pipefail

AGENTMEMORY_URL="${AGENTMEMORY_URL:-http://localhost:3111}"
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"

# Read stdin (Claude Code passes JSON context)
INPUT=$(cat)

# Check if agentmemory is running (quick check)
if ! curl -sf --max-time 1 "$AGENTMEMORY_URL/agentmemory/livez" >/dev/null 2>&1; then
  exit 0
fi

# Extract tool info and send observation
node -e "
  const data = JSON.parse(\`$INPUT\`);
  const toolName = data.tool_name || 'unknown';
  const toolInput = data.tool_input || {};
  const toolOutput = (data.tool_output || '').slice(0, 2000); // Truncate large outputs

  // Skip noisy read-only tools
  const skipTools = ['Read', 'Glob', 'Grep', 'LS'];
  if (skipTools.includes(toolName)) process.exit(0);

  const observation = {
    project: '$PROJECT_DIR',
    type: 'tool_use',
    tool: toolName,
    input: JSON.stringify(toolInput).slice(0, 1000),
    output: toolOutput,
    timestamp: new Date().toISOString()
  };

  fetch('$AGENTMEMORY_URL/agentmemory/observe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(observation)
  }).catch(() => {}); // Fire and forget
" 2>/dev/null || true

exit 0

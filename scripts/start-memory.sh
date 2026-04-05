#!/usr/bin/env bash
# ─────────────────────────────────────────────
# Start agentmemory server
# ─────────────────────────────────────────────
set -euo pipefail

TOOLKIT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
AGENTMEMORY_DIR="$TOOLKIT_DIR/vendor/agentmemory"
PID_FILE="$HOME/.agentmemory/server.pid"
LOG_FILE="$HOME/.agentmemory/server.log"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

mkdir -p "$HOME/.agentmemory"

# Check if already running
if [ -f "$PID_FILE" ]; then
  PID=$(cat "$PID_FILE")
  if kill -0 "$PID" 2>/dev/null; then
    echo -e "${YELLOW}[!]${NC} agentmemory already running (PID $PID)"
    echo -e "${BLUE}[→]${NC} Health: http://localhost:3111/agentmemory/health"
    echo -e "${BLUE}[→]${NC} Viewer: http://localhost:3113"
    exit 0
  fi
fi

# Check if the port is in use
if curl -sf http://localhost:3111/agentmemory/livez >/dev/null 2>&1; then
  echo -e "${YELLOW}[!]${NC} Port 3111 already in use (agentmemory may be running externally)"
  exit 0
fi

# Start in background
echo -e "${BLUE}[→]${NC} Starting agentmemory..."
cd "$AGENTMEMORY_DIR"
nohup npm start > "$LOG_FILE" 2>&1 &
echo $! > "$PID_FILE"

# Wait for startup
for i in $(seq 1 15); do
  if curl -sf http://localhost:3111/agentmemory/livez >/dev/null 2>&1; then
    echo -e "${GREEN}[✓]${NC} agentmemory started (PID $(cat $PID_FILE))"
    echo -e "${BLUE}[→]${NC} API:    http://localhost:3111"
    echo -e "${BLUE}[→]${NC} Viewer: http://localhost:3113"
    echo -e "${BLUE}[→]${NC} Logs:   $LOG_FILE"
    exit 0
  fi
  sleep 1
done

echo -e "${YELLOW}[!]${NC} agentmemory started but not yet responding."
echo -e "${BLUE}[→]${NC} Check logs: tail -f $LOG_FILE"

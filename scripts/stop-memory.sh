#!/usr/bin/env bash
set -euo pipefail

PID_FILE="$HOME/.agentmemory/server.pid"
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

if [ -f "$PID_FILE" ]; then
  PID=$(cat "$PID_FILE")
  if kill -0 "$PID" 2>/dev/null; then
    kill "$PID"
    rm -f "$PID_FILE"
    echo -e "${GREEN}[✓]${NC} agentmemory stopped (PID $PID)"
  else
    rm -f "$PID_FILE"
    echo -e "${YELLOW}[!]${NC} Process not found, cleaned up stale PID file"
  fi
else
  echo -e "${YELLOW}[!]${NC} No PID file found. agentmemory may not be running."
fi

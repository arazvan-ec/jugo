#!/usr/bin/env bash
set -euo pipefail

TOOLKIT_DIR="$(cd "$(dirname "$0")" && pwd)"
CLAUDE_GLOBAL_SETTINGS="$HOME/.claude/settings.json"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log()  { echo -e "${GREEN}[✓]${NC} $1"; }
info() { echo -e "${BLUE}[→]${NC} $1"; }

echo ""
echo "Uninstalling Agent Toolkit..."
echo ""

# Stop agentmemory if running
"$TOOLKIT_DIR/scripts/stop-memory.sh" 2>/dev/null || true

# Remove hooks from settings.json
if [ -f "$CLAUDE_GLOBAL_SETTINGS" ]; then
  node -e "
    const fs = require('fs');
    const settings = JSON.parse(fs.readFileSync('$CLAUDE_GLOBAL_SETTINGS', 'utf8'));
    const toolkitCmd = '$TOOLKIT_DIR/hooks/';

    if (settings.hooks) {
      for (const [event, entries] of Object.entries(settings.hooks)) {
        settings.hooks[event] = entries.filter(e =>
          !e.hooks?.some(h => h.command?.includes(toolkitCmd))
        );
        if (settings.hooks[event].length === 0) delete settings.hooks[event];
      }
      if (Object.keys(settings.hooks).length === 0) delete settings.hooks;
    }

    fs.writeFileSync('$CLAUDE_GLOBAL_SETTINGS', JSON.stringify(settings, null, 2));
  "
  log "Hooks removed from ~/.claude/settings.json"
fi

echo ""
log "Agent Toolkit uninstalled."
info "The toolkit directory is still at: $TOOLKIT_DIR"
info "Run 'rm -rf $TOOLKIT_DIR' to delete it completely."
info "Memory data is at ~/.agentmemory/ (preserved)"
echo ""

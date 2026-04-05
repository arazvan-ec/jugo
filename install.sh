#!/usr/bin/env bash
set -euo pipefail

# ──────────────────────────────────────────────────
# Agent Toolkit Installer
# Combines agent-skills + agentmemory for Claude Code
# ──────────────────────────────────────────────────

TOOLKIT_DIR="$(cd "$(dirname "$0")" && pwd)"
VENDOR_DIR="$TOOLKIT_DIR/vendor"
CLAUDE_GLOBAL_SETTINGS="$HOME/.claude/settings.json"
UPDATE_MODE=false

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log()  { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err()  { echo -e "${RED}[✗]${NC} $1"; exit 1; }
info() { echo -e "${BLUE}[→]${NC} $1"; }

# ── Parse args ──────────────────────────────────
for arg in "$@"; do
  case $arg in
    --update) UPDATE_MODE=true ;;
  esac
done

# ── Preflight checks ───────────────────────────
command -v node >/dev/null 2>&1 || err "Node.js is required (>= 20). Install from https://nodejs.org"
command -v git  >/dev/null 2>&1 || err "Git is required."

NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
  err "Node.js >= 20 required, found v$(node -v)"
fi

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║       Agent Toolkit Installer            ║"
echo "║   agent-skills + agentmemory             ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# ── Clone / Update vendor repos ─────────────────
mkdir -p "$VENDOR_DIR"

clone_or_update() {
  local repo_url=$1
  local target_dir=$2
  local name=$3

  if [ -d "$target_dir/.git" ]; then
    if [ "$UPDATE_MODE" = true ]; then
      info "Updating $name..."
      cd "$target_dir" && git pull --ff-only && cd "$TOOLKIT_DIR"
      log "$name updated"
    else
      log "$name already cloned"
    fi
  else
    info "Cloning $name..."
    git clone --depth 1 "$repo_url" "$target_dir"
    log "$name cloned"
  fi
}

clone_or_update "https://github.com/addyosmani/agent-skills.git" \
  "$VENDOR_DIR/agent-skills" "agent-skills"

clone_or_update "https://github.com/rohitg00/agentmemory.git" \
  "$VENDOR_DIR/agentmemory" "agentmemory"

# ── Build agentmemory ──────────────────────────
info "Building agentmemory..."
cd "$VENDOR_DIR/agentmemory"
npm install --silent 2>/dev/null
npm run build --silent 2>/dev/null
log "agentmemory built"
cd "$TOOLKIT_DIR"

# ── Install local embeddings (recommended) ─────
info "Installing local embedding model..."
cd "$VENDOR_DIR/agentmemory"
npm install @xenova/transformers --silent 2>/dev/null || warn "Local embeddings not installed (optional)"
cd "$TOOLKIT_DIR"
log "Embedding model ready"

# ── Make hooks executable ───────────────────────
chmod +x "$TOOLKIT_DIR/hooks/"*.sh
chmod +x "$TOOLKIT_DIR/scripts/"*.sh
log "Hooks configured"

# ── Set up Claude Code global settings ──────────
mkdir -p "$HOME/.claude"

info "Configuring Claude Code hooks..."

# Create a temporary settings merge
HOOKS_JSON=$(cat <<HOOKS
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "$TOOLKIT_DIR/hooks/session-start.sh"
          }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Write|Edit|MultiEdit",
        "hooks": [
          {
            "type": "command",
            "command": "$TOOLKIT_DIR/hooks/pre-tool-use.sh"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit|MultiEdit|Bash",
        "hooks": [
          {
            "type": "command",
            "command": "$TOOLKIT_DIR/hooks/post-tool-use.sh",
            "async": true
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "$TOOLKIT_DIR/hooks/session-end.sh",
            "async": true
          }
        ]
      }
    ]
  }
}
HOOKS
)

if [ -f "$CLAUDE_GLOBAL_SETTINGS" ]; then
  # Merge with existing settings using node
  node -e "
    const fs = require('fs');
    const existing = JSON.parse(fs.readFileSync('$CLAUDE_GLOBAL_SETTINGS', 'utf8'));
    const newHooks = $HOOKS_JSON;

    // Merge hooks arrays (don't replace, append)
    if (!existing.hooks) existing.hooks = {};
    for (const [event, entries] of Object.entries(newHooks.hooks)) {
      if (!existing.hooks[event]) existing.hooks[event] = [];
      // Check if agent-toolkit hook already exists
      const toolkitCmd = '$TOOLKIT_DIR/hooks/';
      const filtered = existing.hooks[event].filter(e =>
        !e.hooks?.some(h => h.command?.includes(toolkitCmd))
      );
      existing.hooks[event] = [...filtered, ...entries];
    }

    fs.writeFileSync('$CLAUDE_GLOBAL_SETTINGS', JSON.stringify(existing, null, 2));
  "
  log "Hooks merged into existing settings"
else
  echo "$HOOKS_JSON" > "$CLAUDE_GLOBAL_SETTINGS"
  log "Settings file created"
fi

# ── Create agentmemory env if not exists ────────
mkdir -p "$HOME/.agentmemory"
if [ ! -f "$HOME/.agentmemory/.env" ]; then
  cat > "$HOME/.agentmemory/.env" <<ENV
# Agent Toolkit - agentmemory configuration
# Uncomment and set your preferred LLM provider:

# ANTHROPIC_API_KEY=sk-ant-...
# GEMINI_API_KEY=...
# OPENROUTER_API_KEY=...

# Local embeddings (recommended, free, no API key)
EMBEDDING_PROVIDER=local

# Context injection budget (tokens)
TOKEN_BUDGET=2000

# Hybrid search weights
BM25_WEIGHT=0.4
VECTOR_WEIGHT=0.6
ENV
  log "Default .env created at ~/.agentmemory/.env"
else
  log "Existing .env preserved"
fi

# ── Summary ─────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════╗"
echo "║       Installation Complete!             ║"
echo "╚══════════════════════════════════════════╝"
echo ""
log "agent-skills: $VENDOR_DIR/agent-skills"
log "agentmemory:  $VENDOR_DIR/agentmemory"
log "Hooks:        Installed in ~/.claude/settings.json"
echo ""
info "Next steps:"
echo "  1. Start agentmemory:  $TOOLKIT_DIR/scripts/start-memory.sh"
echo "  2. Open Claude Code in any project"
echo "  3. Use slash commands: /spec, /plan, /build, /test, /review, /ship"
echo ""
info "Optional: Edit ~/.agentmemory/.env to set your LLM provider"
echo ""

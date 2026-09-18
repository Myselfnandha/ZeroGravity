#!/usr/bin/env bash
# ==============================================================================
# Plugins Manager Script (unpack-plugins.sh)
# Unpacks, checks status of, or removes optional offline plugins in .agents/plugins/
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ARCHIVE_PATH="$SCRIPT_DIR/dist/plugins-archive.tar.xz"
PLUGINS_DIR="$SCRIPT_DIR/.agents/plugins"

ACTION="${1:-unpack}"

case "$ACTION" in
    unpack|--unpack|restore|--restore)
        if [[ ! -f "$ARCHIVE_PATH" ]]; then
            echo "❌ Error: Archive not found at $ARCHIVE_PATH"
            exit 1
        fi
        echo "📦 Unpacking plugins archive to $PLUGINS_DIR..."
        mkdir -p "$PLUGINS_DIR"
        tar -xJf "$ARCHIVE_PATH" -C "$PLUGINS_DIR"
        echo "✅ Plugins successfully unpacked to $PLUGINS_DIR."
        ;;
    remove|--remove|clean|--clean)
        echo "🧹 Removing unpacked offline plugins from $PLUGINS_DIR..."
        rm -rf "$PLUGINS_DIR"/antigravity-awesome-skills "$PLUGINS_DIR"/antigravity-bundle-*
        echo "✅ Unpacked plugins removed. (Active workspace plugins like ponytail preserved)."
        ;;
    status|--status)
        echo "📊 Plugin Storage Status:"
        if [[ -d "$PLUGINS_DIR/antigravity-awesome-skills" ]]; then
            echo "  • State: Unpacked (Extended offline library active)"
            du -sh "$PLUGINS_DIR"
        else
            echo "  • State: Lean (Archived in dist/plugins-archive.tar.xz)"
            if [[ -f "$ARCHIVE_PATH" ]]; then
                ls -lh "$ARCHIVE_PATH" | awk '{print "  • Archive size: " $5}'
            fi
            du -sh "$PLUGINS_DIR"
        fi
        ;;
    help|--help|-h)
        echo "Usage: ./unpack-plugins.sh [unpack|remove|status|help]"
        echo ""
        echo "Commands:"
        echo "  unpack  (default) Extract plugins from dist/plugins-archive.tar.xz"
        echo "  remove            Remove unpacked plugins to minimize workspace size"
        echo "  status            Show current plugin storage state and sizes"
        echo "  help              Show this help menu"
        ;;
    *)
        echo "❌ Unknown option: $ACTION"
        echo "Run './unpack-plugins.sh help' for usage."
        exit 1
        ;;
esac

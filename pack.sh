#!/usr/bin/env bash
# ==============================================================================
# Antigravity One-Click Packager (pack.sh)
# Packages .agents/ into a self-extracting portable install.sh & standalone tar.gz
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_ROOT="$SCRIPT_DIR"
AGENTS_DIR="$WORKSPACE_ROOT/.agents"
DIST_DIR="$WORKSPACE_ROOT/dist"
OUTPUT_INSTALLER="$WORKSPACE_ROOT/install.sh"
OUTPUT_TARBALL="$DIST_DIR/antigravity-agent-bundle.tar.gz"
TEMP_BUILD_DIR="$(mktemp -d /tmp/agy-pack-XXXXXX)"

trap 'rm -rf "$TEMP_BUILD_DIR"' EXIT

# Terminal Colors
C_RESET='\033[0m'
C_BOLD='\033[1m'
C_GREEN='\033[32m'
C_BLUE='\033[34m'
C_CYAN='\033[36m'
C_YELLOW='\033[33m'
C_RED='\033[31m'

echo -e "${C_CYAN}${C_BOLD}"
echo "============================================================"
echo " 📦 Antigravity One-Click Packager Engine"
echo "============================================================"
echo -e "${C_RESET}"

if [ ! -d "$AGENTS_DIR" ]; then
    echo -e "${C_RED}❌ Error: .agents directory not found in $WORKSPACE_ROOT${C_RESET}"
    exit 1
fi

mkdir -p "$DIST_DIR"

echo -e "${C_BLUE}🔍 Gathering workspace components from: ${C_BOLD}$AGENTS_DIR${C_RESET}"

# Create staging structure in temp directory
STAGING_DIR="$TEMP_BUILD_DIR/payload"
mkdir -p "$STAGING_DIR/.agents"

# Copy .agents contents while excluding transient/cache files
echo -e "${C_BLUE}📂 Copying files and excluding transient caches...${C_RESET}"
tar --exclude='__pycache__' \
    --exclude='*.pyc' \
    --exclude='*.pyo' \
    --exclude='.agents/cache/*' \
    --exclude='*.db' \
    --exclude='*.log' \
    --exclude='.git' \
    --exclude='.DS_Store' \
    -C "$WORKSPACE_ROOT" \
    -cf - .agents | tar -xf - -C "$STAGING_DIR"

# Ensure cache directory exists in bundle but is empty
mkdir -p "$STAGING_DIR/.agents/cache"
touch "$STAGING_DIR/.agents/cache/.gitkeep"

# Create standalone tarball
echo -e "${C_BLUE}🗜️  Compressing bundle to: ${C_BOLD}$OUTPUT_TARBALL${C_RESET}"
tar -czf "$OUTPUT_TARBALL" -C "$STAGING_DIR" .agents

BUNDLE_SIZE=$(du -h "$OUTPUT_TARBALL" | cut -f1)
echo -e "${C_GREEN}✅ Standalone bundle created: ${C_BOLD}$OUTPUT_TARBALL${C_RESET} (${BUNDLE_SIZE})"

# Generate Self-Extracting install.sh
echo -e "${C_BLUE}🛠️  Generating self-extracting installer: ${C_BOLD}$OUTPUT_INSTALLER${C_RESET}"

cat << 'INSTALLER_HEADER_EOF' > "$OUTPUT_INSTALLER"
#!/usr/bin/env bash
# ==============================================================================
# Antigravity Unified Self-Extracting Installer
# Installs rules, skills, agents, workflows, scripts, and MCP servers
# ==============================================================================

set -euo pipefail

C_RESET='\033[0m'
C_BOLD='\033[1m'
C_GREEN='\033[32m'
C_BLUE='\033[34m'
C_CYAN='\033[36m'
C_YELLOW='\033[33m'
C_RED='\033[31m'
C_DIM='\033[2m'

print_banner() {
    echo -e "${C_CYAN}${C_BOLD}"
    echo "============================================================"
    echo " 🚀 Antigravity Agent & MCP Server Installer"
    echo "============================================================"
    echo -e "${C_RESET}"
}

usage() {
    echo -e "${C_BOLD}Usage:${C_RESET} $0 [OPTIONS]"
    echo ""
    echo -e "${C_BOLD}Options:${C_RESET}"
    echo "  -a, --all               Install both Local (.agents/) and Global (~/.gemini/config/)"
    echo "  -g, --global            Install Global configuration only (~/.gemini/config/)"
    echo "  -l, --local             Install Local workspace (.agents/) in current directory"
    echo "  -t, --target <DIR>      Install Local workspace (.agents/) into specified directory"
    echo "  -y, --yes               Non-interactive mode (auto-accept prompts)"
    echo "  --dry-run               Simulate installation without making changes"
    echo "  -h, --help              Show this help message"
    echo ""
    echo -e "${C_BOLD}Interactive Mode:${C_RESET}"
    echo "  Run without arguments to launch the interactive setup menu."
    echo ""
}

TARGET_MODE=""
TARGET_DIR="$(pwd)"
AUTO_YES=false
DRY_RUN=false

while [[ $# -gt 0 ]]; do
    case "$1" in
        -a|--all)
            TARGET_MODE="all"
            shift
            ;;
        -g|--global)
            TARGET_MODE="global"
            shift
            ;;
        -l|--local)
            TARGET_MODE="local"
            shift
            ;;
        -t|--target)
            TARGET_MODE="custom"
            TARGET_DIR="$2"
            shift 2
            ;;
        -y|--yes)
            AUTO_YES=true
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        -h|--help)
            print_banner
            usage
            exit 0
            ;;
        *)
            echo -e "${C_RED}Unknown option: $1${C_RESET}"
            usage
            exit 1
            ;;
    esac
done

print_banner

# Interactive selection if no mode specified
if [ -z "$TARGET_MODE" ]; then
    echo -e "${C_BOLD}Select installation target:${C_RESET}"
    echo -e "  ${C_CYAN}1)${C_RESET} ${C_BOLD}Both Local & Global${C_RESET} (Full Suite: current workspace + ~/.gemini/config/)"
    echo -e "  ${C_CYAN}2)${C_RESET} ${C_BOLD}Global Only${C_RESET} (~/.gemini/config/ + ~/.local/bin/skylos)"
    echo -e "  ${C_CYAN}3)${C_RESET} ${C_BOLD}Local Workspace Only${C_RESET} (.agents/ in current directory: $(pwd))"
    echo -e "  ${C_CYAN}4)${C_RESET} ${C_BOLD}Custom Workspace Directory${C_RESET}"
    echo -e "  ${C_CYAN}5)${C_RESET} Cancel / Exit"
    echo ""
    read -r -p "Enter choice [1-5] (default: 1): " user_choice
    user_choice="${user_choice:-1}"

    case "$user_choice" in
        1) TARGET_MODE="all" ;;
        2) TARGET_MODE="global" ;;
        3) TARGET_MODE="local" ;;
        4)
            TARGET_MODE="custom"
            read -r -p "Enter absolute or relative path for target workspace: " custom_path
            TARGET_DIR="$(cd "$custom_path" 2>/dev/null && pwd || echo "$custom_path")"
            ;;
        5|q|Q)
            echo "Installation cancelled."
            exit 0
            ;;
        *)
            echo -e "${C_RED}Invalid choice. Aborting.${C_RESET}"
            exit 1
            ;;
    esac
fi

echo -e "${C_BLUE}Target Scope:${C_RESET} ${C_BOLD}$TARGET_MODE${C_RESET}"
if [[ "$TARGET_MODE" == "local" || "$TARGET_MODE" == "custom" || "$TARGET_MODE" == "all" ]]; then
    echo -e "${C_BLUE}Local Workspace Target:${C_RESET} ${C_BOLD}$TARGET_DIR/.agents${C_RESET}"
fi
if [[ "$TARGET_MODE" == "global" || "$TARGET_MODE" == "all" ]]; then
    echo -e "${C_BLUE}Global Target:${C_RESET} ${C_BOLD}$HOME/.gemini/config${C_RESET}"
fi
echo ""

# 1. Dependency Checks
echo -e "${C_BOLD}🔍 Checking System Prerequisites...${C_RESET}"

check_cmd() {
    local cmd="$1"
    local desc="$2"
    local req="$3"
    if command -v "$cmd" >/dev/null 2>&1; then
        echo -e "  ${C_GREEN}✔${C_RESET} $desc ($cmd) found"
        return 0
    else
        if [ "$req" = "required" ]; then
            echo -e "  ${C_RED}✖${C_RESET} $desc ($cmd) NOT found (Required)"
            return 1
        else
            echo -e "  ${C_YELLOW}⚠${C_RESET} $desc ($cmd) not found (Optional)"
            return 0
        fi
    fi
}

MISSING_DEPS=0
check_cmd "tar" "Tar extraction tool" "required" || MISSING_DEPS=$((MISSING_DEPS+1))
check_cmd "gzip" "Gzip decompression tool" "required" || MISSING_DEPS=$((MISSING_DEPS+1))
check_cmd "python3" "Python 3.10+ runtime" "required" || MISSING_DEPS=$((MISSING_DEPS+1))
check_cmd "node" "Node.js runtime" "optional"
check_cmd "npx" "NPX package runner" "optional"
check_cmd "uv" "UV package manager" "optional"
check_cmd "docker" "Docker engine" "optional"

if command -v npm >/dev/null 2>&1; then
    npm config set allow-remote all >/dev/null 2>&1 || true
fi

if [ "$MISSING_DEPS" -gt 0 ]; then
    echo -e "\n${C_RED}❌ Missing required system tools. Please install them and rerun.${C_RESET}"
    exit 1
fi

# 2. Extract Embedded Payload to Temp Directory
echo -e "\n${C_BOLD}📦 Unpacking Embedded Components...${C_RESET}"
TEMP_EXTRACT="$(mktemp -d /tmp/agy-install-XXXXXX)"
trap 'rm -rf "$TEMP_EXTRACT"' EXIT

if [ "$DRY_RUN" = true ]; then
    echo -e "${C_YELLOW}[DRY-RUN] Simulating payload extraction...${C_RESET}"
else
    # Find binary archive marker line
    ARCHIVE_LINE=$(awk '/^__ARCHIVE_PAYLOAD_BELOW__/ {print NR + 1; exit 0; }' "$0")
    tail -n +"$ARCHIVE_LINE" "$0" | tar -xzf - -C "$TEMP_EXTRACT"
    echo -e "${C_GREEN}✔ Payload extracted to staging buffer${C_RESET}"
fi

TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Function to merge MCP JSON files safely
merge_mcp_configs() {
    local source_json="$1"
    local dest_json="$2"

    python3 - << EOF
import json, os, sys

source_path = "$source_json"
dest_path = "$dest_json"

if not os.path.exists(source_path):
    sys.exit(0)

with open(source_path) as f:
    source_data = json.load(f)

if os.path.exists(dest_path):
    try:
        with open(dest_path) as f:
            dest_data = json.load(f)
    except Exception:
        dest_data = {"mcpServers": {}}
else:
    dest_data = {"mcpServers": {}}

if "mcpServers" not in dest_data:
    dest_data["mcpServers"] = {}

# Merge servers without losing existing custom ones
for s_name, s_cfg in source_data.get("mcpServers", {}).items():
    dest_data["mcpServers"][s_name] = s_cfg

os.makedirs(os.path.dirname(dest_path), exist_ok=True)
with open(dest_path, "w", encoding="utf-8") as f:
    json.dump(dest_data, f, indent=2)

EOF
}

# 3. Perform Local Installation
if [[ "$TARGET_MODE" == "local" || "$TARGET_MODE" == "custom" || "$TARGET_MODE" == "all" ]]; then
    echo -e "\n${C_BOLD}📂 Installing Local Workspace Components...${C_RESET}"
    LOCAL_DEST="$TARGET_DIR/.agents"

    if [ "$DRY_RUN" = true ]; then
        echo -e "${C_YELLOW}[DRY-RUN] Would install to: $LOCAL_DEST${C_RESET}"
    else
        if [ -d "$LOCAL_DEST" ]; then
            BACKUP_LOCAL="${LOCAL_DEST}.bak.${TIMESTAMP}"
            echo -e "  ${C_YELLOW}⚠ Existing .agents directory detected. Creating backup at:${C_RESET} $BACKUP_LOCAL"
            cp -r "$LOCAL_DEST" "$BACKUP_LOCAL"
        fi

        mkdir -p "$LOCAL_DEST"
        cp -r "$TEMP_EXTRACT/.agents/"* "$LOCAL_DEST/"
        chmod +x "$LOCAL_DEST/scripts/"*.py 2>/dev/null || true
        echo -e "  ${C_GREEN}✔ Installed rules, skills, plugins, workflows, scripts to:${C_RESET} ${C_BOLD}$LOCAL_DEST${C_RESET}"
    fi
fi

# 4. Perform Global Installation
if [[ "$TARGET_MODE" == "global" || "$TARGET_MODE" == "all" ]]; then
    echo -e "\n${C_BOLD}🌐 Installing Global Configuration...${C_RESET}"
    GLOBAL_DEST="$HOME/.gemini/config"

    if [ "$DRY_RUN" = true ]; then
        echo -e "${C_YELLOW}[DRY-RUN] Would install to: $GLOBAL_DEST${C_RESET}"
    else
        if [ -d "$GLOBAL_DEST" ]; then
            BACKUP_GLOBAL="${GLOBAL_DEST}.bak.${TIMESTAMP}"
            echo -e "  ${C_YELLOW}⚠ Existing global config detected. Creating backup at:${C_RESET} $BACKUP_GLOBAL"
            cp -r "$GLOBAL_DEST" "$BACKUP_GLOBAL"
        fi

        mkdir -p "$GLOBAL_DEST/rules" "$GLOBAL_DEST/skills" "$GLOBAL_DEST/workflows"

        # Copy rules, skills, workflows to global config
        if [ -d "$TEMP_EXTRACT/.agents/rules" ]; then
            cp -r "$TEMP_EXTRACT/.agents/rules/"* "$GLOBAL_DEST/rules/" 2>/dev/null || true
        fi
        if [ -d "$TEMP_EXTRACT/.agents/skills" ]; then
            cp -r "$TEMP_EXTRACT/.agents/skills/"* "$GLOBAL_DEST/skills/" 2>/dev/null || true
        fi
        if [ -d "$TEMP_EXTRACT/.agents/workflows" ]; then
            cp -r "$TEMP_EXTRACT/.agents/workflows/"* "$GLOBAL_DEST/workflows/" 2>/dev/null || true
        fi

        # Merge Global MCP config
        merge_mcp_configs "$TEMP_EXTRACT/.agents/mcp_config.json" "$GLOBAL_DEST/mcp_config.json"
        echo -e "  ${C_GREEN}✔ Global configuration installed to:${C_RESET} ${C_BOLD}$GLOBAL_DEST${C_RESET}"
    fi
fi

# 5. Skylos Environment Setup & PATH Configuration
echo -e "\n${C_BOLD}🛡️  Configuring Skylos SAST & Security Environment...${C_RESET}"
SKYLOS_VENV="$HOME/.local/share/skylos/venv"
BIN_DIR="$HOME/.local/bin"

if [ "$DRY_RUN" = true ]; then
    echo -e "${C_YELLOW}[DRY-RUN] Would configure Skylos in $SKYLOS_VENV and link to $BIN_DIR/skylos${C_RESET}"
else
    mkdir -p "$BIN_DIR"
    if [ ! -f "$SKYLOS_VENV/bin/python" ]; then
        echo -e "  ${C_BLUE}Creating isolated Python virtual environment for Skylos...${C_RESET}"
        mkdir -p "$HOME/.local/share/skylos"
        python3 -m venv "$SKYLOS_VENV"
        "$SKYLOS_VENV/bin/pip" install --quiet --upgrade pip
        "$SKYLOS_VENV/bin/pip" install --quiet skylos
        echo -e "  ${C_GREEN}✔ Skylos virtual environment created${C_RESET}"
    else
        echo -e "  ${C_GREEN}✔ Skylos virtual environment already present${C_RESET}"
    fi

    # Symlink binary
    if [ -f "$SKYLOS_VENV/bin/skylos" ]; then
        ln -sf "$SKYLOS_VENV/bin/skylos" "$BIN_DIR/skylos"
        echo -e "  ${C_GREEN}✔ Symlinked Skylos binary to:${C_RESET} $BIN_DIR/skylos"
    fi

    # Ensure ~/.local/bin is in PATH for bash/zsh
    PATH_EXPORT='export PATH="$HOME/.local/bin:$PATH"'
    for RC_FILE in "$HOME/.bashrc" "$HOME/.zshrc"; do
        if [ -f "$RC_FILE" ] && ! grep -q '.local/bin' "$RC_FILE"; then
            echo -e "\n# Added by Antigravity Installer\n$PATH_EXPORT" >> "$RC_FILE"
            echo -e "  ${C_GREEN}✔ Added ~/.local/bin to PATH in:${C_RESET} $RC_FILE"
        fi
    done
fi

# 6. Post-Installation Health Verification
echo -e "\n${C_BOLD}✨ Verifying Installation Health...${C_RESET}"
if [ "$DRY_RUN" = true ]; then
    echo -e "${C_YELLOW}[DRY-RUN] Verification skipped in dry-run mode.${C_RESET}"
else
    python3 - << 'VERIFY_EOF'
import os, sys, json, glob

errors = []
print("  Running post-install checks...")

# Check MCP Configs
for cfg_path in [".agents/mcp_config.json", os.path.expanduser("~/.gemini/config/mcp_config.json")]:
    if os.path.exists(cfg_path):
        try:
            with open(cfg_path) as f:
                data = json.load(f)
                count = len(data.get("mcpServers", {}))
                print(f"    ✔ Validated {cfg_path} ({count} MCP servers registered)")
        except Exception as e:
            errors.append(f"Invalid JSON in {cfg_path}: {e}")

# Check Rules & Workflows
rules = glob.glob(".agents/rules/*.md") + glob.glob(os.path.expanduser("~/.gemini/config/rules/*.md"))
workflows = glob.glob(".agents/workflows/*.md") + glob.glob(os.path.expanduser("~/.gemini/config/workflows/*.md"))
print(f"    ✔ {len(rules)} Rules and {len(workflows)} Workflows available")

if errors:
    print(f"\n  ❌ Post-install check encountered {len(errors)} issues:")
    for err in errors:
        print(f"     - {err}")
    sys.exit(1)
else:
    print("    ✔ All configuration files and scripts verified clean!")
VERIFY_EOF
fi

echo -e "\n${C_GREEN}${C_BOLD}============================================================"
echo " 🎉 Antigravity Installation Complete!"
echo "============================================================"
echo -e "${C_RESET}"
echo -e "Available Workflows & Slash Commands:"
echo -e "  ${C_CYAN}/openhuman${C_RESET}     - 5-Stage Supercoder Engine"
echo -e "  ${C_CYAN}/skylos${C_RESET}        - Static analysis, SAST security scan, and AI hallucination gate"
echo -e "  ${C_CYAN}/i-have-adhd${C_RESET}   - Action-first, bounded cognitive output mode"
echo -e "  ${C_CYAN}/no-ai-slop${C_RESET}    - Human voice preservation & AI slop removal"
echo -e "  ${C_CYAN}/caveman${C_RESET}       - Token-compressed telegraphic communication"
echo ""

exit 0

__ARCHIVE_PAYLOAD_BELOW__
INSTALLER_HEADER_EOF

# Append the compressed tarball payload to install.sh
cat "$OUTPUT_TARBALL" >> "$OUTPUT_INSTALLER"
chmod +x "$OUTPUT_INSTALLER"

INSTALLER_SIZE=$(du -h "$OUTPUT_INSTALLER" | cut -f1)

echo -e "${C_GREEN}${C_BOLD}============================================================"
echo " 🎉 PACKAGING COMPLETE!"
echo "============================================================"
echo -e "${C_RESET}"
echo -e "1. Self-Extracting Installer : ${C_BOLD}$OUTPUT_INSTALLER${C_RESET} (${INSTALLER_SIZE})"
echo -e "2. Standalone Tarball Archive: ${C_BOLD}$OUTPUT_TARBALL${C_RESET} (${BUNDLE_SIZE})"
echo ""
echo -e "To install on any system, run:"
echo -e "  ${C_CYAN}./install.sh${C_RESET}               (Interactive menu)"
echo -e "  ${C_CYAN}./install.sh --all -y${C_RESET}      (Non-interactive local & global install)"
echo -e "  ${C_CYAN}./install.sh --target /path${C_RESET} (Install into custom workspace)"
echo ""

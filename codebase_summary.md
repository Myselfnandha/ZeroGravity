# Codebase Summary: agent

## Overview
- **Scan Date:** 2026-09-06 21:32:25
- **Source Folder:** `/home/nandha/Desktop/agent`
- **Total Text Files:** 2
- **Estimated Token Count:** 427

## File Summaries

- `.skylos/cache/dependency_versions.json` — JSON data
- `install.sh` — Shell script (bash)

## Directory Tree
```text
agent/
├── .skylos/
│   └── cache/
│       └── dependency_versions.json
└── install.sh
```

## File Contents

### File: `.skylos/cache/dependency_versions.json`
- **Summary:** JSON data
- **Path:** `.skylos/cache/dependency_versions.json`
- **Estimated Tokens:** 194
- **mtime:** 1788644752.667

```json
{
  "schema_version": 2,
  "statuses": {
    "npm:yaml:<package-only>": "present",
    "PyPI:pyyaml:6.0": "present",
    "npm:@modelcontextprotocol/server-everything:<package-only>": "present",
    "npm:@dbos-inc/dbos-sdk:<package-only>": "present",
    "npm:@playwright/test:<package-only>": "present",
    "npm:@trigger.dev/sdk:<package-only>": "present",
    "npm:@trigger.dev/sdk:3.3.0": "present",
    "npm:typescript:<package-only>": "present",
    "npm:react:<package-only>": "present",
    "npm:react-dom:<package-only>": "present",
    "npm:react-router-dom:<package-only>": "present",
    "npm:package:<package-only>": "present",
    "npm:@shopify/cli:<package-only>": "present",
    "npm:react:18.2.0": "present",
    "npm:expo-cli:<package-only>": "present"
  }
}
```

---

### File: `install.sh`
- **Summary:** Shell script (bash)
- **Path:** `install.sh`
- **Estimated Tokens:** 233
- **mtime:** 1788591566.769

```bash
#!/bin/bash

set -e

echo "🚀 Deploying Antigravity skills to global production..."

# Define paths
SOURCE_DIR="/home/nandha/Desktop/agent/.agents"
CONFIG_DIR="$HOME/.gemini/config/plugins"
LINK_NAME="master-skills"
LINK_PATH="$CONFIG_DIR/$LINK_NAME"

# Ensure source exists
if [ ! -d "$SOURCE_DIR" ]; then
    echo "❌ Error: Source directory $SOURCE_DIR does not exist."
    exit 1
fi

# Create global config directory if it doesn't exist
echo "📁 Ensuring global config directory exists at $CONFIG_DIR..."
mkdir -p "$CONFIG_DIR"

# Remove existing symlink or folder if it exists
if [ -e "$LINK_PATH" ] || [ -L "$LINK_PATH" ]; then
    echo "♻️ Removing existing symlink/directory at $LINK_PATH..."
    rm -rf "$LINK_PATH"
fi

# Create new symlink
echo "🔗 Creating symlink: $LINK_PATH -> $SOURCE_DIR..."
ln -s "$SOURCE_DIR" "$LINK_PATH"

echo "✅ Success! All 1,732+ skills and rules are now globally active across all your projects."
```

---


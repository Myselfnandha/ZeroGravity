# 🛡️ ZeroGravity OS: Anti-Patterns Matrix & Known Gotchas

This document serves as the **Persistent Anti-Patterns Matrix** for OpenHuman and ZeroGravity OS.
Before taking any architectural, coding, or tooling action, the agent must sweep this matrix (Stage 1) to immunize itself against known failure modes.

---

## 📊 Anti-Patterns & Invariant Prevention Matrix

| ID | ⚠️ Mistake / Anti-Pattern | 🔍 Root Cause & Triggers | 🛡️ Invariant Prevention Strategy |
| :--- | :--- | :--- | :--- |
| **AP-001** | **ANSI stdout pollution in JSON-RPC** | `npx` in modern npm prints colored notices to stdout, corrupting JSON-RPC streams (`invalid character '\x1b'`). | Wrap Node-based MCP servers with `mcp-npx` enforcing `NO_COLOR=1`, `npm_config_loglevel=silent`, and `npx --silent -y`. |
| **AP-002** | **MCP Interactive Auth Hangs** | Servers like Sentry default to browser/device-code flow if access tokens are omitted from arguments. | Explicitly pass `--access-token ${TOKEN}` in CLI arguments alongside environment variables. |
| **AP-003** | **Indexer Bloat on Archives** | `analyze.py` crawling packed installer scripts (`install.sh`, `*.tar.xz`) inflates codebase DB to 40MB+. | Add binary payloads, installers, and `.tar.*` archives to `SELF_EXCLUDES` list in all scanners. |
| **AP-004** | **Background MCP Resource Leaks** | Leaving MCP servers running permanently in background consumes idle RAM/CPU and causes port conflicts. | **Zero-Default Profile**: Start with `{ "mcpServers": {} }`. Enable on-demand (`mcp.py enable <name>`) and auto-close upon task completion. |
| **AP-005** | **Recursive `view_file` Scanning** | Looping `view_file` sequentially across dozens of source files blows context window and is slow. | Run `analyze.py <folder> --check --auto-heal` and read consolidated `codebase_summary.md` in one single read. |

---

## 🛠️ Platform & Tooling Gotchas

### 1. Skylos SAST on Meta-Directories
- **Gotcha**: Scanning directories containing 1,450+ offline skill scripts causes slow traversal.
- **Rule**: Pass `--exclude .agents --exclude .agent --exclude venv` when running whole-project audits.

### 2. PEP 668 & Linux System Python Isolation
- **Gotcha**: Modern Linux distros (Arch, Debian 12+, Ubuntu 24+) block system-wide `pip install`.
- **Rule**: Provision isolated virtual environments under `~/.local/share/<tool>/venv` and symlink CLI entrypoints to `~/.local/bin/`.

### 3. NPM Remote Package Authorization (`EALLOWREMOTE`)
- **Gotcha**: npm v12+ defaults `allow-remote="none"`, failing to install git-based tarball dependencies.
- **Rule**: Configure `npm config set allow-remote all` during environment setup.

---

## 🔄 The 2-Way Immunization Protocol
1. **Pre-Action Check**: Before executing a tool call or creating a component, verify against this matrix.
2. **Post-Failure Distillation**: When a mistake, test failure, or user correction occurs:
   - Identify the exact root cause.
   - Formulate an Invariant Prevention Strategy.
   - Append to this matrix and `anti_patterns.json` via `zg learn add`.

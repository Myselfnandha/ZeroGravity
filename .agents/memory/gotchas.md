# Known Gotchas, Platform Quirks & Solutions

This document catalogs non-obvious failure modes, platform quirks, and workarounds discovered during engineering sessions.

---

## Cataloged Gotchas

### 1. Skylos AST Traversal on Large Meta-Directories
- **Issue**: Scanning workspaces containing thousands of offline skill scripts (e.g. `.agents/skills/`) can cause long traversal times.
- **Solution**: Always pass `--exclude .agents --exclude .agent --exclude venv` when running comprehensive project audits.

### 2. PEP 668 & Python 3.14 Package Isolation
- **Issue**: System Python on Linux restricts global `pip install`.
- **Solution**: Maintain isolated virtual environments in `~/.local/share/<tool>/venv` and symlink binaries to `~/.local/bin/`.

### 3. MCP Plural `.agents/` Path Resolution
- **Issue**: Older scripts checked `.agent/` (singular) rather than `.agents/` (plural).
- **Solution**: Always resolve both `.agents` and `.agent` in scripts and configuration discovery loops.

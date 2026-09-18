# Contributing to Antigravity Supercoder OS

Thank you for contributing to the Antigravity autonomous agent ecosystem!

---

## 🏗️ Repository Architecture

```
.
├── .agents/                    # Core Agent System Assets
│   ├── agents/                 # Specialist autonomous personas (OpenHuman, etc.)
│   ├── rules/                  # Behavioral gates & coding standards
│   ├── skills/                 # On-demand domain expertise modules
│   ├── workflows/              # Slash command workflows (/openhuman, /mcp, etc.)
│   ├── plugins/                # Workspace plugins (e.g. ponytail)
│   ├── memory/                 # Durable Memory Tree (decisions, gotchas, goals)
│   ├── scripts/                # Verification, analysis, and caching utilities
│   ├── mcp-registry/           # MCP server recipes & catalog
│   └── mcp_config.json         # Workspace MCP configuration
├── pack.sh                     # Packaging engine (builds self-extracting install.sh)
├── install.sh                  # Portable self-extracting installer
├── unpack-plugins.sh           # Offline plugins archive manager (unpack/remove)
├── Makefile                    # Developer commands
└── .github/workflows/          # Automated CI pipeline
```

---

## 🛠️ Development Workflow

1. **Clone & Setup**:
   ```bash
   git clone <repo-url>
   cd agent
   ```

2. **Verify Environment**:
   ```bash
   make check
   ```

3. **Adding a New Workflow**:
   - Create `.agents/workflows/<workflow-name>.md`
   - Include standard YAML frontmatter:
     ```markdown
     ---
     description: <concise summary of workflow>
     ---

     # /<command> - Title
     $ARGUMENTS
     ```

4. **Adding an MCP Server Recipe**:
   - Add recipe markdown to `.agents/mcp-registry/recipes/<server-name>.md`
   - Update `.agents/mcp-registry/INDEX.md`
   - Register STDIO runner in `.agents/mcp_config.json`

5. **Re-Packing the Distribution**:
   ```bash
   make pack
   ```

6. **Running the Quality Gate**:
   ```bash
   make test
   ```

---

## 📋 Coding Standards

- Follow AAA (Arrange, Act, Assert) pattern for testing.
- Ensure all markdown files have valid YAML frontmatter delimiters.
- Keep codebase lean: test scripts with `make test` before committing.

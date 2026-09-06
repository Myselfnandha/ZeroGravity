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
│   ├── workflows/              # Slash command workflows (/openhuman, /skylos, etc.)
│   ├── plugins/                # Bundled skill packages
│   ├── memory/                 # Durable Memory Tree (decisions, gotchas, goals)
│   ├── scripts/                # Verification, analysis, and caching utilities
│   ├── mcp-registry/           # MCP server recipes & catalog
│   └── mcp_config.json         # Workspace MCP configuration
├── pack.sh                     # Packaging engine (builds self-extracting install.sh)
├── install.sh                  # Portable self-extracting installer
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

3. **Adding a New Skill**:
   - Create directory `.agents/skills/<skill-name>/`
   - Include `SKILL.md` with standard YAML frontmatter:
     ```markdown
     ---
     name: <skill-name>
     description: <concise summary of when to activate this skill>
     ---
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
- Run `skylos` SAST analysis on all Python scripts before committing.

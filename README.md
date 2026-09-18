<div align="center">

# 🌌 ZeroGravity OS
### *Autonomous Supercoder OS • Zero-Default MCPs • 28 Workflows*

[![Package Size](https://img.shields.io/badge/Size-1.3%20MB-brightgreen.svg)]()
[![MCP Servers](https://img.shields.io/badge/MCPs-13%20On--Demand-blueviolet.svg)](https://modelcontextprotocol.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

<p align="center">
  <b>A universal, zero-weight (1.3 MB) AI developer framework.<br/>Zero background processes. Dynamic on-demand tools. Persistent memory.</b>
</p>

[Install](#-install) • [Workflows](#-workflows) • [MCPs](#-mcp-servers) • [Memory](#-memory-tree) • [Developer](#-developer-tooling)

</div>

---

## ⚡ Install

```bash
# Deploy into current workspace
npx zerogravity

# Deploy into a specific project
npx zerogravity /path/to/my-project -y

# Deploy everywhere (workspace + global config)
npx zerogravity --all -y

# Update existing workspace (preserves your memory & configs)
npx zerogravity update

# Or install globally
npm install -g zerogravity
```

**What it does:** Copies the `.agents/` framework into your project root. That's it — no daemons, no config files to manage, no build steps.

<details>
<summary><b>Alternative install methods</b></summary>

#### Direct copy
```bash
cp -r .agents /path/to/any/project/
```

#### Self-extracting installer
```bash
./install.sh --local -y    # Workspace only
./install.sh --global -y   # Global (~/.gemini/config/)
./install.sh --all -y      # Both
```

#### Restore offline plugins
```bash
./unpack-plugins.sh
```

</details>

---

## 💬 Workflows

28 slash commands organized by what you're doing:

### 🔨 Build

| Command | What it does |
|:---|:---|
| `/build-feature` | 5-stage supercoding pipeline: Context Sweep → Blueprint → CodeCrush → AAA Test → Sync |
| `/create` | Scaffold a new application from scratch |
| `/enhance` | Add or update features in an existing app |
| `/spec-driven-dev` | Full spec-driven cycle: specify → plan → tasks → implement with review gates |
| `/prd-workflow` | Matt Pocock workflow: Triage → PRD → Issues → Implementation → Handoff |

### 🧠 Think

| Command | What it does |
|:---|:---|
| `/brainstorm` | Structured multi-option brainstorming before implementation |
| `/plan` | Generate a project plan (no code — plan only) |
| `/codebase-design` | Deep module design: interfaces, seams, testability |
| `/domain-model` | Build domain terminology and ubiquitous language |
| `/orchestrate` | Coordinate multiple agents for complex multi-perspective tasks |

### 🐛 Verify

| Command | What it does |
|:---|:---|
| `/debug` | Systematic root-cause investigation |
| `/test` | Generate and run tests (unit, integration, E2E) |
| `/deploy` | Pre-flight checks + deployment execution |
| `/audit-agent` | Independent iFixAi safety and alignment audit |

### 🎨 Design

| Command | What it does |
|:---|:---|
| `/design-ui` | Plan and implement UI with modern design patterns |
| `/react-components` | Search and install 1,105+ ReUI/shadcn components |

### ⚙️ Control

| Command | What it does |
|:---|:---|
| `/effort` | Set reasoning depth (routes to low/mid/high/ultra) |
| `/effort-low` | Fire & forget — act immediately, skip plans |
| `/effort-mid` | Balanced default — research enough, then act |
| `/effort-high` | Thorough — full context sweep, verify everything |
| `/effort-ultra` | Leave nothing unchecked — exhaustive analysis |
| `/mcp` | Enable/disable/list MCP servers on demand |
| `/skill` | Search and activate specialized skills from 1,450+ library |

### 📝 Communication

| Command | What it does |
|:---|:---|
| `/focus` | Action-first output: numbered steps, no tangents, time estimates |
| `/humanize-text` | Strip AI slop patterns, preserve human voice |
| `/compress-tokens` | Ultra-compressed mode — ~75% fewer tokens |
| `/teach-concept` | Deep technical concept explanations |
| `/yagni-simplify` | Lazy senior dev mode — eliminate over-engineering |

---

## 🔌 MCP Servers

13 servers, zero running at startup. Enable what you need:

```bash
npx zerogravity mcp list              # Browse catalog
npx zerogravity mcp enable <name>     # Activate a server
npx zerogravity mcp disable <name>    # Deactivate
```

Or via slash command in chat: `/mcp enable filesystem`

### ⚡ Zero-Config (enable instantly)

| Server | Category | Description |
|:---|:---|:---|
| `playwright` | Testing | Headless browser automation, visual snapshots & E2E testing |
| `chrome-devtools` | Browser | Live Chrome DOM inspection, Lighthouse audits |
| `serena` | Code Intel | Semantic AST navigation, project memory & refactoring |
| `docker-gateway` | Containers | Docker container lifecycle, sandbox builds |
| `context7` | Docs | Real-time library documentation resolver |
| `shadcn` | Frontend | Shadcn UI registry component discovery and installation |
| `magic` | Frontend | 21st.dev Magic UI design inspiration & generation |
| `reui` | Frontend | ReUI 1,105+ React components, blocks, and motion icons |
| `ponytail` | Productivity | YAGNI enforcement & minimal diffs |

### 🔑 Bring-Your-Key

| Server | Category | Description | Setup |
|:---|:---|:---|:---|
| `github` | VCS | Issues, PRs, repository search & automation | `GITHUB_TOKEN` |
| `supabase` | Database | Project management, migrations & SQL | Supabase access token |
| `neon` | Database | Serverless Postgres branching & SQL | Neon API key |
| `sentry` | Observability | Error telemetry, performance traces | Sentry auth token |

---

## 🧠 Memory Tree

Persistent knowledge lives in `.agents/memory/` and survives across sessions and updates:

```
.agents/memory/
├── decisions.md        # Architecture decisions and design patterns
├── gotchas.md          # Framework quirks, known bugs, workarounds
├── goals.md            # Active milestones and deliverables
└── anti_patterns.json  # Failed approaches to never repeat
```

Learning is automatic — on every correction, error recovery, or success, the agent distills lessons into memory without manual intervention.

---

## 🛠️ Developer Tooling

```bash
make help         # View all commands
make pack         # Bundle into 1.3 MB install.sh
make test         # Run test suite
make lint         # Python syntax validation
make clean        # Remove caches and build artifacts
```

---

## 📁 Structure

```
.agents/
├── workflows/      # 28 slash command workflows
├── rules/          # Core behavioral rules
├── memory/         # Persistent decisions, gotchas, goals
├── scripts/        # CLI tools and automation
├── skills/         # Specialized instruction sets
├── plugins/        # Extensible plugin bundles
└── mcp-registry/   # 13 MCP server catalog
```

---

## 📄 License

[MIT](LICENSE)

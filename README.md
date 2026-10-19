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
npx @nandhaalagesan/zerogravity

# Deploy into a specific project
npx @nandhaalagesan/zerogravity /path/to/my-project -y

# Deploy everywhere (workspace + global config)
npx @nandhaalagesan/zerogravity --all -y

# Update existing workspace (preserves your memory & configs)
npx @nandhaalagesan/zerogravity update

# Or install globally
npm install -g @nandhaalagesan/zerogravity
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
```

</details>

---

## 💬 Workflows

20 specialized slash commands organized by developer intent:

### 🔨 Build

| Command | What it does |
|:---|:---|
| `/build-feature` | 5-stage supercoding pipeline: Context Sweep → Blueprint → CodeCrush → AAA Test → Sync |
| `/create` | Scaffold a new application from scratch |
| `/enhance` | Add or update features in an existing app |

### 🧠 Think

| Command | What it does |
|:---|:---|
| `/brainstorm` | Structured multi-option brainstorming before implementation |
| `/codebase-design` | Deep module design: interfaces, seams, testability |
| `/domain-model` | Build domain terminology and ubiquitous language |
| `/orchestrate` | Coordinate multiple perspectives for complex architectural tasks |
| `/reach` | Universal internet router across 16 platforms (Twitter, Reddit, YouTube, Bilibili, GitHub, Exa, Jina) |

### 🐛 Verify

| Command | What it does |
|:---|:---|
| `/debug` | Systematic root-cause investigation |
| `/test` | Generate and run tests (unit, integration, E2E) |
| `/deploy` | Pre-flight checks + deployment execution |
| `/audit-agent` | Independent iFixAi safety, alignment, and accuracy audit |

### 🎨 Design

| Command | What it does |
|:---|:---|
| `/design-ui` | Plan and implement UI with modern design patterns |
| `/react-components` | Search and install 1,105+ ReUI/shadcn components |

### ⚙️ Control

| Command | What it does |
|:---|:---|
| `/effort-low` | Fire & forget — act immediately, skip plans |
| `/effort-mid` | Balanced default — research enough, then act |
| `/effort-high` | Thorough — full context sweep, verify everything |
| `/effort-ultra` | Leave nothing unchecked — exhaustive analysis |
| `/mcp` | Enable/disable/list MCP servers on demand |
| `/skill` | Search and activate specialized skills from 1,450+ library |

### 📝 Communication & Pragmatism

| Command | What it does |
|:---|:---|
| `/focus` | Action-first output: numbered steps, no tangents, time estimates |
| `/humanize-text` | Strip AI slop patterns, preserve human voice |
| `/compress-tokens` | Ultra-compressed mode — ~75% fewer tokens |
| `/yagni-simplify` | Lazy senior dev mode — eliminate over-engineering |

> **Native Antigravity Built-ins**: `/plan` (interactive planning), `/goal` (autonomous run-until-done), `/grill-me` (Socratic plan alignment), `/schedule`, `/learn`.

---

## 🔌 MCP Servers

12 verified servers, zero running at startup. Enable what you need:

```bash
npx @nandhaalagesan/zerogravity mcp list              # Browse catalog (or 'zg mcp list')
npx @nandhaalagesan/zerogravity mcp enable <name>     # Activate a server
npx @nandhaalagesan/zerogravity mcp disable <name>    # Deactivate
```

Or via slash command in chat: `/mcp enable playwright`

### ⚡ Zero-Config (enable instantly)

| Server | Category | Description |
|:---|:---|:---|
| `playwright` | Testing | Headless browser automation, visual snapshots & E2E testing |
| `chrome-devtools` | Browser | Live Chrome DOM inspection, Lighthouse audits |
| `serena` | Code Intel | Semantic AST navigation, project memory & refactoring |
| `docker-gateway` | Containers | Docker container lifecycle, sandbox builds |
| `shadcn` | Frontend | Shadcn UI registry component discovery and installation |
| `reui` | Frontend | ReUI 1,105+ React components, blocks, and motion icons |

### 🔑 Bring-Your-Key

| Server | Category | Description | Setup |
|:---|:---|:---|:---|
| `context7` | Docs | Real-time library documentation resolver | Upstash Context7 API key |
| `magic` | Frontend | 21st.dev Magic UI design inspiration & generation | Free 21st.dev API key |
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
make pack         # Bundle into standalone install.sh
make test         # Run test suite
make lint         # Python syntax validation
make clean        # Remove caches and build artifacts
```

---

## 📁 Structure

```
.agents/
├── workflows/      # 20 slash command workflows
├── rules/          # Core behavioral rules
├── memory/         # Persistent decisions, gotchas, goals
├── scripts/        # CLI tools and automation
├── skills/         # Specialized instruction sets
├── plugins/        # Extensible plugin bundles (ponytail)
└── mcp-registry/   # 12 verified MCP servers + catalog
```

---

## 📄 License

[MIT](LICENSE)

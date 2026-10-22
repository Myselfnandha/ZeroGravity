---
name: zerogravity-init
description: "Display a compact, single-page quick-access dashboard of all ZeroGravity workflows and skills on session start."
---

# ZeroGravity OS — Session Init & Quick-Access Dashboard

When invoked at conversation start, on user greeting, or when asked for ZeroGravity details, display the **Compact Quick-Access Matrix**.

The table must fit in a single screen view without scrolling, giving immediate access to every core workflow and skill:

```markdown
### 🚀 ZeroGravity OS — Quick-Access Command Matrix

| Category | Slash Command | What It Does |
| :--- | :--- | :--- |
| **Build & Plan** | `/build-feature` | 5-stage feature pipeline (Memory → Blueprint → Code → Test → Sync) |
| | `/create` | Start a brand new app from scratch with step-by-step guidance |
| | `/enhance` | Add a feature or improve existing code in this project |
| | `/spec` | Write product requirements and technical specs before coding |
| | `/plan` | Interactive native step-by-step planning mode |
| **Verify & Test** | `/verify` | Run unit tests, linters, and build checks with real terminal output |
| | `/test` | Generate and run AAA unit/integration test suites |
| | `/review` | 5-axis code quality review (correctness, security, perf, style) |
| | `/safety-check` | Safeguard against destructive commands, force pushes, and leaks |
| **Debug & Tune** | `/debug` | Find root cause of bugs, crashes, or test failures and fix them |
| | `/yagni-simplify`| Remove over-engineering and bloat; standard library first |
| | `/webperf` | Audit web speed, bundle size, and Core Web Vitals |
| | `/tools` | Pick fastest native tool (`grep_search`, `view_file`, `replace_file_content`) |
| | `/immunize` | Sweep `anti_patterns.json` traps and record lessons to memory |
| **Research & UI** | `/reach` | Live multi-platform search (Twitter, Reddit, YouTube, Web) |
| | `/mcp` | Enable/search 2,600+ on-demand MCP tools and databases |
| | `/react-components`| Browse and copy 1,100+ production-ready React & shadcn components |
| | `/design-ui` | Design modern, responsive, aesthetic dark/light interfaces |
| | `/skill <name>` | Activate any of 50+ specialized engineering skills on demand |
| **Control & Tone** | `/effort-<level>` | Set reasoning depth: `low` (fast), `mid`, `high` (default), `ultra` |
| | `/compress-tokens`| Speak in ultra-short sentences to save 75% prompt tokens |
| | `/humanize-text` | Rewrite robotic AI text into natural, clear human voice |
| | `/ship` & `/deploy`| Pre-launch verification checks and production deployment |

💡 *Zero-Default Architecture: 0 background rules. Everything runs strictly on demand.*
```

## Guidelines for Output
1. Output the table directly in the conversation for immediate copy/click access.
2. If the user requests a persistent guide, write the complete walkthrough to an artifact `zerogravity_walkthrough.md`.
3. Keep the presentation crisp, conclusion-first, with no redundant conversational padding.

---
description: Dynamic On-Demand MCP Server Manager. List catalog servers, enable on-demand, disable, or reset to zero-default profile.
---

# /mcp - On-Demand MCP Server Manager

Manage and toggle the 12 verified production Model Context Protocol (MCP) servers with zero background overhead.

---

## Quick Commands

```bash
# List all cataloged servers and their active status
python .agents/scripts/mcp.py list

# Enable server(s) on demand
python .agents/scripts/mcp.py enable <name> [name2...]

# Disable / auto-close server(s) to free resources
python .agents/scripts/mcp.py disable <name> [name2...]

# Reset to clean zero-default profile (0 active background servers)
python .agents/scripts/mcp.py reset

# Run an ephemeral task with auto-shutdown
python .agents/scripts/mcp.py run <name> -- <command>
```

---

## 12 Verified Production Servers

| Name | Category | Description |
|:---|:---|:---|
| `context7` | Documentation | Real-time library documentation resolver (Upstash) |
| `shadcn` | Frontend | Direct Shadcn UI registry component discovery |
| `magic` | Frontend | 21st.dev Magic UI design inspiration & generator |
| `skylos` | Security | Local-first static analysis, SAST scan & hallucination gate |
| `github` | VCS | GitHub issues, pull requests, repository search |
| `playwright` | Testing | Headless browser automation, visual snapshots, E2E |
| `supabase` | Database | Supabase database migrations, table inspection & SQL |
| `neon` | Database | Neon serverless Postgres branching & queries |
| `sentry` | Observability | Sentry error telemetry & crash traces |
| `chrome-devtools` | Browser | Live Chrome DOM inspection, Lighthouse audits |
| `serena` | Code Intelligence | AST symbol navigation & deep refactoring |
| `docker-gateway` | Containers | Docker container lifecycle & sandbox builds |

---

## Agent Operating Standard
When an MCP tool is needed during a task, the agent will:
1. Run `python .agents/scripts/mcp.py enable <name>` before the tool call.
2. Execute the tool call.
3. Run `python .agents/scripts/mcp.py disable <name>` upon task completion to cleanly shut down background processes.

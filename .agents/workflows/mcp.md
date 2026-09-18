---
description: Dynamic On-Demand MCP Server Manager. List catalog servers, enable on-demand, disable, or sync to IDEs.
---

# /mcp - On-Demand MCP Server Manager

Manage and toggle the 13 verified production Model Context Protocol (MCP) servers with zero background overhead.

---

## Quick Commands

```bash
# List all cataloged servers, grouped by tier (zero-config vs bring-your-key)
npx zerogravity mcp list

# Enable server(s) on demand (prompts for API keys if needed)
npx zerogravity mcp enable <name> [name2...]

# Disable server(s)
npx zerogravity mcp disable <name> [name2...]

# Show currently enabled servers
npx zerogravity mcp status

# Force-sync enabled servers to IDE configurations (Antigravity, VS Code, Cursor)
npx zerogravity mcp sync
```

---

## 13 Verified Production Servers

| Name | Category | Tier |
|:---|:---|:---|
| `context7` | Documentation | Bring-Your-Key |
| `shadcn` | Frontend | Zero-Config |
| `magic` | Frontend | Bring-Your-Key |
| `github` | VCS | Bring-Your-Key |
| `playwright` | Testing | Zero-Config |
| `supabase` | Database | Bring-Your-Key |
| `sentry` | Observability | Bring-Your-Key |
| `neon` | Database | Bring-Your-Key |
| `chrome-devtools` | Browser | Zero-Config |
| `serena` | Code Intelligence | Zero-Config |
| `docker-gateway` | Containers | Zero-Config |
| `ponytail` | Productivity | Zero-Config |
| `reui` | Frontend | Zero-Config |

---

## Agent Operating Standard
When an MCP tool is needed during a task, the agent will:
1. Scan for required tools and matching MCP servers in the catalog.
2. Ask the user for permission to enable the required servers using `npx zerogravity mcp enable <name>`.
3. If the server is in the `bring-your-key` tier, the agent will assist the user in providing the necessary configuration.
4. Execute the tool calls as needed.

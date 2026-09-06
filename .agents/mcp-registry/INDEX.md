# Antigravity MCP Server Registry & Catalog

A curated index of production Model Context Protocol (MCP) servers integrated into Antigravity.

---

## Registered MCP Servers

| Server Name | Recipe Guide | Runner Command | Required Credentials / Env | Category |
|:---|:---|:---|:---|:---|
| **github** | [github.md](./recipes/github.md) | `npx -y @modelcontextprotocol/server-github` | `${GITHUB_TOKEN}` | Git & DevOps |
| **playwright** | [playwright.md](./recipes/playwright.md) | `npx -y @playwright/mcp@latest` | — | Browser Automation & E2E |
| **supabase** | [supabase.md](./recipes/supabase.md) | `npx -y @supabase/mcp-server` | `${SUPABASE_ACCESS_TOKEN}`, `${SUPABASE_PROJECT_REF}` | Database & Backend |
| **sentry** | [sentry.md](./recipes/sentry.md) | `uvx sentry-mcp` | `${SENTRY_AUTH_TOKEN}`, `${SENTRY_ORG}` | Observability & Telemetry |
| **context7** | [context7.md](./recipes/context7.md) | `npx -y @upstash/context7-mcp` | `${UPSTASH_CONTEXT7_API_KEY}` | Vector Docs & Memory |
| **neon** | [neon.md](./recipes/neon.md) | `npx -y @neondatabase/mcp-server-neon` | `${NEON_API_KEY}` | Serverless Postgres |
| **chrome-devtools** | [chrome-devtools.md](./recipes/chrome-devtools.md) | `npx -y @chrome-devtools-mcp/server` | — | Performance & Web Debugging |
| **serena** | [serena.md](./recipes/serena.md) | `uvx serena-mcp` | — | Semantic Code Intelligence |
| **docker-gateway** | [docker-gateway.md](./recipes/docker-gateway.md) | `npx -y @docker/mcp-server` | Running Docker daemon | Containers & Infrastructure |
| **skylos** | Core Tool | `~/.local/share/skylos/venv/bin/python -m skylos_mcp` | — | SAST, Dead Code & AI Trust |
| **dart-mcp-server** | Core Tool | `dart mcp-server` | — | Flutter & Dart SDK Tooling |
| **shadcn** | Core Tool | `npx shadcn@latest mcp` | — | Component Registry |
| **magic** | Core Tool | `npx -y @21st-dev/magic@latest` | `API_KEY` | UI Design & Magic Components |

---

## How to Activate or Pass Credentials

When running commands that require authenticated MCP servers, provide the tokens in your shell environment or `.env` file:

```bash
export GITHUB_TOKEN="ghp_..."
export SUPABASE_ACCESS_TOKEN="sbp_..."
export SUPABASE_PROJECT_REF="abcdef..."
export SENTRY_AUTH_TOKEN="sntrys_..."
export SENTRY_ORG="my-org"
export NEON_API_KEY="neon_..."
export UPSTASH_CONTEXT7_API_KEY="ctx7_..."
```

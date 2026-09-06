# Neon Serverless Postgres MCP Server

Official Model Context Protocol server for Neon Serverless Postgres. Manage instant branch creation, database branching, point-in-time restores, and schema migrations.

- **Repository**: [neondatabase/mcp-server-neon](https://github.com/neondatabase/mcp-server-neon)
- **Package**: `@neondatabase/mcp-server-neon`

---

## Configuration

```json
{
  "neon": {
    "command": "npx",
    "args": [
      "-y",
      "@neondatabase/mcp-server-neon"
    ],
    "env": {
      "NEON_API_KEY": "${NEON_API_KEY}"
    }
  }
}
```

---

## Environment Variables

| Variable | Description | Required |
|:---|:---|:---|
| `NEON_API_KEY` | Neon API token created from the Neon Console account settings | Yes |
| `DATABASE_URL` | Direct connection string to a specific Neon branch/database | Optional |

---

## Key Tools & Capabilities

- `list_projects`: List all Neon database projects.
- `create_branch`: Instantly create an ephemeral, copy-on-write database branch for testing features or migrations.
- `list_branches`: View existing branches and their compute endpoint statuses.
- `run_sql`: Execute SQL against any branch endpoint.
- `delete_branch`: Clean up ephemeral feature branches after test runs.
- `get_connection_uri`: Retrieve pooled or direct connection strings for any project branch.

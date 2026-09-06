# Supabase MCP Server

Model Context Protocol server for managing Supabase databases, executing SQL, inspecting tables, schemas, storage buckets, and Edge Functions.

- **Repository**: [supabase/mcp](https://github.com/supabase/mcp)
- **Package**: `@supabase/mcp-server`

---

## Configuration

```json
{
  "supabase": {
    "command": "npx",
    "args": [
      "-y",
      "@supabase/mcp-server"
    ],
    "env": {
      "SUPABASE_ACCESS_TOKEN": "${SUPABASE_ACCESS_TOKEN}",
      "SUPABASE_PROJECT_REF": "${SUPABASE_PROJECT_REF}"
    }
  }
}
```

---

## Environment Variables

| Variable | Description | Required |
|:---|:---|:---|
| `SUPABASE_ACCESS_TOKEN` | Personal access token generated from Supabase Dashboard Account Settings | Yes |
| `SUPABASE_PROJECT_REF` | Target Supabase Project Reference ID (e.g. `abcdefghijklmnopqrst`) | Yes |

---

## Key Tools & Capabilities

- `execute_sql`: Run arbitrary SQL statements, migrations, and queries against your Postgres instance.
- `list_tables`: List all database tables in public or private schemas.
- `get_schema`: Retrieve column definitions, constraints, foreign keys, and indexes.
- `list_functions`: Inspect deployed Supabase Edge Functions.
- `list_storage_buckets`: Manage Supabase object storage buckets and files.
- `generate_types`: Generate TypeScript types from active database schemas.

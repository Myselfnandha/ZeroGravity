# Sentry MCP Server

Official Sentry Model Context Protocol server for querying error traces, performance issues, release health, and crash telemetry.

- **Repository**: [getsentry/sentry-mcp](https://github.com/getsentry/sentry-mcp)
- **Package**: `@sentry/mcp-server` (via `npx`)

---

## Configuration

```json
{
  "sentry": {
    "command": "npx",
    "args": [
      "-y",
      "@sentry/mcp-server",
      "--access-token",
      "${SENTRY_AUTH_TOKEN}"
    ],
    "env": {
      "SENTRY_ACCESS_TOKEN": "${SENTRY_AUTH_TOKEN}",
      "SENTRY_AUTH_TOKEN": "${SENTRY_AUTH_TOKEN}",
      "SENTRY_ORG": "${SENTRY_ORG}"
    }
  }
}
```

---

## Environment Variables

| Variable | Description | Required |
|:---|:---|:---|
| `SENTRY_AUTH_TOKEN` / `SENTRY_ACCESS_TOKEN` | Sentry User Auth Token with `event:read`, `org:read`, `project:read`, and `issue:read` scopes | Yes |
| `SENTRY_ORG` | Sentry Organization slug (e.g. `my-company`) | Yes |
| `SENTRY_PROJECT` | Default target project slug | Optional |

---

## Key Tools & Capabilities

- `search_issues`: Search and filter Sentry error issues by tag, environment, status, or query.
- `get_issue_details`: Retrieve stack traces, breadcrumbs, tags, and culprit code lines for an issue.
- `get_latest_event`: Inspect the most recent occurrence of a crash or exception.
- `list_projects`: List all monitored projects under the organization.
- `update_issue_status`: Resolve, ignore, or assign Sentry issues directly from the agent.

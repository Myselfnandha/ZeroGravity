# Upstash Context7 MCP Server

Model Context Protocol server for Upstash Context7: automated documentation indexing, high-accuracy API reference retrieval, and vector memory.

- **Repository**: [upstash/context7](https://github.com/upstash/context7)
- **Package**: `@upstash/context7-mcp`

---

## Configuration

```json
{
  "context7": {
    "command": "npx",
    "args": [
      "-y",
      "@upstash/context7-mcp",
      "--api-key",
      "${UPSTASH_CONTEXT7_API_KEY}"
    ]
  }
}
```

---

## Environment Variables

| Variable | Description | Required |
|:---|:---|:---|
| `UPSTASH_CONTEXT7_API_KEY` | Upstash Context7 API Key for vector documentation lookups | Yes |

---

## Key Tools & Capabilities

- `resolve-library-id`: Resolve framework and package names (e.g. `nextjs`, `stripe`, `tailwind`) into canonical Context7 documentation IDs.
- `query-docs`: Query indexed library documentation, official guides, code snippets, and API signatures in real-time.

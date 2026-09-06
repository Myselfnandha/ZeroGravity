# Chrome DevTools MCP Server

Official Chrome DevTools Protocol MCP server from Google Chrome. Inspect live network requests, memory heap snapshots, console logs, and render performance directly from the coding agent.

- **Repository**: [ChromeDevTools/chrome-devtools-mcp](https://github.com/ChromeDevTools/chrome-devtools-mcp)
- **Package**: `@chrome-devtools-mcp/server`

---

## Configuration

```json
{
  "chrome-devtools": {
    "command": "npx",
    "args": [
      "-y",
      "@chrome-devtools-mcp/server"
    ]
  }
}
```

---

## Environment Variables

| Variable | Description | Required |
|:---|:---|:---|
| `CHROME_PORT` | Remote debugging port (default: `9222`) | Optional |
| `CHROME_PATH` | Explicit path to Google Chrome or Chromium executable | Optional |

---

## Key Tools & Capabilities

- `get_console_logs`: Stream real-time JavaScript console output, warnings, and unhandled exceptions.
- `get_network_activity`: Inspect HTTP/WebSocket requests, response headers, status codes, and payloads.
- `capture_performance_trace`: Record runtime CPU and rendering performance profiles.
- `inspect_dom`: Search and inspect live DOM elements, computed styles, and layout boxes.
- `take_screenshot`: Capture high-resolution viewport screenshots with device emulation.

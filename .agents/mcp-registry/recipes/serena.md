# Serena Semantic Code Analysis MCP Server

Model Context Protocol server for Serena: multi-language semantic code navigation, AST symbol extraction, and precise reference resolution.

- **Repository**: [oraios/serena](https://github.com/oraios/serena)
- **Package**: `serena` (via `uvx`)

---

## Configuration

```json
{
  "serena": {
    "command": "uvx",
    "args": [
      "--from",
      "git+https://github.com/oraios/serena.git",
      "serena",
      "start-mcp-server",
      "--open-web-dashboard",
      "false"
    ]
  }
}
```

> [!NOTE]
> `--open-web-dashboard false` ensures Serena runs headlessly without opening browser tabs on startup.

---

## Environment Variables / Settings

| Option | Description | Default |
|:---|:---|:---|
| `--open-web-dashboard` | Set to `false` to disable automatic browser popups on launch | `false` |
| `--enable-web-dashboard` | Set to `false` to disable the local dashboard web server | `true` |
| `SERENA_CACHE_DIR` | Custom location for semantic symbol index cache | Optional |
| `SERENA_LOG_LEVEL` | Logging verbosity (`DEBUG`, `INFO`, `WARN`) | Optional |

---

## Key Tools & Capabilities

- `find_symbol_definition`: Jump directly to the exact file and line where a function, class, type, or variable is defined.
- `find_references`: Find all references, invocations, and usages of a symbol across the entire codebase.
- `get_symbol_hierarchy`: Extract inheritance trees, interface implementations, and caller/callee graphs.
- `semantic_search`: Search code entities using semantic intent rather than raw substring matching.

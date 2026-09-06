# Playwright MCP Server

Official Model Context Protocol server for end-to-end browser automation, UI testing, and web scraping using Microsoft Playwright.

- **Repository**: [microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp)
- **Package**: `@playwright/mcp`

---

## Configuration

```json
{
  "playwright": {
    "command": "npx",
    "args": [
      "-y",
      "@playwright/mcp@latest"
    ]
  }
}
```

---

## Environment Variables

| Variable | Description | Required |
|:---|:---|:---|
| `PLAYWRIGHT_HEADLESS` | Set to `true` (default) or `false` to show browser UI | Optional |
| `PLAYWRIGHT_BROWSER` | Target browser engine (`chromium`, `firefox`, `webkit`) | Optional |

---

## Key Tools & Capabilities

- `navigate`: Navigate the browser to any URL.
- `click`: Click on page elements using CSS, XPath, or text selectors.
- `type`: Type text into input fields and textareas.
- `screenshot`: Capture full-page or element screenshots.
- `evaluate`: Run arbitrary JavaScript code in the browser context.
- `fill_form`: Fill entire web forms in a single step.
- `get_content`: Extract rendered HTML or clean DOM structure.

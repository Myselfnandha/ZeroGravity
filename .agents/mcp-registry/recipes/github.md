# GitHub MCP Server

Official Model Context Protocol server for interacting with GitHub repositories, pull requests, issues, commits, and code search.

- **Repository**: [github/github-mcp-server](https://github.com/github/github-mcp-server)
- **Package**: `@modelcontextprotocol/server-github`

---

## Configuration

```json
{
  "github": {
    "command": "npx",
    "args": [
      "-y",
      "@modelcontextprotocol/server-github"
    ],
    "env": {
      "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"
    }
  }
}
```

---

## Environment Variables

| Variable | Description | Required |
|:---|:---|:---|
| `GITHUB_TOKEN` or `GITHUB_PERSONAL_ACCESS_TOKEN` | GitHub Personal Access Token (classic or fine-grained) with `repo`, `read:org`, and `workflow` scopes | Yes |

---

## Key Tools & Capabilities

- `create_or_update_file`: Write or modify files directly in a repository.
- `search_repositories`: Search GitHub repositories by name, topic, or description.
- `create_issue` / `get_issue` / `list_issues`: Manage GitHub issues, labels, and milestones.
- `create_pull_request` / `list_pull_requests`: Open and inspect pull requests.
- `search_code`: Search code across public or private repositories.
- `list_commits` / `get_commit`: Review commit history and diffs.
- `create_branch` / `list_branches`: Manage git branch refs.

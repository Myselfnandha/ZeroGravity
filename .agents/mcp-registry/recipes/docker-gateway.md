# Docker MCP Server & Gateway

Model Context Protocol server for Docker: container lifecycle management, image builds, volume inspection, and containerized tool execution.

- **Repository**: [docker/mcp-registry](https://github.com/docker/mcp-registry)
- **Container**: `mcp/docker` (official Docker image)

---

## Configuration

```json
{
  "docker-gateway": {
    "command": "docker",
    "args": [
      "run",
      "-i",
      "--rm",
      "-v",
      "/var/run/docker.sock:/var/run/docker.sock",
      "mcp/docker"
    ]
  }
}
```

---

## Environment Variables / Prerequisites

| Requirement | Description | Required |
|:---|:---|:---|
| Docker Daemon | Running Docker engine socket (`/var/run/docker.sock` or `DOCKER_HOST`) | Yes |
| `DOCKER_HOST` | Custom Docker daemon endpoint (e.g. `tcp://localhost:2375`) | Optional |

---

## Key Tools & Capabilities

- `list_containers`: Inspect running and stopped containers, health statuses, and port mappings.
- `start_container` / `stop_container`: Control container execution.
- `build_image`: Build Docker images from local Dockerfiles with live build logs.
- `inspect_logs`: Retrieve stdout/stderr logs from active services.
- `list_images`: List local and pulled images.
- `manage_volumes`: Inspect and clean persistent storage volumes.

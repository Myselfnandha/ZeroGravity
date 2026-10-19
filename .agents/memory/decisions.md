# Architecture Decisions & Invariants

This document records durable architectural decisions, system invariants, and interface contracts for this project.

---

## Active Invariants

### 1. Dual-Layer Codebase Analysis Engine
- **Decision**: Codebase freshness is checked via `analyze.py --check --auto-heal --inject-ki` at the start of every session.
- **Rationale**: Prevents stale context without blocking user conversations, storing SQLite cache in `.agents/cache/codebase.db`.

### 2. Multi-Tier Security & Verification Gates
- **Decision**: All modified files and business logic must pass AAA unit test standards and Skylos SAST / AI hallucination verification.
- **Rationale**: Eliminates phantom imports, hallucinated package versions, and insecure sinks before commit.

### 3. Native MCP Server Protocol
- **Decision**: External tool integrations use the official Model Context Protocol (MCP) in `.agents/mcp_config.json`.

### 4. Reactive Async Task Notification & Live Status
- **Decision**: Always use the reactive "Waiting for a task notification" approach with live status rather than polling loops or redundant timers.
- **Rationale**: The IDE event loop automatically resumes execution when background tasks complete. Polling or using blind sleep/timers wastes tokens, introduces latency, and adds noise.

### 5. Single-File Analysis Whole-Read Invariant
- **Decision**: When analyzing a single file, read the entire file in a single tool call without piecemeal slicing.
- **Rationale**: Prevents fragmented code context, eliminates repeated round-trips for contiguous lines, and guarantees complete semantic understanding of the file.

### 6. Pre-Execution Tool Optimization & Context Economy
- **Decision**: Prior to triggering any action, assess the action against available tools to choose the most token-efficient, fast, and direct execution path.
- **Contract Matrix**:
  - `grep_search`: bounded symbol/regex search over shell `grep`/`find` (~90% token reduction).
  - `view_file`: single whole-file read without line slicing over chunked calls or `cat`/`head`.
  - `write_to_file`: deterministic file creation over shell `cat << EOF` or echo.
  - `replace_file_content`: single contiguous block modification.
  - `multi_replace_file_content`: atomic 1-turn multi-chunk modification over iterative sequential calls.
  - `run_command`: tuned `WaitMsBeforeAsync` (5000-10000ms for fast commands, 500ms + `IsDaemon: true` for dev servers).
  - `read_url_content`: lightweight HTTP text extraction over browser subagent for static docs.
  - `ask_question`: Socratic alignment before writing speculative code when trade-offs exist.
- **Rationale**: Using the best-fit primitive preserves context window, eliminates round-trip latency, and prevents hallucination.

### 7. Workflow Frontmatter Contract & Dual Global Path
- **Decision**: Workflows must strictly contain `description:`-only in YAML frontmatter matching their filename stem (`<stem>.md` -> `/<stem>`). Global workflows must be dual-synced to `~/.gemini/antigravity-ide/global_workflows/` and `~/.gemini/config/workflows/`.
- **Rationale**: Extraneous keys (`disable-model-invocation`, `metadata`) suppress Antigravity IDE's slash autocomplete popup. Antigravity IDE specifically monitors `~/.gemini/antigravity-ide/global_workflows/` for global discovery.

### 8. Auto-Learn & Post-Execution Socratic Alignment
- **Decision**: Upon completion of any major execution (multi-file feature build, architectural overhaul, `/build-feature`, or complex pipeline), the agent automatically runs `/learn` distillation to persistent memory and concludes with a quick `/grill-me` via `ask_question`.
- **Trigger Scope**: High threshold — triggers exclusively on major executions (multi-file feature builds, architectural changes, `/build-feature`, `/ship`), omitting small single-turn queries to preserve workflow velocity.
- **Rationale**: Ensures continuous, automated capture of failure modes and conventions while verifying alignment with user intent.

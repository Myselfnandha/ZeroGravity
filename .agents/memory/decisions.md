# Architecture Decisions & Invariants

This document records durable architectural decisions, system invariants, and interface contracts for this project.

---

## Active Invariants

### 1. Dual-Layer Codebase Analysis Engine
- **Decision**: Codebase context is provided via automatically injected persistent Knowledge Items (KIs) and `.agents/codebase_summary.md`, accessed natively by the agent using integrated tools (`view_file`, `grep_search`). Standalone CLI script `analyze.py` remains available for offline index maintenance, but is never invoked internally by the agent during turns.
- **Rationale**: Eliminates process startup latency and shell payload token overhead while maintaining instantaneous, up-to-date codebase context.

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

### 9. Context-Driven Workflow Adaptation & Lean On-Demand Loading
- **Decision**: When a task matches a specialized engineering domain (debugging, UI design, web performance, deep research, specification, code simplification, or production launch), the agent autonomously activates the corresponding ZeroGravity workflow without waiting for explicit slash invocations.
- **Token Invariant**: Workflows are loaded strictly on-demand (single `view_file` call). Never dump entire workflow text into conversation context or preload unneeded workflows.
- **Rationale**: Reuses battle-tested, structured procedures and checklists while keeping continuous context token consumption at zero.

### 10. Native Integrated Tools Over Internal Subprocesses & Token Preservation
- **Decision**: The agent MUST NEVER invoke internal Python scripts (`analyze.py`, `auto_evolve.py`, `checklist.py`, `harness.py`, `ki_injector.py`, `learn.py`, `mcp.py`, `session_manager.py`, `summarizer.py`, `sync_knowledge.py`) or subprocess wrappers for memory capture, context sweeps, checklist management, or configuration. All internal agent operations must be performed directly using native IDE tools (`view_file`, `write_to_file`, `replace_file_content`, `multi_replace_file_content`, `grep_search`, `ask_question`).
- **Rationale**: Subprocess invocations consume 400–800 tokens per call in shell payloads, formatting, and stdout return, plus process launch latency and shell escape risks. Integrated tools operate natively within the IDE runtime with 0 process overhead, minimal token consumption, and atomic deterministic edits.
- **Grill-Me Alignment**: Standalone Python scripts in `.agents/scripts/` are preserved strictly as external CLI utilities for user shell commands, `./install.sh`, and unit tests (`tests/test_all.py`), while the agent operates 100% via native integrated tools.

### 11. Context-Driven Skill Auto-Activation & Progressive Inspection
- **Decision**: When a task matches an available specialized skill (e.g., Chrome DevTools, accessibility auditing, Hugging Face CLI, ponytail tech debt, git workflow, performance profiling, UI layout, security auditing), the agent MUST autonomously inspect that skill's `SKILL.md` (single whole-file `view_file` call) before executing the task.
- **Rationale**: Guarantees adherence to established tool integrations, official guidelines, and runbooks without improvising ad-hoc actions or requiring explicit user prompts.



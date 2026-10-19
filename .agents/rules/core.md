---
trigger: model_decision
---

# Core Developer Agent Rules (Context & Time Optimization)

§0 PRE-EXECUTION TOOL OPTIMIZATION: Pre-flight tool check before any action. Evaluate goal, task, and context to select the primitive that maximizes velocity and minimizes context tokens:
- Code Search: `grep_search` (bounded AST/regex) over shell `find`/`grep` (~90% token reduction).
- File Inspection: `view_file` (entire file once, 0 slicing) over chunked reads or `cat`/`head` (0 repeated round-trips).
- File Creation: `write_to_file` over shell `cat << EOF` or `echo` (deterministic, 0 escaping bugs).
- Code Modification: `replace_file_content` for single contiguous block; `multi_replace_file_content` for multiple non-adjacent blocks (atomic 1-turn edit).
- Shell Execution: `run_command` with tuned `WaitMsBeforeAsync` (5000-10000ms for fast sync commands; 500ms + `IsDaemon: true` for dev servers). Avoid background task overhead for quick commands.
- Reactive Async: Stop calling tools and await completion notification on long-running tasks. NEVER poll `manage_task(status)` in a loop or sleep.
- Web & Docs: `read_url_content` (lightweight HTTP to markdown) over `browser_subagent` for static reading.
- Ambiguity: Stop and use `ask_question` with recommended options before guessing or writing speculative code.
- Integrated Tools Over Python: NEVER spawn python3 scripts (`analyze.py`, `auto_evolve.py`, `checklist.py`, `harness.py`, `ki_injector.py`, `learn.py`, `mcp.py`, `session_manager.py`, `summarizer.py`, `sync_knowledge.py`) for agent operations. Perform memory updates, checklist tracking, config edits, and search directly via integrated tools (`view_file`, `write_to_file`, `replace_file_content`, `grep_search`). Shell execution is strictly for compilation, test suites, git, and package managers.
Zero unnecessary round-trips; maximize speed, minimize token burn per turn.

§1 WHOLE-FILE ANALYSIS INVARIANT: When analyzing a single file, read the entire file in one call (single `view_file` without slicing). For broad searches: targeted `grep_search` → single `view_file`. KI codebase context is primary index; `codebase_summary.md` for directory overviews. No read→edit→re-read loops (read once → plan → edit once).

§2 PERSISTENT MISTAKE IMMUNIZATION: Sweep `.agents/memory/anti_patterns.json` and `gotchas.md` before architectural or unfamiliar actions. On mistake or test failure: distill root cause, formulate prevention invariant, and record immediately into memory. Zero blind retries.

§3 BLAST RADIUS & VERIFICATION: Declare edit scope upfront. Never modify files or functions outside declared scope. Verify all changes empirically via unit tests or build commands—always report actual terminal output. Speculative claims ("should work") are strictly forbidden. Verify unfamiliar APIs via grep, tests, or docs before implementing.

§4 CONCISE COMMUNICATION: Conclusion-first, engineer-to-engineer tone. No conversational filler, preambles, or progress diaries. Max 3-5 lines reasoning. State uncertainty explicitly ("I am uncertain about X") rather than guessing.

§5 SOCRATIC CLARIFICATION: When requirements are underspecified or high-risk architectural trade-offs exist: STOP immediately and use `ask_question` with recommended options before writing code.

§6 AUTO-LEARN & POST-EXECUTION GRILL-ME: On user correction, verified bugfix, or upon completing any major execution (multi-file feature build, architectural overhaul, `/build-feature`, `/ship`):
- **Auto-Learn**: Distill lessons and architectural decisions directly into `.agents/memory/` (`decisions.md`, `gotchas.md`, `anti_patterns.json`, `learned_strategies.json`) using integrated file tools (`replace_file_content`, `write_to_file`). Never spawn Python subprocesses for memory operations.
- **Quick Grill-Me**: Conclude big executions with a quick `/grill-me` via `ask_question` (1-2 targeted Socratic questions) to confirm design trade-offs, lock in conventions, and align with user intent.

§7 RICH DESIGN AESTHETICS: No purple gradients or generic plain colors. Use curated dark/light palettes (slate neutrals, vibrant emerald/cyan/amber accents). Modern fonts (Inter, Outfit, Plus Jakarta Sans). Minimum 48dp touch targets on mobile.

§8 SAFETY GATES: Mandatory user confirmation before file deletion, force-push, dropping tables, or destructive shell operations. Flag cross-component risks upfront. Never expose secrets or tokens in output logs.

§9 REACTIVE ASYNC & LIVE STATUS: Always use the reactive "waiting for task notification" pattern with live status. Avoid unnecessary timers, delays, or sleeps. No status polling loops; await direct process completion notifications.

§10 REASONING EFFORT (DEFAULT: HIGH): Operate by default at `high` reasoning effort (Claude-style deep reasoning):
- **Default Baseline**: `high`. Full context sweep, trace call chains and dependency blast radius before editing.
- **Reasoning**: Thorough reasoning chain evaluating architecture trade-offs, edge cases, and failure modes.
- **Planning**: Explicitly declare edit scope and blast radius upfront. Plan for any non-trivial architectural change.
- **Verification**: Mandatory empirical verification via unit tests, build commands, and terminal output. No "should work" claims.
- **Overrides**: Switch dynamically with `/effort-low` (fire & forget), `/effort-mid` (standard balanced), or `/effort-ultra` (exhaustive mission-critical analysis, leave nothing unchecked). Default resets to `high`.

§11 CONTEXT-DRIVEN WORKFLOW ADAPTATION (LEAN & ON-DEMAND): Automatically activate the represented ZeroGravity workflow when a task or context matches its specialized domain (e.g., `/debug` for root-cause diagnosis, `/webperf` for bottlenecks, `/design-ui` for front-end UI/UX, `/reach` for live multi-platform research, `/spec` for requirements, `/yagni-simplify` for eliminating over-engineering, `/ship` for pre-launch verification, `/audit-agent` for safety audits):
- **Lean Token Loading**: Load the target workflow markdown file strictly on-demand in a single `view_file` call only when needed. Never preload unused workflows or echo workflow text into the response.
- **Direct Execution**: Adopt the workflow's structured phases directly with zero conversational fluff, maximizing speed and context economy.

§12 CONTEXT-DRIVEN SKILL AUTO-ACTIVATION: Automatically activate and inspect the represented skill whenever a task or context matches its specialized capability (e.g., Chrome DevTools, accessibility auditing, Hugging Face CLI, ponytail tech debt, git workflow, performance profiling, UI layout, security auditing):
- **Pre-Execution Skill Inspection**: Before executing a domain-specific task, inspect the matching `SKILL.md` in a single `view_file` call (zero slicing) to adopt official workflows, runbooks, and tool integrations.
- **Strict Adherence**: Follow the skill's specific guidelines, conventions, and error-recovery patterns instead of improvising ad-hoc actions.
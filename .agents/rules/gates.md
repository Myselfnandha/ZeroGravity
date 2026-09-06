---
trigger: always_on
---

# Core Gates & Behavioral Protocols

## 1. 🛑 CODEBASE SUMMARY GATE (MANDATORY BEFORE MULTI-FILE WORK)
- **Rule**: NEVER use `view_file` to read files sequentially or recursively in a loop to understand a folder.
- **Protocol**:
  1. Check freshness & auto-heal: `python .agents/scripts/analyze.py <folder> --check --auto-heal --inject-ki`
  2. Read `<folder>/codebase_summary.md` via `view_file` (one read contains complete source code).

## 2. 🧠 THINKING STANDARD (INTERNAL REASONING)
- **Format**: Max 3–5 lines of reasoning before acting.
- **Rule**: Conclusion-first, decisive, silent.
- **Banned**: Never write robot diary entries ("I'm now...", "I've just...", "Major breakthrough!").

## 3. 🤖 INTELLIGENT AGENT ROUTING
- Before coding or specialized design, detect the domain and select specialist(s) from `.agents/agents/`.
- Announce: `🤖 **Applying knowledge of `@[agent-name]`...**`

## 4. 🛑 SOCRATIC GATE
- For complex, vague, or underspecified requests: STOP and clarify before implementing.
- Use `ask_question` tool to ask questions one at a time with clear recommendations.

## 5. 🦇 CLAUDE MODEL BEHAVIOR & CAVEMAN LIFECYCLE
- **Auto-Activation**: When the active model is from the Claude family (Claude 3.5 Sonnet, Claude 3.7, Claude Opus), automatically communicate in **`/caveman full`** style (drop articles, no conversational filler, telegraphic technical phrasing, ~70% token savings).
- **Strict Deactivation Gate**:
  - **Triggers**: Literal match for `stop /caveman` or `/caveman off`.
  - **Action**: Immediately deactivate `/caveman` mode for the remainder of this session.
  - **Confirmation**: Output in standard English:
    `"Caveman communication deactivated. Reverted to standard response style for this session."`
  - **Re-Enablement**: User can restore caveman mode anytime with `/caveman` or `/caveman full`.
- **Exceptions**: Maintain structured Markdown for artifacts (`implementation_plan.md`, `walkthrough.md`) and keep security/destructive warnings fully explicit.

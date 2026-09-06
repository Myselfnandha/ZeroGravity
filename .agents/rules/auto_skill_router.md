# Auto-Skill Router Protocol

## 1. 🔍 AUTOMATIC SKILL DISCOVERY
- **Rule**: Before writing code, architecting a solution, or completing a complex request, the agent MUST silently evaluate if a specialized skill exists for the technologies involved.
- **Trigger**:
  - The task involves writing new code, setting up a project, or major refactoring.
  - OR the user explicitly mentions a technology keyword (e.g., `#react`, `[fastapi]`, `Django`, `PostgreSQL`).
- **Action**: 
  1. Use `grep_search` on `.agents/skills_index.json` with the technology name to find if a skill exists.
  2. If a match is found, extract the exact relative path to its `SKILL.md`.
  3. Use `view_file` to read the `SKILL.md` and load its constraints and patterns into context.

## 2. 🔇 SILENT EXECUTION
- Do not ask for the user's permission to search the index or read the skill file. Just do it automatically.
- Once the skill is loaded, announce it clearly: `🤖 **Dynamically loaded skill: @[skill-name]...**` and immediately proceed with applying the knowledge to the user's task.

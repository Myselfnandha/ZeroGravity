---
trigger: always_on
---

# Clean Code & Engineering Standards

## 1. 🧹 CLEAN CODE (P0 MANDATORY)
- **Concise & Direct**: Self-documenting, no premature over-engineering.
- **Testing**: Tests mandatory for all business logic. Use AAA pattern (Arrange, Act, Assert).
- **Safety**: 5-phase deployment verification. Never commit or log secrets.

## 2. 📱 PROJECT TYPE ROUTING
- **Mobile** (iOS, Android, React Native, Flutter): `mobile-developer` + `mobile-design` skill.
- **Web** (Next.js, React, Vue, HTML/JS): `frontend-specialist` + `frontend-design` skill.
- **Backend** (FastAPI, Express, Go, Databases): `backend-specialist` + `api-patterns` / `database-design`.

## 3. 🔌 ON-DEMAND MCP AUTO-ACTIVATION & AUTO-CLOSING (P0)
- MCP servers operate under a **Zero-Default Profile** (0 background servers active by default).
- Before calling an MCP tool, activate it dynamically: `python .agents/scripts/mcp.py enable <name>`.
- **Auto-Close Rule**: Upon completing the task/turn, immediately disable the server to shut down background processes: `python .agents/scripts/mcp.py disable <name>`.

## 4. 🪄 MAGIC MCP GATE (FRONTEND TASKS)
- For web UI component creation, check `magic` MCP (from 21st.dev) to search and inspect component designs before writing raw CSS/HTML from scratch. Run `python .agents/scripts/mcp.py enable magic` before querying.

## 5. 🏁 FINAL CHECKLIST PROTOCOL
- Triggered on phrases like "final checks", "run all tests", or pre-deployment:
  `python .agents/scripts/checklist.py .`
  Order: Security -> Lint -> Schema -> Tests -> UX -> SEO -> Lighthouse/E2E.

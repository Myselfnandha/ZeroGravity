---
description: Run Skylos local-first static analysis, security audits, dead-code detection, or verify AI-generated changes for hallucinations.
---

# /skylos - Static Analysis & AI Verification

$ARGUMENTS

---

## Purpose

Executes Skylos CLI checks or MCP verification tools to catch dead code, security flaws, secrets, and AI hallucinations before commit or merge.

---

## Usage

| Command | Action |
|---------|--------|
| `/skylos` | Run standard dead-code scan on current project. |
| `/skylos audit` | Run full security, secrets, and quality audit (`skylos . -a`). |
| `/skylos verify <file>` | Verify file for AI-generated hallucinations and fake APIs. |
| `/skylos clean` | Dry-run preview of safe dead code removal. |
| `/skylos diff` | Check changed lines against git base branch (`skylos . -a --diff HEAD~1`). |

---

## Direct Terminal Equivalents

```bash
# Verify active file
skylos verify . --file <filepath> --project-context

# Comprehensive audit
skylos . -a --format concise

# Check agent LLM integration defense
skylos defend .
```

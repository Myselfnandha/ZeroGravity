---
description: Set the agent's reasoning effort level. Controls depth of research, verbosity, planning threshold, verification rigor, and research breadth across all tasks.
---

# /effort — Model Reasoning Effort Override

$ARGUMENTS

Default: `mid`. Override anytime. Stacks with any active workflow. Announce once: `⚡ Effort: <level>`.

---

## Commands

| Command | Workflow | Effect |
|---|---|---|
| `/effort low` | [effort-low.md](./effort-low.md) | Fire & Forget. Act immediately, 1-3 lines, no plans, no tests. |
| `/effort mid` | [effort-mid.md](./effort-mid.md) | Balanced default. Research then act, 3-8 lines, plan if arch, run tests. |
| `/effort high` | [effort-high.md](./effort-high.md) | Thorough. Full sweep, full reasoning, plan non-trivial, tests+lint+build. |
| `/effort ultra` | [effort-ultra.md](./effort-ultra.md) | Leave nothing unchecked. Read everything, always plan, write test for every part. |
| `/effort off` | — | Reset to default (`mid`). |
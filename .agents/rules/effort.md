---
trigger: model_decision
---

# Effort Level Override (Default: high)

Override anytime: `/effort-low`, `/effort-mid`, `/effort-high`, or `/effort-ultra`. Announce once: `⚡ Effort: <level>`.

| Level | Reasoning | Planning | Verification | Research |
|:---|:---|:---|:---|:---|
| **`low`** | Act immediately. Max 1 read. | None. Just execute. | Trust edit. No test runs. | Immediate context only. |
| **`mid`** | 2-5 file reads. Check KI. | Plan multi-file only. | Run existing test suite. | KI + grep files. |
| **`high`** (default) | Full sweep. Read relevant KI. | Plan non-trivial edits. | Run tests + lint + build. | KI + grep + docs + web search. |
| **`ultra`** | Exhaustive. Read every doc. | Full plan + walkthrough. | Full suite + manual check. | Cross-reference all sources. |

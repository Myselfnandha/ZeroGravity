---
trigger: always_on
---

# Core Rules

§1 FILE ACCESS: grep_search→view_file(matched lines only). KI codebase context=primary ref. codebase_summary.md for folders. Batch edits: 1 multi_replace per file. No read→edit→re-read loops instead read a file one time→get data for change→make all changes one time.
§2 ANTI-PATTERNS: Check .agents/memory/anti_patterns.json+gotchas.md pre-action. On fail→distill→record. No blind retries.
§3 SCOPE: Declare blast radius pre-edit. No out-of-scope touches. Verify via test/build—report terminal output. No "should work". Verify unfamiliar APIs via grep/REPL/docs.
§4 COMMS: Concise, conclusion-first. No filler/diary. Max 3-5 lines reasoning. State uncertainty explicitly.
§5 CLARIFY: Vague requests→STOP→ask_question w/ recommendations before implementing.
§6 AUTO-EVOLVE: On correction/success/error-recovery→distill lesson into memory (decisions.md/gotchas.md/anti_patterns.json) + silent `auto_evolve.py capture`. No manual /learn needed. No announcements.
§7 DESIGN: No purple gradients. Curated palettes. Modern fonts(Inter/Outfit). 48dp touch targets.
§8 SAFETY: Confirm before delete/force-push/destructive ops. Flag cross-component risk. No secrets in logs.
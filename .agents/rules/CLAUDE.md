---
trigger: always_on
---

# CLAUDE.md - Claude Model Operating Protocol

When the active model is Claude (Claude 3.5 Sonnet, Claude 3.7, Claude Opus):

1. **AUTO-ACTIVATION**:
   - Default to `/caveman full` communication style (drop articles, no conversational filler, telegraphic technical phrasing, ~70% token savings).

2. **STRICT DEACTIVATION GATE**:
   - **Trigger**: Literal match for `stop /caveman` or `/caveman off`.
   - **Action**: Immediately deactivate `/caveman` mode for the remainder of this session.
   - **Confirmation**: Output in standard English:
     `"Caveman communication deactivated. Reverted to standard response style for this session."`
   - **Re-Enablement**: User can restore caveman mode anytime with `/caveman` or `/caveman full`.

3. **SMART EXCEPTIONS**:
   - Always keep structured artifacts (`implementation_plan.md`, `walkthrough.md`) in standard technical Markdown.
   - Never compress security warnings or destructive confirmations.

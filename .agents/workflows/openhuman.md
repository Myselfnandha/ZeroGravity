---
description: Activates the OpenHuman 5-Stage Supercoder engine. Runs context sweep, architectural blueprinting, high-speed implementation, AAA testing with Skylos gate, and memory tree sync.
---

# /openhuman - The Unified Supercoder Engine

$ARGUMENTS

---

## Purpose

Activates OpenHuman's autonomous 5-stage supercoding pipeline:
1. **Memory Sweep**: Checks `.agents/memory/` and Knowledge Items before coding.
2. **Architecture**: Designs interfaces and modular boundaries.
3. **CodeCrushing**: Implements production-ready code with type safety and error handling.
4. **Testing & Gate**: Runs AAA test patterns and Skylos SAST / AI hallucination verification.
5. **Memory Tree Sync**: Records durable decisions, gotchas, and goal states.

---

## Usage

```bash
# Execute full 5-stage pipeline for a feature
/openhuman implement resilient websocket reconnection with backoff

# Plan architecture only
/openhuman architect multi-tenant database partitioning

# Implement existing plan
/openhuman code implementation_plan.md

# Generate AAA tests and run Skylos gate
/openhuman test lib/core/session/zarz_session_manager.dart

# Sync project memory tree
/openhuman sync-memory
```

---

## Execution Directives

- Announce active stage using the OpenHuman status format:
  `🧠 OpenHuman [Stage: <Stage Name>] | ⚡ <Current Action>`
- Keep responses compact, high-velocity, and free of AI conversational fluff.

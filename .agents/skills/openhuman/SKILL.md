---
name: openhuman
description: 'The OpenHuman Supercoding Engine: 5-stage automated coding pipeline, Memory Tree (decisions, gotchas, goals) management, CodeCrusher implementation patterns, and Skylos verification gate. Invoke with /openhuman.'
disable-model-invocation: false
license: MIT
metadata:
  tags: "Supercoding, Architecture, Memory Tree, OpenHuman, CodeCrusher, Quality Gate"
  category: "supercoding"
---

# OpenHuman Supercoding Engine

The OpenHuman Supercoding skill provides an end-to-end framework for autonomous, high-velocity, high-reliability software engineering.

---

## Operating Protocol: The 5 Stages

### 1. Memory & Context Sweep
Before modifying or creating files:
1. Read `.agents/memory/decisions.md` to honor past architectural commitments and invariants.
2. Read `.agents/memory/gotchas.md` to avoid known platform bugs, tricky edge cases, and circular dependencies.
3. Check the active goal state in `.agents/memory/goals.md`.

### 2. Architecture & Seam Design
- Design interface boundaries before writing implementation logic.
- Ensure modules hide internal complexity behind clean, minimal public interfaces.
- Identify and isolate external dependencies (I/O, database, network) behind testable seams.

### 3. CodeCrushing Implementation
- Write clean, idiomatically typed code across any target stack (Dart/Flutter, TypeScript, Python, Rust, Go, SQL).
- Avoid premature abstractions while strictly adhering to DRY where repetition causes maintenance debt.
- Handle error edge cases explicitly with typed errors or result types.

### 4. AAA Testing & Verification Gate
- Every business logic module requires tests structured as:
  - **Arrange**: Set up mocks, inputs, and state.
  - **Act**: Execute the unit under test.
  - **Assert**: Verify outputs, state mutations, and mock invocations.
- Run `skylos verify . --file <file> --project-context` to verify no hallucinated package APIs or missing guards exist.

### 5. Memory Tree Synchronization
- At the conclusion of non-trivial tasks, record learnings into `.agents/memory/`:
  - New invariants $\rightarrow$ `decisions.md`
  - Fixed quirks/workarounds $\rightarrow$ `gotchas.md`
  - Completed milestones $\rightarrow$ `goals.md`

---

## Slash Command Usage

| Command | Action |
|:---|:---|
| `/openhuman <task>` | Execute full 5-stage supercoding pipeline for the requested task. |
| `/openhuman architect <feature>` | Produce architectural blueprint and interface definitions only. |
| `/openhuman code <plan>` | High-velocity CodeCrusher implementation of an existing plan. |
| `/openhuman test <target>` | Generate AAA test suite and run verification gates. |
| `/openhuman sync-memory` | Sweep codebase and synchronize active state into `.agents/memory/`. |

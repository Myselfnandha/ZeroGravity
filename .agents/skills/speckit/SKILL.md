---
description: Runs the Full Spec-Driven Development (SDD) Cycle using specify-cli (specify → plan → tasks → implement with review gates).
---

# /speckit - Full Spec-Driven Development Cycle

$ARGUMENTS

---

## 📋 Overview

This command executes the **Full SDD Cycle** (`speckit`) in your project using `specify-cli`. It coordinates specifying, clarifying, planning, task generation, and implementation under strict quality controls and review gates.

---

## 🛠️ Prerequisites

1. **Specify CLI** must be installed and initialized in the target folder (`specify init`).
2. **LLM Credentials** (e.g., API keys) must be set in your active environment variables.
3. **Environment encoding** must be set to UTF-8 on Windows to prevent charmap errors:
   - PowerShell: `$env:PYTHONIOENCODING="utf-8"; $env:PYTHONUTF8="1"`

---

## ⚙️ Behavior

When `/speckit` is triggered:

1. **Prerequisite Check**
   - Ensure a project is initialized or active.
   - Verify `specify-cli` is installed by running `specify --version`.

2. **Execute Workflow**
   - Parse the feature description from `$ARGUMENTS`.
   - Run the `speckit` workflow:
     ```powershell
     $env:PYTHONIOENCODING="utf-8"; $env:PYTHONUTF8="1"; specify workflow run speckit --input spec="$ARGUMENTS"
     ```

3. **Step-by-Step Cycle**
   - **specify**: Generates the initial markdown specification and quality checklists.
   - **review-spec (Gate)**: Presents the specification to the user for approval or rejection.
   - **plan**: Creates a detailed implementation plan.
   - **review-plan (Gate)**: Presents the plan to the user for approval or rejection.
   - **tasks**: Generates structured markdown tasks.
   - **implement**: Coordinates implementation of the planned changes.

4. **Integration Hooks**
   - Any registered extension hooks (before/after specify, plan, tasks, or implement) will be automatically evaluated and executed by the CLI.

---

## 💡 Usage Examples

```powershell
/speckit implement a new rest API endpoint for temperature data
/speckit add dark mode toggle to the Once UI dashboard
/speckit create a SQLite-based clipboard history exporter
```

---

## 🔑 Key Principles

- **Ambiguity Reduction**: Stop at gates to review specification completeness before planning code.
- **Incremental Implementation**: Strictly adhere to the generated plan and checklists.
- **Review Gates**: Always wait for user approval at review gates (`review-spec`, `review-plan`) before proceeding.

---
description: "ZeroGravity OS 2-Way Mistake Immunization & Learning Engine. Distills failed attempts, user corrections, and agent missteps into invariant prevention rules."
globs: ["**/*"]
---

# 🧠 /learn: 2-Way Mistake Immunization & Learning Engine

The `/learn` workflow activates the persistent self-learning and anti-pattern immunization protocol across all agent operations.

---

## 🔄 The 2-Way Immunization Standard

```mermaid
flowchart TD
    subgraph PreAction ["🛡️ 1. Pre-Action Guard Gate"]
        A1["Planned Code Change / Tool Call"] --> A2{"Matches Anti-Patterns<br/>Matrix in gotchas.md?"}
        A2 -- Yes --> A3["⛔ Intercept & Apply Invariant Prevention Strategy"]
        A2 -- No --> A4["✅ Proceed with Safe Execution"]
    end

    subgraph Runtime ["⚡ 2. Execution & Observation"]
        A3 --> R1["Run Command / Edit Code / Call MCP"]
        A4 --> R1
        R1 --> R2{"Result?"}
        R2 -- Success --> S1["Goal Progress Updated"]
        R2 -- Failure / Misstep / User Correction --> F1["⚠️ Mistake Detected"]
    end

    subgraph PostDistill ["🧠 3. Post-Failure Auto-Distillation"]
        F1 --> D1["1. Identify Exact Root Cause"]
        D1 --> D2["2. Formulate Invariant Prevention Rule"]
        D2 --> D3["3. Record in anti_patterns.json & gotchas.md"]
        D3 --> D4["4. Immunize Future Agent Sessions"]
    end
```

---

## 🛠️ Developer & Agent CLI Commands

### 1. Inspect Learned Anti-Patterns
```bash
zg learn list
# or
python3 .agents/scripts/learn.py list
```

### 2. Record a Learned Rule
```bash
zg learn add \
  --mistake "Brief description of the failure" \
  --cause "Why the failure occurred" \
  --strategy "Proven solution to prevent repeating" \
  --category "tooling|runtime|architecture|agent_behavior" \
  --rule "Strict invariant rule"
```

### 3. Check Planned Actions for Known Anti-Patterns
```bash
zg learn check --query "command or feature planned"
```

### 4. Audit Memory Integrity
```bash
zg learn audit
```

---

## 🎯 Protocol Invariants
- **NEVER Repeat a Known Failure**: If an action was previously recorded in `.agents/memory/gotchas.md` or `anti_patterns.json`, you must reject the flawed approach before execution.
- **Immediate Distillation**: On encountering any unexpected error or user correction, do not simply retry blindly—distill the root cause and record the prevention rule before proceeding.

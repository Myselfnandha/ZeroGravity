# 🛡️ ZeroGravity OS: Known Gotchas & Immunization Protocol

All patterns (anti-patterns + learned strategies) are maintained in the machine-readable single source of truth: [`patterns.json`](file:///home/nandha/Desktop/agent/.agents/memory/patterns.json).

Project-specific patterns live in `.agents-local/memory/patterns.json` (per-workspace, not in npm package).

---

## 🛠️ Platform & Tooling Gotchas

### 1. Skylos SAST on Meta-Directories
- **Gotcha**: Scanning directories containing 1,450+ offline skill scripts causes slow traversal.
- **Rule**: Pass `--exclude .agents --exclude .agent --exclude venv` when running whole-project audits.

### 2. PEP 668 & Linux System Python Isolation
- **Gotcha**: Modern Linux distros (Arch, Debian 12+, Ubuntu 24+) block system-wide `pip install`.
- **Rule**: Provision isolated virtual environments under `~/.local/share/<tool>/venv` and symlink CLI entrypoints to `~/.local/bin/`.

### 3. NPM Remote Package Authorization (`EALLOWREMOTE`)
- **Gotcha**: npm v12+ defaults `allow-remote="none"`, failing to install git-based tarball dependencies.
- **Rule**: Configure `npm config set allow-remote all` during environment setup.

---

## 🔄 The 2-Way Immunization Protocol
1. **Pre-Action Check**: Before first file edit, read `patterns.json` and `.agents-local/memory/patterns.json`.
2. **Post-Failure Distillation**: When a mistake, test failure, or user correction occurs:
   - Identify the exact root cause.
   - Formulate a one-sentence rule.
   - Append to `.agents-local/memory/patterns.json` (project-specific) or `.agents/memory/patterns.json` (universal).
   - Flag with `"universal": true` if the pattern applies across all projects.

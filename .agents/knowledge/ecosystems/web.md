# 🌐 Web & Frontend Ecosystem Knowledge

Categorized strategies, verified build flows, framework patterns, and gotchas for web frontends.

---

## 🏗️ Verified Build Flows & Setup Recipes
- **Vite Vanilla / Modern Framework Init**:
  - Command: `npx -y create-vite@latest <app-dir> --template vanilla` (or react-ts / vue)
  - Pre-flight gotcha: Run with `--help` in non-interactive mode. Always verify dependencies with `npm ls` or clean lockfiles.
- **Tailwind v4 Native CSS**:
  - Invariant: Avoid arbitrary CDN script tags in production builds; install `@tailwindcss/vite` or post-css plugin.

---

## 🛡️ Known Gotchas & Anti-Patterns
- **NPM Tarball Authorization (`EALLOWREMOTE`)**:
  - *Gotcha*: npm v12+ blocks git/tarball dependencies when `allow-remote="none"`.
  - *Strategy*: Set `npm config set allow-remote all` before automated installs.
- **Port Conflict on Dev Servers**:
  - *Gotcha*: Dev servers crashing silently when port 3000 or 5173 is occupied.
  - *Strategy*: Use auto-port assignment or probe ports using `lsof -i :<port>` before launching daemons.

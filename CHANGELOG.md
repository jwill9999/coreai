## [unreleased]

### 🚀 Features

- _(epic-1)_ Scaffold @coreai/agent-types and monorepo foundation
- _(e3-t1)_ Scaffold @coreai/agent-plugin-beads with beadsAdapter, hooks, contextLoader

### 🐛 Bug Fixes

- Remove duplicate codeql.yml and point badge to GitHub-native CodeQL
- _(e3-t1)_ Address Copilot review feedback
- _(e3-t1)_ Use manual Promise wrapper in runBdShow instead of promisify
- _(e3-t4)_ Fix typecheck errors and test infrastructure
- _(e3-t4)_ Fix path traversal check in contextLoader

### 📚 Documentation

- Add SESSION.md update rules to copilot-instructions
- Add SUMMARY.md and document session continuity strategy
- Add ADR-8 — Nx monorepo over separate repositories
- Add branching strategy and changelog workflow to copilot-instructions
- Expand CHANGELOG.md with full Epic 2 entries
- _(agent-core)_ Rewrite README with full setup, API, plugin interface, and docs links

### 🧪 Testing

- _(e3-t4)_ Add unit tests for agent-plugin-beads (26 tests)
- _(e3-t4)_ Update tests for improved contextLoader and beadsAdapter

### ⚙️ Miscellaneous Tasks

- Add ESLint, Jest, Node 24, and Nx plugin tooling
- Add SESSION.md for session continuity
- Update SESSION.md with full epic and task breakdown
- Add git-cliff config for changelog generation
- Update CHANGELOG.md, bump to 0.2.0-alpha.0, update SESSION.md
- Automate CHANGELOG generation on push to main
- Update tsconfig.json project references and package-lock for agent-plugin-beads
- Update SESSION.md — Epic 3 tasks complete, PRs open
- Update SESSION.md — SonarCloud resolved, PRs ready for merge
- Update SESSION.md — epic PR #10 open, awaiting merge to main
- _(changelog)_ Update CHANGELOG.md [skip ci]
- Bump to 0.3.0-alpha.0 and update SESSION.md — Epic 3 complete

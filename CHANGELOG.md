## [unreleased]

### 🚀 Features

- *(epic-1)* Scaffold @coreai/agent-types and monorepo foundation
- *(e3-t1)* Scaffold @coreai/agent-plugin-beads with beadsAdapter, hooks, contextLoader

### 🐛 Bug Fixes

- Remove duplicate codeql.yml and point badge to GitHub-native CodeQL
- *(e3-t1)* Address Copilot review feedback
- *(e3-t1)* Use manual Promise wrapper in runBdShow instead of promisify
- *(e3-t4)* Fix typecheck errors and test infrastructure
- *(e3-t4)* Fix path traversal check in contextLoader

### 📚 Documentation

- Add SESSION.md update rules to copilot-instructions
- Add SUMMARY.md and document session continuity strategy
- Add ADR-8 — Nx monorepo over separate repositories
- Add branching strategy and changelog workflow to copilot-instructions
- Expand CHANGELOG.md with full Epic 2 entries

### 🧪 Testing

- *(e3-t4)* Add unit tests for agent-plugin-beads (26 tests)
- *(e3-t4)* Update tests for improved contextLoader and beadsAdapter

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

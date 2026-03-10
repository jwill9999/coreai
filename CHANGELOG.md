## [unreleased]

### 🚀 Features

- _(epic-1)_ Scaffold @coreai/agent-types and monorepo foundation
- _(e3-t1)_ Scaffold @coreai/agent-plugin-beads with beadsAdapter, hooks, contextLoader
- _(nx-cloud)_ Setup nx cloud workspace
- Rename project from @coreai to @conscius (Conscius)
- Add static version badge to README; update version bump checklist

### 🐛 Bug Fixes

- Remove duplicate codeql.yml and point badge to GitHub-native CodeQL
- _(e3-t1)_ Address Copilot review feedback
- _(e3-t1)_ Use manual Promise wrapper in runBdShow instead of promisify
- _(e3-t4)_ Fix typecheck errors and test infrastructure
- _(e3-t4)_ Fix path traversal check in contextLoader
- Correct SonarCloud badge project key to jwill9999_coreai

### 📚 Documentation

- Add SESSION.md update rules to copilot-instructions
- Add SUMMARY.md and document session continuity strategy
- Add ADR-8 — Nx monorepo over separate repositories
- Add branching strategy and changelog workflow to copilot-instructions
- Expand CHANGELOG.md with full Epic 2 entries
- _(agent-core)_ Rewrite README with full setup, API, plugin interface, and docs links
- Update README badges to live npm shield URLs and improve agent-types README
- Add documentation skill, docs index, ADRs, guides, and API reference
- _(planning)_ Integrate Beads CLI into planning skill
- Rewrite root README, add planning docs and workflow guide
- _(publishing)_ Add npm version badge step to post-publish checklist
- Replace original specs with per-epic source-of-truth specs
- _(session)_ Fix stale version reference 0.2.0 → 0.3.0-alpha.0

### 🎨 Styling

- Fix formatting (Prettier) on feat/nx-cloud/setup
- Fix CHANGELOG.md formatting (Prettier)

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
- _(changelog)_ Update CHANGELOG.md [skip ci]
- Add Nx Cloud fix-ci step for self-healing CI
- _(changelog)_ Update CHANGELOG.md [skip ci]
- Update SESSION.md — Nx Cloud PR #11 merged to main
- _(changelog)_ Update CHANGELOG.md [skip ci]
- _(changelog)_ Update CHANGELOG.md [skip ci]
- Update SESSION.md — note pre-publish dep pinning task
- _(changelog)_ Update CHANGELOG.md [skip ci]
- _(changelog)_ Update CHANGELOG.md [skip ci]
- _(changelog)_ Update CHANGELOG.md [skip ci]
- _(context)_ Add USE WHEN triggers to session+pr-review skills, trim copilot-instructions.md
- _(changelog)_ Update CHANGELOG.md [skip ci]
- Update SESSION.md - document context optimisation work
- _(context)_ Add git-workflow and guardrails skills with USE WHEN triggers
- _(changelog)_ Update CHANGELOG.md [skip ci]
- _(changelog)_ Update CHANGELOG.md [skip ci]
- _(changelog)_ Update CHANGELOG.md [skip ci]
- Bump root package.json to 0.3.0-alpha.0
- _(git-workflow)_ Include root package.json in version bump commands
- _(changelog)_ Update CHANGELOG.md [skip ci]
- _(changelog)_ Update CHANGELOG.md [skip ci]
- _(changelog)_ Update CHANGELOG.md [skip ci]
- Fix remaining coreai references in cliff.toml and package-lock
- _(vscode)_ Add SonarLint connected mode configuration
- _(changelog)_ Update CHANGELOG.md [skip ci]
- _(beads)_ Export issue snapshot for new developer onboarding

## [unreleased]

### 🚀 Features

- *(e11-mvp-1)* Runtime `memoryPromptLimits` — segment count + approximate token caps before prompt build (`@conscius/runtime`)
- *(epic-1)* Scaffold @coreai/agent-types and monorepo foundation
- *(e3-t1)* Scaffold @coreai/agent-plugin-beads with beadsAdapter, hooks, contextLoader
- *(nx-cloud)* Setup nx cloud workspace
- Rename project from @coreai to @conscius (Conscius)
- Add static version badge to README; update version bump checklist
- *(e4-t1)* Implement mulch adapter
- *(e4-t2)* Add mulch session hooks
- *(agent-plugin-mulch)* Complete epic 4 implementation
- *(agent-types)* Align MulchLesson type with upstream ml schema
- *(runtime)* Runtime v3, conscius CLI, and MVP planning alignment
- *(dx)* Interactive Mulch record via make mulch-record

### 🐛 Bug Fixes

- Remove duplicate codeql.yml and point badge to GitHub-native CodeQL
- *(e3-t1)* Address Copilot review feedback
- *(e3-t1)* Use manual Promise wrapper in runBdShow instead of promisify
- *(e3-t4)* Fix typecheck errors and test infrastructure
- *(e3-t4)* Fix path traversal check in contextLoader
- Correct SonarCloud badge project key to jwill9999_coreai
- *(e4-t1)* Address mulch adapter review feedback
- *(tooling)* Remove subprocesses from pr feedback script
- *(e4-t1)* Address review feedback loop
- *(e4-t1)* Address sonar and review findings
- *(e4)* Address Sourcery PR feedback
- *(mulch)* Stage lessons to candidates.jsonl for human review
- *(agent-plugin-mulch)* Check mulch.config.yaml not .mulch/ dir for init guard
- *(agent-plugin-mulch)* Address Sourcery PR feedback
- *(runtime)* Address PR #19 Copilot review (plugins, docs, tsconfig)

### 💼 Other

- *(cursor)* Remove SonarCloud token from mcp.json; document env-based auth
- Wire Epic 11 Beads issues to MVP alignment spec

### 🚜 Refactor

- *(agent-plugin-mulch)* Replace mulch search with ml prime bridge

### 📚 Documentation

- Add SESSION.md update rules to copilot-instructions
- Add SUMMARY.md and document session continuity strategy
- Add ADR-8 — Nx monorepo over separate repositories
- Add branching strategy and changelog workflow to copilot-instructions
- Expand CHANGELOG.md with full Epic 2 entries
- *(agent-core)* Rewrite README with full setup, API, plugin interface, and docs links
- Update README badges to live npm shield URLs and improve agent-types README
- Add documentation skill, docs index, ADRs, guides, and API reference
- *(planning)* Integrate Beads CLI into planning skill
- Rewrite root README, add planning docs and workflow guide
- *(publishing)* Add npm version badge step to post-publish checklist
- Replace original specs with per-epic source-of-truth specs
- *(session)* Fix stale version reference 0.2.0 → 0.3.0-alpha.0
- *(tooling)* Add context7 workflow guidance
- *(e4)* Update session handoff
- Update session handoff
- Add segment 10 — Epic 4 merge and version bump
- *(agent-plugin-mulch)* Sync docs and review follow-ups
- *(agents)* Replace obsolete bd sync with bd dolt pull/push notes
- Refresh README, SESSION, SUMMARY for runtime v3 on main (0.5.0-alpha.0)
- *(planning)* Add developer experience & tooling section with standalone tasks and priorities
- Refresh README, SESSION, SUMMARY for runtime v3 on main (0.5.0-alpha.0)
- *(session)* Hand off after coreai-na7; claim coreai-6n8
- *(mulch)* Explain PATH vs node_modules for make mulch-record
- *(readme)* Link Mulch guide and make mulch-record from Development
- *(session)* Sync after main merge — mulch verify CI, close coreai-f7m, claim coreai-vq3.1
- Align SESSION and planning index with Beads P1/P2

### 🎨 Styling

- Fix formatting (Prettier) on feat/nx-cloud/setup
- Fix CHANGELOG.md formatting (Prettier)
- Apply prettier formatting across main branch

### 🧪 Testing

- *(e3-t4)* Add unit tests for agent-plugin-beads (26 tests)
- *(e3-t4)* Update tests for improved contextLoader and beadsAdapter
- *(e4-t2)* Cover missing activeTask hook case
- *(dx)* Smoke-verify mulch-record-interactive in CI

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
- *(changelog)* Update CHANGELOG.md [skip ci]
- Bump to 0.3.0-alpha.0 and update SESSION.md — Epic 3 complete
- *(changelog)* Update CHANGELOG.md [skip ci]
- Add Nx Cloud fix-ci step for self-healing CI
- *(changelog)* Update CHANGELOG.md [skip ci]
- Update SESSION.md — Nx Cloud PR #11 merged to main
- *(changelog)* Update CHANGELOG.md [skip ci]
- *(changelog)* Update CHANGELOG.md [skip ci]
- Update SESSION.md — note pre-publish dep pinning task
- *(changelog)* Update CHANGELOG.md [skip ci]
- *(changelog)* Update CHANGELOG.md [skip ci]
- *(changelog)* Update CHANGELOG.md [skip ci]
- *(context)* Add USE WHEN triggers to session+pr-review skills, trim copilot-instructions.md
- *(changelog)* Update CHANGELOG.md [skip ci]
- Update SESSION.md - document context optimisation work
- *(context)* Add git-workflow and guardrails skills with USE WHEN triggers
- *(changelog)* Update CHANGELOG.md [skip ci]
- *(changelog)* Update CHANGELOG.md [skip ci]
- *(changelog)* Update CHANGELOG.md [skip ci]
- Bump root package.json to 0.3.0-alpha.0
- *(git-workflow)* Include root package.json in version bump commands
- *(changelog)* Update CHANGELOG.md [skip ci]
- *(changelog)* Update CHANGELOG.md [skip ci]
- *(changelog)* Update CHANGELOG.md [skip ci]
- Fix remaining coreai references in cliff.toml and package-lock
- *(vscode)* Add SonarLint connected mode configuration
- *(changelog)* Update CHANGELOG.md [skip ci]
- *(beads)* Export issue snapshot for new developer onboarding
- *(changelog)* Update CHANGELOG.md [skip ci]
- Update SESSION.md and SUMMARY.md for session end
- *(changelog)* Update CHANGELOG.md [skip ci]
- Disable nx cache for test step to ensure coverage files are written
- *(changelog)* Update CHANGELOG.md [skip ci]
- Exclude CHANGELOG.md from Prettier
- *(changelog)* Update CHANGELOG.md [skip ci]
- Fix Codecov coverage detection on main
- *(changelog)* Update CHANGELOG.md [skip ci]
- Add codecov.yml with carryforward flags
- Add workflow_dispatch to allow manual CI triggers
- *(changelog)* Update CHANGELOG.md [skip ci]
- Fix test cache skip and Codecov files path syntax
- *(changelog)* Update CHANGELOG.md [skip ci]
- Remove agent-types from Codecov upload
- *(changelog)* Update CHANGELOG.md [skip ci]
- Fix lcov source paths for Codecov in monorepo
- *(changelog)* Update CHANGELOG.md [skip ci]
- Update SESSION.md and SUMMARY.md
- Main Add to gitignore tmux
- *(changelog)* Update CHANGELOG.md [skip ci]
- *(changelog)* Update CHANGELOG.md [skip ci]
- *(tooling)* Harden pr feedback workflow
- Refresh session checkpoint
- *(changelog)* Update CHANGELOG.md [skip ci]
- Bump version to 0.4.0-alpha.0
- *(changelog)* Update CHANGELOG.md [skip ci]
- *(changelog)* Update CHANGELOG.md [skip ci]
- *(mulch)* Stage research-first convention lesson in candidates
- *(changelog)* Update CHANGELOG.md [skip ci]
- Update SESSION.md and SUMMARY.md — Epic 4 complete, Epic 5 next
- Update SESSION.md — coreai-8ji before E5
- Update SESSION.md and SUMMARY.md — end of refinement session
- Update SESSION.md and SUMMARY.md — mulch plugin review complete
- *(mulch)* Stage storage-triage lesson in candidates.jsonl
- *(changelog)* Update CHANGELOG.md [skip ci]
- Add beads dependency approach review to SESSION.md open issues
- Feat/runtime-v3-mvp-alignment fix sonarqube issues
- Feat/runtime-v3-mvp-alignment fix sonarqube issues
- Feat/runtime-v3-mvp-alignment fix sonarqube issues
- Feat/runtime-v3-mvp-alignment add curser configs
- *(cursor)* Wire Sonar MCP token via ${env:SONARQUBE_TOKEN} in mcp.json
- *(changelog)* Update CHANGELOG.md [skip ci]
- Main: save mulch lesson
- *(changelog)* Update CHANGELOG.md [skip ci]
- *(changelog)* Update CHANGELOG.md [skip ci]
- *(changelog)* Update CHANGELOG.md [skip ci]
- *(skills)* Mirror .github/skills into .cursor/skills for Cursor
- *(changelog)* Update CHANGELOG.md [skip ci]
- *(changelog)* Update CHANGELOG.md [skip ci]
- *(changelog)* Update CHANGELOG.md [skip ci]
- *(changelog)* Update CHANGELOG.md [skip ci]
- *(changelog)* Update CHANGELOG.md [skip ci]
- *(changelog)* Update CHANGELOG.md [skip ci]
- *(changelog)* Update CHANGELOG.md [skip ci]

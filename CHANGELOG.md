## [unreleased]

## [0.2.0-alpha.0] - 2026-03-10

### 🚀 Features

- _(e2-t1)_ Implement context builder — assembles prompt in canonical injection order (plugins → compression → recent messages); `shouldCompress()` at 30-message threshold
- _(e2-t2)_ Implement plugin loader — loads plugins from config, calls all lifecycle hooks with per-plugin isolation via `AggregateError`
- _(e2-t3)_ Implement HookRunner — resolves `repo/.agent/hooks/` then `~/.agent/hooks/`; enforces write permissions; first-run prompt → `.agent/config.json`; path traversal guard before `spawn`
- _(e2-t4)_ Implement agent CLI — `agent start`, `agent end`, `agent task start <id>` using `commander`; `toMessage()` helper with circular-ref + BigInt guard
- _(e2-t5)_ 58 unit tests across all agent-core modules (context-builder, plugin-loader, hook-runner, CLI/utils) — 100% passing

### 🐛 Bug Fixes

- _(e2-t4)_ Replace `String(err)` coercion with explicit `toMessage` helper (SonarQube S6551)
- _(e2-t4)_ Replace promise chain with top-level await
- _(e2-t4)_ Make `wrapAction` variadic to eliminate immediate invocation pattern
- _(e2-t3)_ Replace negated condition with positive branch first
- _(e2-t3)_ Remove non-null assertions flagged by SonarQube
- _(e2-t3)_ Guard readline prompt against non-TTY environments
- _(e2-t3)_ Set explicit `cwd` when spawning hook processes
- _(e2-t3)_ Use `path.relative` for cross-platform write path normalisation
- _(agent-core)_ Guard `JSON.stringify` in `toMessage` against non-serialisable values (circular refs, BigInt)
- _(agent-core)_ Rename `compressionTriggered` → `compressionApplied` (Sourcery AI)
- _(agent-core)_ Replace hardcoded `/tmp` path in spec with explicit out-of-bounds path (SonarCloud S5443)
- Remove literal `CODECOV_TOKEN` placeholder from badge URL
- Remove duplicate `codeql.yml`; badge now points to GitHub-native CodeQL scanning

### 🛡️ Security

- _(e2-t3)_ Add path traversal guard before `spawn` — rejects hook paths outside approved hook directories
- Pin all GitHub Actions to full commit SHAs (SonarCloud hardening)

### 🧪 Testing

- _(e2-t5)_ 58 unit tests: context-builder (18), plugin-loader (18), hook-runner (19), cli/utils (7)
- Add security test for out-of-bounds hook path rejection

### ⚙️ Miscellaneous Tasks

- Add Husky git hooks: pre-commit (`lint-staged`), pre-push (`nx affected` typecheck + test)
- Add GitHub Actions CI pipeline: format, typecheck, lint, test + Codecov, build
- Integrate SonarCloud, GitHub-native CodeQL, and Sourcery AI automated review
- Add CI/CodeQL/Codecov/SonarCloud badges to README
- Bump all packages to `0.2.0-alpha.0`

## [0.1.0-alpha.0] - 2026-03-09

### 🚀 Features

- _(epic-1)_ Scaffold `@coreai/agent-types` and monorepo foundation — all shared TypeScript interfaces (`AgentPlugin`, `AgentContext`, `CompressionSummary`, `ConversationMessage`, `BuiltContext`)

### 📚 Documentation

- Add SESSION.md update rules to copilot-instructions
- Add SUMMARY.md and document session continuity strategy
- Add ADR-8 — Nx monorepo over separate repositories
- Add branching strategy and changelog workflow to copilot-instructions

### ⚙️ Miscellaneous Tasks

- Add ESLint, Jest, Node 24, and Nx plugin tooling
- Add SESSION.md for session continuity
- Update SESSION.md with full epic and task breakdown
- Add git-cliff config for changelog generation

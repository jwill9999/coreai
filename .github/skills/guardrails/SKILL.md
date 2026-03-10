---
name: guardrails
description: Validation pipeline and quality gates for the Conscius project. Use this skill when a task enters review state, running the guardrails pipeline, checking code quality before a PR, or understanding what quality checks are required. Triggers on tasks involving guardrails, review, validation pipeline, quality gate, pre-PR checks, or entering review.
---

# Guardrails pipeline

Tasks follow this lifecycle: `todo → in_progress → review → done`.

On entering **review**, run the full validation pipeline in order:

## Pipeline steps

| Step                   | Command                                              | Must pass before proceeding   |
| ---------------------- | ---------------------------------------------------- | ----------------------------- |
| 1. Format              | `npx nx format:write`                                | No uncommitted format changes |
| 2. Lint                | `npx nx lint <project>`                              | Zero errors                   |
| 3. Typecheck           | `npx nx typecheck <project>`                         | Zero errors                   |
| 4. Unit tests          | `npx nx test <project>`                              | All tests pass                |
| 5. Full suite (pre-PR) | `npx nx run-many -t typecheck,lint,test,build --all` | All packages pass             |
| 6. Agent review        | Read PR comments for SonarCloud + Sourcery feedback  | Quality Gate passed           |

If any step fails: fix issues → rerun from that step.

## Quality tools

| Tool                                          | Purpose                                                   | Runs on                   |
| --------------------------------------------- | --------------------------------------------------------- | ------------------------- |
| **Nx** (`typecheck`, `lint`, `test`, `build`) | Local quality gates                                       | Every task branch, pre-PR |
| **Sourcery AI**                               | Automated PR code review, architecture diagrams           | Every PR (GitHub bot)     |
| **SonarCloud**                                | Static analysis, security hotspots, coverage, duplication | Every PR + main           |

## SonarCloud action thresholds

- **Bugs / Vulnerabilities** — fix before merge (blocking)
- **Security Hotspots** — review and fix or mark as reviewed with justification
- **Code Smells** — fix if straightforward; log as backlog task if complex
- **Coverage** — gates enforced once unit test suite is established

## Running the pipeline locally

```bash
# Format
npx nx format:write

# Single project
npx nx run-many -t typecheck,lint,test --projects=<project>

# All projects (pre-epic-PR)
npx nx run-many -t typecheck,lint,test,build --all

# Affected only (faster on feature branches)
npx nx affected -t typecheck,lint,test
```

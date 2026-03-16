---
name: pr-review
description: "PR review workflow for the Conscius project. USE WHEN: user opens a pull request, asks to check CI status, mentions SonarCloud or Sourcery feedback, asks if a PR is ready to merge, or needs to resolve a merge conflict. EXAMPLES: 'check if the PR is ready', 'CI failed on my PR', 'SonarCloud flagged something', 'is this ready to merge?', 'fix merge conflict', 'review PR feedback'."
---

# PR review workflow

## Current state

- **Branch:** !`git branch --show-current`
- **Remote status:** !`git status -sb | head -1`
- **Recent commits:** !`git log --oneline -3`

## User instructions

$ARGUMENTS

---

After opening any PR, **proactively** fetch CI/CD feedback before declaring work ready to merge. Do not wait to be asked.

## Checkpoints

| Checkpoint                        | Action                                                                                                                                                 |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| After pushing a task branch       | If a PR exists, run `npm run pr:feedback -- --branch <current-branch>` and inspect the output                                                          |
| After opening a PR                | Poll PR checks until they settle, then rerun `npm run pr:feedback -- --pr <number>`                                                                    |
| After fixing review feedback      | Rerun local IDE diagnostics first, then rerun `npm run pr:feedback`; verify the finding is gone and resolve/close the corresponding feedback item      |
| Before recommending merge         | Use the feedback script to review SonarCloud/Sourcery signals; fix any flagged bugs/vulnerabilities, then close the loop on the related feedback items |
| Before opening an epic PR to main | Verify all task PRs merged cleanly; run full suite locally (`npx nx run-many -t typecheck,lint,test,build --all`)                                      |

## Tools

- `github-mcp-server-actions_list` — list workflow runs and their status
- `github-mcp-server-pull_request_read` with `get_check_runs` — check CI pass/fail on a PR
- `github-mcp-server-issue_read` with `get_comments` — read SonarCloud and Sourcery bot feedback
- `github-mcp-server-get_job_logs` — fetch logs for failed CI jobs
- `ide-get_diagnostics` — first local source for SonarQube/Sourcery diagnostics before querying GitHub
- `npm run pr:feedback -- --pr <number>` — repo-local summary of PR checks plus SonarCloud/Sourcery comment counts

## Default post-push workflow

After any `git push` to a task branch with an open PR:

```bash
npm run pr:feedback -- --branch "$(git branch --show-current)"
```

If checks are still pending, poll the PR checks first and rerun the script once they complete.

## Feedback closure loop

When fixing SonarCloud or Sourcery feedback, do not stop at the code change.

1. Check local IDE diagnostics first (`ide-get_diagnostics`) to confirm what is currently flagged.
2. Implement the fix on the correct source branch.
3. Rerun local validation plus `npm run pr:feedback -- --pr <number>`.
4. Verify the specific finding is no longer present in IDE diagnostics, PR checks, or PR comments.
5. Resolve or close the corresponding feedback item:
   - GitHub review thread/comment: resolve it once the fix is confirmed.
   - SonarCloud hotspot/issue: mark reviewed only after the fix is verified, with justification if required.
6. Do not declare the PR ready while known feedback remains open, stale-but-unresolved, or unverified.

## Bot feedback to action

**SonarCloud:**

- Quality Gate must be **Passed** before merge
- **Bugs / Vulnerabilities** — fix before merge (blocking)
- **Security Hotspots** — review and either fix or mark as reviewed with justification
- **Code Smells** — fix if straightforward; log as a backlog task if complex

**Sourcery AI:**

- Fix anything flagged as a bug risk
- Log non-trivial architectural suggestions as backlog tasks

## Merge conflict check

Always check `mergeable_state` from `pull_request_read` (method: `get`).

If `mergeable_state` is `"dirty"`:

```bash
git checkout <task-branch>
git rebase origin/<base-branch>
# resolve any conflicts, then:
git rebase --continue
git push --force-with-lease
```

**Do not declare a PR ready to merge if `mergeable_state` is anything other than `"clean"`.**

## CI auto-commit pattern (known issue)

After every push to `main`, GitHub Actions auto-commits `chore(changelog): update CHANGELOG.md [skip ci]`, causing non-fast-forward rejections on the next local push. Fix:

```bash
git pull --rebase && git push
```

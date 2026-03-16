#!/usr/bin/env node

const args = process.argv.slice(2);
const owner = 'jwill9999';
const repo = 'conscius';
const token = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN ?? null;

function getArg(name) {
  const index = args.indexOf(name);
  return index >= 0 && index + 1 < args.length ? args[index + 1] : null;
}

function hasFlag(name) {
  return args.includes(name);
}

function assertValidPrNumber(value) {
  if (!/^\d+$/.test(value)) {
    throw new Error(`Invalid PR number: ${value}`);
  }

  return Number(value);
}

function assertValidBranchName(value) {
  if (
    !/^[A-Za-z0-9._/-]+$/.test(value) ||
    value.startsWith('-') ||
    value.endsWith('/')
  ) {
    throw new Error(`Invalid branch name: ${value}`);
  }

  return value;
}

async function githubRequest(path) {
  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'conscius-pr-feedback-script',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`https://api.github.com${path}`, { headers });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub API request failed (${response.status}): ${body}`);
  }

  return response.json();
}

async function resolvePr() {
  const pr = getArg('--pr');

  if (pr) {
    return githubRequest(
      `/repos/${owner}/${repo}/pulls/${assertValidPrNumber(pr)}`,
    );
  }

  const branch = getArg('--branch');

  if (!branch) {
    throw new Error('Pass --pr <number> or --branch <name>.');
  }

  const validatedBranch = assertValidBranchName(branch);
  const pulls = await githubRequest(
    `/repos/${owner}/${repo}/pulls?state=open&head=${owner}:${encodeURIComponent(validatedBranch)}`,
  );
  const matchingPr = pulls.find(
    (candidate) => candidate.head?.ref === validatedBranch,
  );

  if (!matchingPr) {
    throw new Error(`No open PR found for branch: ${validatedBranch}`);
  }

  return githubRequest(`/repos/${owner}/${repo}/pulls/${matchingPr.number}`);
}

function toCheckState(checkRun) {
  if (checkRun.status !== 'completed') {
    return checkRun.status.toUpperCase();
  }

  return (checkRun.conclusion ?? 'completed').toUpperCase();
}

function summarizeChecks(checks) {
  const byName = new Map();
  const failedStates = new Set([
    'FAIL',
    'FAILURE',
    'ERROR',
    'TIMED_OUT',
    'CANCELLED',
  ]);
  const pendingStates = new Set([
    'PENDING',
    'STARTUP_REQUIRED',
    'WAITING',
    'QUEUED',
    'IN_PROGRESS',
  ]);

  for (const check of checks) {
    byName.set(check.name, check);
  }

  return {
    total: checks.length,
    failed: checks.filter((check) => failedStates.has(check.state)).length,
    pending: checks.filter((check) => pendingStates.has(check.state)).length,
    sonarqube: byName.get('SonarCloud Code Analysis') ?? null,
    sourcery: byName.get('Sourcery review') ?? null,
  };
}

function filterComments(comments, login) {
  return comments.filter((comment) => comment.user?.login === login);
}

function buildOutput(pr, checks, issueComments, reviewComments, reviews) {
  const summary = summarizeChecks(checks);
  const sonarComments = filterComments(issueComments, 'sonarqubecloud[bot]');
  const sourceryIssueComments = filterComments(
    issueComments,
    'sourcery-ai[bot]',
  );
  const sourceryReviewComments = filterComments(
    reviewComments,
    'sourcery-ai[bot]',
  );
  const sourceryReviews = filterComments(reviews, 'sourcery-ai[bot]');

  return {
    pr: {
      number: pr.number,
      title: pr.title,
      url: pr.html_url,
      headRefName: pr.head.ref,
      baseRefName: pr.base.ref,
      reviewDecision: null,
    },
    checks: summary,
    comments: {
      sonarIssueCommentCount: sonarComments.length,
      sourceryIssueCommentCount: sourceryIssueComments.length,
      sourceryReviewCommentCount: sourceryReviewComments.length,
      sourceryReviewCount: sourceryReviews.length,
    },
    findings: {
      sonarQualityGateFailed:
        summary.sonarqube != null &&
        ['FAIL', 'FAILURE', 'ERROR', 'TIMED_OUT', 'CANCELLED'].includes(
          summary.sonarqube.state,
        ),
      sonarMentionsSecurityHotspot: sonarComments.some(
        (comment) =>
          comment.body.includes('security_hotspots') ||
          comment.body.includes('Security Hotspot'),
      ),
      sourceryHasReviewComments: sourceryReviewComments.length > 0,
    },
  };
}

function printHuman(output) {
  const { pr, checks, comments, findings } = output;
  const lines = [
    `PR #${pr.number}: ${pr.title}`,
    pr.url,
    `Branch: ${pr.headRefName} -> ${pr.baseRefName}`,
    `Review decision: ${pr.reviewDecision ?? 'none'}`,
    '',
    `Checks: ${checks.total} total, ${checks.failed} failed, ${checks.pending} pending`,
    `- SonarCloud: ${checks.sonarqube?.state ?? 'not found'}`,
    `- Sourcery: ${checks.sourcery?.state ?? 'not found'}`,
    '',
    'Comments:',
    `- Sonar issue comments: ${comments.sonarIssueCommentCount}`,
    `- Sourcery issue comments: ${comments.sourceryIssueCommentCount}`,
    `- Sourcery review comments: ${comments.sourceryReviewCommentCount}`,
    `- Sourcery reviews: ${comments.sourceryReviewCount}`,
    '',
    'Findings:',
    `- Sonar quality gate failed: ${findings.sonarQualityGateFailed ? 'yes' : 'no'}`,
    `- Sonar mentions security hotspot: ${findings.sonarMentionsSecurityHotspot ? 'yes' : 'no'}`,
    `- Sourcery has review comments: ${findings.sourceryHasReviewComments ? 'yes' : 'no'}`,
  ];

  console.log(lines.join('\n'));
}

async function main() {
  const pr = await resolvePr();
  const [issueComments, reviewComments, reviews, checkRunsResponse] =
    await Promise.all([
      githubRequest(`/repos/${owner}/${repo}/issues/${pr.number}/comments`),
      githubRequest(`/repos/${owner}/${repo}/pulls/${pr.number}/comments`),
      githubRequest(`/repos/${owner}/${repo}/pulls/${pr.number}/reviews`),
      githubRequest(
        `/repos/${owner}/${repo}/commits/${pr.head.sha}/check-runs`,
      ),
    ]);
  const checks = checkRunsResponse.check_runs.map((checkRun) => ({
    name: checkRun.name,
    state: toCheckState(checkRun),
    link: checkRun.details_url ?? checkRun.html_url,
  }));
  const output = buildOutput(
    pr,
    checks,
    issueComments,
    reviewComments,
    reviews,
  );

  if (hasFlag('--json')) {
    console.log(JSON.stringify(output, null, 2));
    return;
  }

  printHuman(output);
}

try {
  await main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}

import { execFile } from 'node:child_process';
import type { BeadsTask, BeadsTaskStatus } from '@conscius/runtime';

/** Raw shape returned by `bd show --json <id>`. */
interface BdShowResult {
  id: string;
  title: string;
  status: string;
  description?: string;
  /** External reference — used to carry the spec file path. */
  external_ref?: string;
  /** Dependency issue IDs. */
  deps?: Array<{ id: string }>;
  assignee?: string;
}

const VALID_STATUSES = new Set<BeadsTaskStatus>([
  'todo',
  'in_progress',
  'review',
  'blocked',
  'done',
]);

function toBeadsStatus(raw: string): BeadsTaskStatus {
  const normalised = raw
    .toLowerCase()
    .replace(/[\s-]+/g, '_') as BeadsTaskStatus;
  return VALID_STATUSES.has(normalised) ? normalised : 'todo';
}

function mapToBeadsTask(raw: BdShowResult): BeadsTask {
  return {
    id: raw.id,
    title: raw.title,
    status: toBeadsStatus(raw.status),
    description: raw.description,
    specPath: raw.external_ref,
    dependencies: raw.deps?.map((d) => d.id),
    assignee: raw.assignee,
  };
}

function runBdShow(taskId: string, repoRoot: string): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile(
      'bd',
      ['show', '--json', taskId],
      { cwd: repoRoot },
      (err, stdout) => {
        if (err) {
          reject(err);
        } else {
          resolve(String(stdout));
        }
      },
    );
  });
}

/**
 * Fetches a single Beads task by running `bd show --json <taskId>`.
 *
 * @param taskId  - The Beads issue ID.
 * @param repoRoot - Absolute path to the repository root (used as cwd so `bd`
 *                   auto-discovers the nearest `.beads` database).
 */
export async function fetchBeadsTask(
  taskId: string,
  repoRoot: string,
): Promise<BeadsTask> {
  const stdout = await runBdShow(taskId, repoRoot);

  const parsed: unknown = JSON.parse(stdout);

  // `bd show --json` returns either a single object or an array of one object.
  const raw: BdShowResult = Array.isArray(parsed) ? parsed[0] : parsed;

  if (
    !raw ||
    typeof raw.id !== 'string' ||
    typeof raw.title !== 'string' ||
    typeof raw.status !== 'string'
  ) {
    throw new Error(
      `fetchBeadsTask: unexpected response from 'bd show --json ${taskId}'`,
    );
  }

  return mapToBeadsTask(raw);
}

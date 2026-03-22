import { execFile } from 'node:child_process';
import { constants } from 'node:fs';
import { access } from 'node:fs/promises';
import { delimiter, join } from 'node:path';

const EXEC_TIMEOUT_MS = 10_000;

/**
 * Resolve the `ml` binary on `$PATH`.
 * Throws with install instructions when not found.
 */
export async function resolveMlExecutable(): Promise<string> {
  const searchPath = process.env['PATH'];

  if (!searchPath) {
    throw new Error(
      'agent-plugin-mulch: ml is required but was not found on PATH.\n' +
        'Install it with: npm install -g @os-eco/mulch-cli',
    );
  }

  for (const directory of searchPath.split(delimiter)) {
    if (!directory) {
      continue;
    }

    const candidate = join(directory, 'ml');

    try {
      await access(candidate, constants.X_OK);
      return candidate;
    } catch {
      // Keep searching PATH entries.
    }
  }

  throw new Error(
    'agent-plugin-mulch: ml is required but was not found on PATH.\n' +
      'Install it with: npm install -g @os-eco/mulch-cli',
  );
}

function execMl(
  mlPath: string,
  args: string[],
  cwd: string,
): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    execFile(
      mlPath,
      args,
      { cwd, timeout: EXEC_TIMEOUT_MS },
      (err, stdout, stderr) => {
        const stdoutStr = String(stdout ?? '');
        const stderrStr = String(stderr ?? '');

        if (err) {
          const parts = [
            err.message,
            stderrStr && `stderr: ${stderrStr}`,
          ].filter(Boolean);
          reject(new Error(parts.join('\n')));
          return;
        }

        resolve({ stdout: stdoutStr, stderr: stderrStr });
      },
    );
  });
}

/**
 * Verify that `ml` can execute (i.e. Bun is installed).
 * Throws with install instructions when Bun is missing.
 */
export async function assertMlRunnable(mlPath: string): Promise<void> {
  try {
    await execMl(mlPath, ['--version'], process.cwd());
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const isBunMissing =
      message.includes('bun') ||
      (err instanceof Error &&
        (err as NodeJS.ErrnoException).code === 'ENOENT' &&
        (err as NodeJS.ErrnoException).syscall?.startsWith('spawn'));

    if (isBunMissing) {
      throw new Error(
        'agent-plugin-mulch: ml requires Bun to run, but Bun was not found.\n' +
          'Install Bun: curl -fsSL https://bun.sh/install | bash\n' +
          'Then restart your terminal.',
      );
    }

    throw err;
  }
}

/**
 * Initialise a `.mulch/` directory in the given repo root via `ml init`.
 */
export async function runMlInit(
  mlPath: string,
  repoRoot: string,
): Promise<void> {
  try {
    await execMl(mlPath, ['init'], repoRoot);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    throw new Error(
      `agent-plugin-mulch: ml init failed in ${repoRoot}\n${errorMessage}`,
    );
  }
}

/**
 * Run `ml prime` (all domains, budget-limited) and return the raw stdout.
 */
export async function runMlPrime(
  mlPath: string,
  repoRoot: string,
): Promise<string> {
  try {
    const { stdout } = await execMl(mlPath, ['prime'], repoRoot);
    return stdout;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    throw new Error(`agent-plugin-mulch: ml prime failed\n${errorMessage}`);
  }
}

/**
 * Resolve `ml`, verify it can run, and return `ml prime` output.
 */
export async function queryMulch(repoRoot: string): Promise<string> {
  const mlPath = await resolveMlExecutable();
  await assertMlRunnable(mlPath);

  const stdout = await runMlPrime(mlPath, repoRoot);
  return stdout.trim();
}

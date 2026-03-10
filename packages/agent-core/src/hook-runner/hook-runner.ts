import type {
  AgentConfig,
  AgentContext,
  AgentPlugin,
} from '@coreai/agent-types';
import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { createInterface } from 'node:readline';
import { spawn } from 'node:child_process';
import { homedir } from 'node:os';
import { dirname, join, relative, resolve, sep } from 'node:path';

/** Maps AgentPlugin lifecycle method names to their hook script file names. */
export const HOOK_NAMES: Record<keyof Omit<AgentPlugin, 'name'>, string> = {
  onSessionStart: 'session-start',
  onTaskStart: 'task-start',
  onConversationThreshold: 'conversation-threshold',
  onSessionEnd: 'session-end',
};

/** Extensions tried in order when resolving a hook script. */
const HOOK_EXTENSIONS = ['.sh', '.js', '.mjs', '.cjs'] as const;

const DEFAULT_REPO_HOOKS_DIR = '.agent/hooks';
const DEFAULT_GLOBAL_HOOKS_DIR = '~/.agent/hooks';
const DEFAULT_ALLOW_WRITE = ['SESSION.md', '.mulch/mulch.jsonl'];

/** Executor to use based on file extension. */
function resolveExecutor(hookPath: string): { cmd: string; args: string[] } {
  if (hookPath.endsWith('.sh')) return { cmd: 'sh', args: [hookPath] };
  return { cmd: process.execPath, args: [hookPath] };
}

export const DEFAULT_AGENT_CONFIG: AgentConfig = {
  plugins: [],
  hooks: {
    repoHooksDir: DEFAULT_REPO_HOOKS_DIR,
    globalHooksDir: DEFAULT_GLOBAL_HOOKS_DIR,
  },
  permissions: {
    allowWrite: DEFAULT_ALLOW_WRITE,
  },
  approvedWrites: {},
};

export class HookRunner {
  private readonly repoRoot: string;
  private readonly config: AgentConfig;

  constructor(repoRoot: string, config: AgentConfig) {
    this.repoRoot = repoRoot;
    this.config = config;
  }

  /**
   * Resolves a hook script by name, checking the repo hooks directory first
   * then the global hooks directory. Returns the absolute path of the first
   * matching file, or null if no hook is found.
   */
  async resolveHook(hookName: string): Promise<string | null> {
    const repoHooksDir = join(
      this.repoRoot,
      this.config.hooks?.repoHooksDir ?? DEFAULT_REPO_HOOKS_DIR,
    );
    const rawGlobal =
      this.config.hooks?.globalHooksDir ?? DEFAULT_GLOBAL_HOOKS_DIR;
    const globalHooksDir = rawGlobal.replace(/^~(?=$|\/)/, homedir());

    for (const dir of [repoHooksDir, globalHooksDir]) {
      for (const ext of HOOK_EXTENSIONS) {
        const hookPath = join(dir, `${hookName}${ext}`);
        try {
          await access(hookPath);
          return hookPath;
        } catch {
          // not found — try next
        }
      }
    }
    return null;
  }

  /**
   * Runs the named hook script if one exists. Environment variables are
   * injected so the hook can read session context without needing JSON parsing.
   * Resolves silently when no hook script is found.
   */
  async runHook(hookName: string, context: AgentContext): Promise<void> {
    const hookPath = await this.resolveHook(hookName);
    if (!hookPath) return;

    const approvedWrites = Object.entries(this.config.approvedWrites ?? {})
      .filter(([, approved]) => approved)
      .map(([path]) => path)
      .join(':');

    const env: NodeJS.ProcessEnv = {
      ...process.env,
      AGENT_REPO_ROOT: context.repoRoot,
      AGENT_APPROVED_WRITES: approvedWrites,
      AGENT_ACTIVE_TASK_ID: context.activeTask?.id ?? '',
    };

    await this.executeHook(hookPath, env);
  }

  /**
   * Returns true when the given file path (relative to repoRoot or absolute)
   * is explicitly approved for writing in the current config. Checks
   * `approvedWrites` first, then falls back to the `permissions.allowWrite`
   * list.
   */
  isApprovedWrite(filePath: string): boolean {
    const normalized = this.normalizeWritePath(filePath);

    const perFileApproval = this.config.approvedWrites?.[normalized];
    if (perFileApproval === true) return true;
    if (perFileApproval === false) return false;

    return this.config.permissions?.allowWrite?.includes(normalized) ?? false;
  }

  /**
   * Reads `.agent/config.json` from the repo root. If the file does not exist
   * (first run), prompts the user for write permission and persists the result
   * before returning.
   */
  static async ensureConfig(repoRoot: string): Promise<AgentConfig> {
    const configPath = join(repoRoot, '.agent', 'config.json');

    try {
      const raw = await readFile(configPath, 'utf8');
      return JSON.parse(raw) as AgentConfig;
    } catch {
      // First run — prompt and persist.
      const approvedPaths =
        await HookRunner.promptWritePermissions(DEFAULT_ALLOW_WRITE);

      const config: AgentConfig = {
        ...DEFAULT_AGENT_CONFIG,
        approvedWrites: Object.fromEntries(approvedPaths.map((p) => [p, true])),
      };

      await mkdir(join(repoRoot, '.agent'), { recursive: true });
      await writeFile(
        configPath,
        JSON.stringify(config, null, 2) + '\n',
        'utf8',
      );

      return config;
    }
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  private executeHook(hookPath: string, env: NodeJS.ProcessEnv): Promise<void> {
    return new Promise((res, rej) => {
      // Security: validate hookPath is within an approved hooks directory
      // (repo .agent/hooks or global ~/.agent/hooks) before spawning.
      const repoHooksDir = resolve(
        this.repoRoot,
        this.config.hooks?.repoHooksDir ?? DEFAULT_REPO_HOOKS_DIR,
      );
      const rawGlobal =
        this.config.hooks?.globalHooksDir ?? DEFAULT_GLOBAL_HOOKS_DIR;
      const globalHooksDir = resolve(
        rawGlobal.replace(/^~(?=$|\/)/, homedir()),
      );
      const absHookPath = resolve(hookPath);

      if (
        !absHookPath.startsWith(repoHooksDir + sep) &&
        !absHookPath.startsWith(globalHooksDir + sep)
      ) {
        rej(
          new Error(
            `Hook path "${hookPath}" is outside approved hook directories`,
          ),
        );
        return;
      }

      const { cmd, args } = resolveExecutor(absHookPath);
      const cwd = absHookPath.startsWith(resolve(this.repoRoot) + sep)
        ? this.repoRoot
        : dirname(absHookPath);

      const child = spawn(cmd, args, {
        env,
        cwd,
        stdio: ['ignore', 'inherit', 'inherit'],
      });

      child.on('error', rej);
      child.on('close', (code) => {
        if (code === 0) {
          res();
        } else {
          rej(new Error(`Hook "${hookPath}" exited with code ${code}`));
        }
      });
    });
  }

  private normalizeWritePath(filePath: string): string {
    const repoAbs = resolve(this.repoRoot);
    const abs = resolve(repoAbs, filePath);
    const rel = relative(repoAbs, abs);
    return rel.startsWith('..' + sep) || rel === '..' ? abs : rel;
  }

  private static promptWritePermissions(
    defaultPaths: string[],
  ): Promise<string[]> {
    // In non-interactive environments (CI, redirected stdin) avoid blocking on readline.
    if (!process.stdin.isTTY || !process.stdout.isTTY) {
      return Promise.resolve([]);
    }
    return new Promise((res) => {
      const rl = createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      const list = defaultPaths.join(', ');
      rl.question(
        `agent-core: Allow hooks to write to approved paths (${list})? [y/N] `,
        (answer) => {
          rl.close();
          res(answer.trim().toLowerCase() === 'y' ? defaultPaths : []);
        },
      );
    });
  }
}

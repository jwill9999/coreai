#!/usr/bin/env node
import type {
  AgentPlugin,
  CompressionSummary,
  ConversationMessage,
  MulchLesson,
} from '@conscius/agent-types';
import { Command } from 'commander';
import { HookRunner, HOOK_NAMES } from './hook-runner/index.js';
import { PluginLoader } from './plugin-loader/index.js';
import { toMessage } from './utils.js';

type HookName = keyof Omit<AgentPlugin, 'name'>;

interface BootstrapOptions {
  taskId?: string;
}

async function bootstrap(opts: BootstrapOptions = {}) {
  const repoRoot = process.cwd();
  const config = await HookRunner.ensureConfig(repoRoot);

  const loader = new PluginLoader();
  await loader.load(config.plugins ?? []);

  const runner = new HookRunner(repoRoot, config);

  const context = {
    repoRoot,
    config,
    pendingMulchLessons: [] as MulchLesson[],
    promptSegments: [] as string[],
    conversation: [] as ConversationMessage[],
    compressionSummaries: [] as CompressionSummary[],
    ...(opts.taskId
      ? {
          activeTask: {
            id: opts.taskId,
            title: opts.taskId,
            status: 'in_progress' as const,
          },
        }
      : {}),
  };

  return { context, loader, runner };
}

async function runLifecycle(
  hook: HookName,
  loaderFn: (
    loader: PluginLoader,
    ctx: Awaited<ReturnType<typeof bootstrap>>['context'],
  ) => Promise<void>,
  opts?: BootstrapOptions,
): Promise<void> {
  const { context, loader, runner } = await bootstrap(opts);
  await loaderFn(loader, context);
  await runner.runHook(HOOK_NAMES[hook], context);
}

function wrapAction<Args extends unknown[]>(
  fn: (...args: Args) => Promise<void>,
): (...args: Args) => void {
  return (...args: Args) => {
    fn(...args).catch((err: unknown) => {
      console.error('agent:', toMessage(err));
      process.exit(1);
    });
  };
}

const program = new Command();

program
  .name('agent')
  .description('conscius agent CLI')
  .version('0.1.0-alpha.0');

program
  .command('start')
  .description(
    'Start an agent session — loads config, runs onSessionStart hooks',
  )
  .action(
    wrapAction(() =>
      runLifecycle('onSessionStart', (loader, ctx) =>
        loader.runSessionStart(ctx),
      ),
    ),
  );

program
  .command('end')
  .description('End an agent session — runs onSessionEnd hooks')
  .action(
    wrapAction(() =>
      runLifecycle('onSessionEnd', (loader, ctx) => loader.runSessionEnd(ctx)),
    ),
  );

const taskCmd = program.command('task').description('Task-level commands');

taskCmd
  .command('start <id>')
  .description(
    'Mark a task as started — runs onTaskStart hooks with the given task id',
  )
  .action(
    wrapAction((id: string) =>
      runLifecycle('onTaskStart', (loader, ctx) => loader.runTaskStart(ctx), {
        taskId: id,
      }),
    ),
  );

try {
  await program.parseAsync(process.argv);
} catch (err: unknown) {
  console.error('agent:', toMessage(err));
  process.exit(1);
}

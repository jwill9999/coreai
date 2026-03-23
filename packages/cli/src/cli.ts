#!/usr/bin/env node
import type {
  CompressionSummary,
  ConversationMessage,
  MulchLesson,
} from '@conscius/runtime';
import {
  createHostRuntimeContext,
  createRuntime,
  HookRunner,
  HOOK_SCRIPT_NAMES,
  toMessage,
} from '@conscius/runtime';
import { Command } from 'commander';
import { runFullCycleAndBuildPrompt } from './run-flow.js';

interface BootstrapOptions {
  taskId?: string;
}

async function bootstrap(opts: BootstrapOptions = {}) {
  const repoRoot = process.cwd();
  const config = await HookRunner.ensureConfig(repoRoot);

  const runtime = createRuntime();
  await runtime.loadFromConfig(config.plugins ?? [], repoRoot);

  const hookRunner = new HookRunner(repoRoot, config);

  const context = createHostRuntimeContext({
    repoRoot,
    config,
    pendingMulchLessons: [] as MulchLesson[],
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
  });

  return { context, runtime, hookRunner };
}

async function sessionStartFlow(opts?: BootstrapOptions): Promise<void> {
  const { context, runtime, hookRunner } = await bootstrap(opts);
  await runtime.runSessionStart(context);
  await hookRunner.runHook(HOOK_SCRIPT_NAMES.onSessionStart, context);
  await runtime.runMemoryCompose(context);
  await hookRunner.runHook(HOOK_SCRIPT_NAMES.onMemoryCompose, context);
}

async function sessionEndFlow(): Promise<void> {
  const { context, runtime, hookRunner } = await bootstrap();
  await runtime.runSessionEnd(context);
  await hookRunner.runHook(HOOK_SCRIPT_NAMES.onSessionEnd, context);
}

async function taskStartFlow(taskId: string): Promise<void> {
  const { context, runtime, hookRunner } = await bootstrap({ taskId });
  await runtime.runTaskStart(context);
  await hookRunner.runHook(HOOK_SCRIPT_NAMES.onTaskStart, context);
  await runtime.runMemoryCompose(context);
  await hookRunner.runHook(HOOK_SCRIPT_NAMES.onMemoryCompose, context);
}

function wrapAction<Args extends unknown[]>(
  fn: (...args: Args) => Promise<void>,
): (...args: Args) => void {
  return (...args: Args) => {
    fn(...args).catch((err: unknown) => {
      console.error('conscius:', toMessage(err));
      process.exit(1);
    });
  };
}

const program = new Command();

program
  .name('conscius')
  .description('Conscius CLI — runtime consumer')
  .version('0.5.0-alpha.0');

program
  .command('run')
  .description(
    'Full cycle: load config and plugins, session start + memory compose, print final prompt',
  )
  .requiredOption(
    '--input <text>',
    'User message to include as the latest turn before building the prompt',
  )
  .action(
    wrapAction(async (opts: { input: string }) => {
      const repoRoot = process.cwd();
      const { prompt } = await runFullCycleAndBuildPrompt({
        repoRoot,
        input: opts.input,
      });
      process.stdout.write(prompt);
      if (prompt.length > 0 && !prompt.endsWith('\n')) {
        process.stdout.write('\n');
      }
    }),
  );

program
  .command('start')
  .description(
    'Start an agent session — loads config, runs onSessionStart hooks',
  )
  .action(wrapAction(() => sessionStartFlow()));

program
  .command('end')
  .description('End an agent session — runs onSessionEnd hooks')
  .action(wrapAction(() => sessionEndFlow()));

const taskCmd = program.command('task').description('Task-level commands');

taskCmd
  .command('start <id>')
  .description(
    'Mark a task as started — runs onTaskStart hooks with the given task id',
  )
  .action(wrapAction((id: string) => taskStartFlow(id)));

try {
  await program.parseAsync(process.argv);
} catch (err: unknown) {
  console.error('conscius:', toMessage(err));
  process.exit(1);
}

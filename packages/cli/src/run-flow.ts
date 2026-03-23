import type {
  BuiltContext,
  CompressionSummary,
  ConversationMessage,
  MulchLesson,
} from '@conscius/runtime';
import {
  createHostRuntimeContext,
  createRuntime,
  HookRunner,
  HOOK_SCRIPT_NAMES,
} from '@conscius/runtime';

export interface RunFullCycleOptions {
  repoRoot: string;
  /** Appended as the latest user turn before `buildPromptContext`. */
  input: string;
  taskId?: string;
}

export interface RunFullCycleResult {
  prompt: string;
  built: BuiltContext;
}

/**
 * Loads `.agent/config.json`, plugins, runs session-start + memory-compose (plugins
 * and repo/global hooks), then builds the final prompt. Used by `conscius run`.
 */
export async function runFullCycleAndBuildPrompt(
  options: RunFullCycleOptions,
): Promise<RunFullCycleResult> {
  const config = await HookRunner.ensureConfig(options.repoRoot);

  const runtime = createRuntime();
  await runtime.loadFromConfig(config.plugins ?? [], options.repoRoot);

  const hookRunner = new HookRunner(options.repoRoot, config);

  const conversation: ConversationMessage[] = [];
  if (options.input.length > 0) {
    conversation.push({ role: 'user', content: options.input });
  }

  const context = createHostRuntimeContext({
    repoRoot: options.repoRoot,
    config,
    pendingMulchLessons: [] as MulchLesson[],
    conversation,
    compressionSummaries: [] as CompressionSummary[],
    ...(options.taskId
      ? {
          activeTask: {
            id: options.taskId,
            title: options.taskId,
            status: 'in_progress' as const,
          },
        }
      : {}),
  });

  await runtime.runSessionStart(context);
  await hookRunner.runHook(HOOK_SCRIPT_NAMES.onSessionStart, context);
  await runtime.runMemoryCompose(context);
  await hookRunner.runHook(HOOK_SCRIPT_NAMES.onMemoryCompose, context);

  const built = runtime.buildPromptContext(context);

  return { prompt: built.prompt, built };
}

import type {
  CompressionSummary,
  ConversationMessage,
  MulchLesson,
} from './domain.js';
import type { HostRuntimeContext, Plugin } from './public-types.js';
import { createHostRuntimeContext } from './host-context.js';
import { HookRunner, HOOK_SCRIPT_NAMES } from './hook-runner.js';
import { buildPromptContext } from './memory-pipeline.js';
import { PluginLoader } from './plugin-loader.js';

export interface CreateRuntimeOptions {
  plugins?: Plugin[];
}

/**
 * Programmatic entry: orchestrates loaded plugins over a host context.
 */
export function createRuntime(options: CreateRuntimeOptions = {}) {
  const loader = new PluginLoader(options.plugins ?? []);

  return {
    getPlugins(): ReadonlyArray<Plugin> {
      return loader.getPlugins();
    },

    async loadFromConfig(
      pluginPaths: string[],
      repoRoot: string = process.cwd(),
    ): Promise<void> {
      await loader.load(pluginPaths, repoRoot);
    },

    async runSessionStart(ctx: HostRuntimeContext): Promise<void> {
      await loader.runSessionStart(ctx);
    },

    async runTaskStart(ctx: HostRuntimeContext): Promise<void> {
      await loader.runTaskStart(ctx);
    },

    async runMemoryCompose(ctx: HostRuntimeContext): Promise<void> {
      await loader.runMemoryCompose(ctx);
    },

    async runSessionEnd(ctx: HostRuntimeContext): Promise<void> {
      await loader.runSessionEnd(ctx);
    },

    buildPromptContext(ctx: HostRuntimeContext) {
      return buildPromptContext(ctx);
    },

    /**
     * One full compose cycle for a single user turn: load config from disk,
     * (re)load plugins from `config.plugins`, run session-start + memory-compose
     * (plugin hooks and optional shell hooks), then return the final prompt
     * string only. Async because hooks and plugin loading are async.
     */
    async run(
      input: string,
      repoRoot: string = process.cwd(),
    ): Promise<string> {
      const config = await HookRunner.ensureConfig(repoRoot);
      await loader.load(config.plugins ?? [], repoRoot);

      const hookRunner = new HookRunner(repoRoot, config);
      const conversation: ConversationMessage[] =
        input.length > 0 ? [{ role: 'user', content: input }] : [];

      const ctx = createHostRuntimeContext({
        repoRoot,
        config,
        pendingMulchLessons: [] as MulchLesson[],
        conversation,
        compressionSummaries: [] as CompressionSummary[],
      });

      await loader.runSessionStart(ctx);
      await hookRunner.runHook(HOOK_SCRIPT_NAMES.onSessionStart, ctx);
      await loader.runMemoryCompose(ctx);
      await hookRunner.runHook(HOOK_SCRIPT_NAMES.onMemoryCompose, ctx);

      return buildPromptContext(ctx).prompt;
    },
  };
}

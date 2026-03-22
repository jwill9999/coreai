import type { HostRuntimeContext, Plugin } from './public-types.js';
import { PluginLoader } from './plugin-loader.js';
import { buildPromptContext } from './memory-pipeline.js';

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
  };
}

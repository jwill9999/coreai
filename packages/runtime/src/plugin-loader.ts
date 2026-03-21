import type { HostRuntimeContext } from './public-types.js';
import type { Plugin } from './public-types.js';
import { definePlugin } from './define-plugin.js';
import { validateAllMemorySegments } from './memory-pipeline.js';
import { normaliseSegmentSource } from './validate-segment.js';
import { toPluginContext } from './host-context.js';

export class PluginLoader {
  private plugins: Plugin[] = [];

  constructor(initialPlugins: Plugin[] = []) {
    this.plugins = [...initialPlugins];
  }

  /**
   * Dynamically imports and registers plugins from the provided module paths.
   * Each path can be an npm package name or a file path.
   * Expects default export or named `plugin` export; passes through `definePlugin`.
   */
  async load(pluginPaths: string[]): Promise<void> {
    this.plugins = [];

    for (const path of pluginPaths) {
      const mod = await import(path);
      const raw = mod.default ?? mod.plugin;
      let plugin: Plugin;
      try {
        plugin = definePlugin(raw);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        throw new Error(
          `Plugin at "${path}" does not export a valid plugin: ${msg}`,
        );
      }

      if (!plugin || typeof plugin.name !== 'string') {
        throw new Error(
          `Plugin at "${path}" does not export a valid plugin. ` +
            `Expected a default export or named "plugin" export.`,
        );
      }

      this.plugins.push(plugin);
    }
  }

  getPlugins(): ReadonlyArray<Plugin> {
    return this.plugins;
  }

  async runSessionStart(ctx: HostRuntimeContext): Promise<void> {
    await this.runHook('onSessionStart', ctx);
  }

  async runTaskStart(ctx: HostRuntimeContext): Promise<void> {
    await this.runHook('onTaskStart', ctx);
  }

  async runMemoryCompose(ctx: HostRuntimeContext): Promise<void> {
    await this.runHook('onMemoryCompose', ctx);
    validateAllMemorySegments(ctx.memorySegments);
  }

  async runSessionEnd(ctx: HostRuntimeContext): Promise<void> {
    await this.runHook('onSessionEnd', ctx);
  }

  private async runHook(
    hook: keyof Pick<
      Plugin,
      'onSessionStart' | 'onTaskStart' | 'onMemoryCompose' | 'onSessionEnd'
    >,
    ctx: HostRuntimeContext,
  ): Promise<void> {
    const errors: Array<{ plugin: string; error: unknown }> = [];
    const pluginCtx = toPluginContext(ctx);

    for (const plugin of this.plugins) {
      const fn = plugin[hook];
      if (typeof fn === 'function') {
        try {
          await fn.call(plugin, pluginCtx);
          for (const seg of ctx.memorySegments) {
            normaliseSegmentSource(seg, plugin.name);
          }
        } catch (error) {
          errors.push({ plugin: plugin.name, error });
        }
      }
    }

    if (errors.length === 1) {
      throw errors[0].error;
    }

    if (errors.length > 1) {
      const summary = errors
        .map(
          ({ plugin, error }) =>
            `  [${plugin}]: ${error instanceof Error ? error.message : String(error)}`,
        )
        .join('\n');
      throw new AggregateError(
        errors.map(({ error }) => error),
        `${errors.length} plugin(s) failed during "${hook}":\n${summary}`,
      );
    }
  }
}

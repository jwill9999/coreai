import type { AgentContext, AgentPlugin } from '@coreai/agent-types';

export class PluginLoader {
  private plugins: AgentPlugin[] = [];

  /**
   * Dynamically imports and registers plugins from the provided module paths.
   * Each path can be an npm package name (e.g. `@coreai/agent-plugin-beads`)
   * or a file path (e.g. `./plugins/my-plugin.js`).
   *
   * Expects each module to export either:
   *   - a default export implementing AgentPlugin, or
   *   - a named `plugin` export implementing AgentPlugin
   */
  async load(pluginPaths: string[]): Promise<void> {
    this.plugins = [];

    for (const path of pluginPaths) {
      const mod = await import(path);
      const plugin: AgentPlugin = mod.default ?? mod.plugin;

      if (!plugin || typeof plugin.name !== 'string') {
        throw new Error(
          `Plugin at "${path}" does not export a valid AgentPlugin. ` +
            `Expected a default export or named "plugin" export with a "name" property.`,
        );
      }

      this.plugins.push(plugin);
    }
  }

  /** Returns the loaded plugins (read-only). */
  getPlugins(): ReadonlyArray<AgentPlugin> {
    return this.plugins;
  }

  /** Calls onSessionStart on all plugins that implement it. */
  async runSessionStart(context: AgentContext): Promise<void> {
    await this.runHook('onSessionStart', context);
  }

  /** Calls onTaskStart on all plugins that implement it. */
  async runTaskStart(context: AgentContext): Promise<void> {
    await this.runHook('onTaskStart', context);
  }

  /** Calls onConversationThreshold on all plugins that implement it. */
  async runConversationThreshold(context: AgentContext): Promise<void> {
    await this.runHook('onConversationThreshold', context);
  }

  /** Calls onSessionEnd on all plugins that implement it. */
  async runSessionEnd(context: AgentContext): Promise<void> {
    await this.runHook('onSessionEnd', context);
  }

  private async runHook(
    hook: keyof Omit<AgentPlugin, 'name'>,
    context: AgentContext,
  ): Promise<void> {
    for (const plugin of this.plugins) {
      const fn = plugin[hook];
      if (typeof fn === 'function') {
        await fn.call(plugin, context);
      }
    }
  }
}

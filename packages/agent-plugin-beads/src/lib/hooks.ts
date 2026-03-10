import type { AgentContext, AgentPlugin } from '@coreai/agent-types';
import { fetchBeadsTask } from './beadsAdapter.js';
import { loadSpecContent } from './contextLoader.js';

/**
 * `agent-plugin-beads` — injects Beads task metadata and spec content into
 * the agent context whenever a task becomes active.
 *
 * Requires `context.activeTask.id` to be pre-set by the caller (e.g. via
 * `agent task start <id>`), or falls back to `BD_TASK_ID` env var.
 */
export const beadsPlugin: AgentPlugin = {
  name: 'agent-plugin-beads',

  async onTaskStart(context: AgentContext): Promise<void> {
    const taskId = context.activeTask?.id ?? process.env['BD_TASK_ID'];

    if (!taskId) {
      return;
    }

    const task = await fetchBeadsTask(taskId, context.repoRoot);
    context.activeTask = task;

    const segments: string[] = [];

    segments.push(
      [
        `## Active Beads Task`,
        `**ID**: ${task.id}`,
        `**Title**: ${task.title}`,
        `**Status**: ${task.status}`,
        task.description ? `**Description**: ${task.description}` : null,
        task.assignee ? `**Assignee**: ${task.assignee}` : null,
        task.dependencies?.length
          ? `**Depends on**: ${task.dependencies.join(', ')}`
          : null,
      ]
        .filter(Boolean)
        .join('\n'),
    );

    if (task.specPath) {
      const specContent = await loadSpecContent(
        task.specPath,
        context.repoRoot,
      );
      if (specContent) {
        segments.push(
          `## Task Specification (${task.specPath})\n\n${specContent}`,
        );
      }
    }

    context.promptSegments.push(...segments);
  },
};

export default beadsPlugin;

import type { RuntimeContext } from '@conscius/runtime';
import { definePlugin } from '@conscius/runtime';
import { fetchBeadsTask } from './beadsAdapter.js';
import { loadSpecContent } from './contextLoader.js';

/**
 * `agent-plugin-beads` — injects Beads task metadata and spec content into
 * memory whenever a task becomes active.
 *
 * Requires `context.activeTask.id` to be pre-set by the caller (e.g. via
 * `agent task start <id>`), or falls back to `BD_TASK_ID` env var.
 */
const beadsPlugin = definePlugin({
  name: 'agent-plugin-beads',

  async onTaskStart(context: RuntimeContext): Promise<void> {
    const taskId = context.activeTask?.id ?? process.env['BD_TASK_ID'];

    if (!taskId) {
      return;
    }

    const task = await fetchBeadsTask(taskId, context.repoRoot);
    context.activeTask = task;

    const taskBlock = [
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
      .join('\n');

    context.memorySegments.push({
      type: 'instruction',
      content: taskBlock,
    });

    if (task.specPath) {
      const specContent = await loadSpecContent(
        task.specPath,
        context.repoRoot,
      );
      if (specContent) {
        context.memorySegments.push({
          type: 'context',
          content: `## Task Specification (${task.specPath})\n\n${specContent}`,
        });
      }
    }
  },
});

export { beadsPlugin };
export default beadsPlugin;

import type {
  AgentContext,
  AgentPlugin,
  MulchLesson,
} from '@conscius/agent-types';
import { queryMulch } from './mulchAdapter.js';

function getTopicHint(context: AgentContext): string | undefined {
  const description = context.activeTask?.description?.trim();

  if (description) {
    return description;
  }

  const title = context.activeTask?.title?.trim();

  return title || undefined;
}

function formatLesson(lesson: MulchLesson): string {
  return [
    `### ${lesson.summary}`,
    `**Topic**: ${lesson.topic}`,
    `**Recommendation**: ${lesson.recommendation}`,
    `**Created**: ${lesson.created}`,
  ].join('\n');
}

/**
 * `agent-plugin-mulch` — injects relevant experience lessons into the agent
 * prompt when a session starts.
 */
export const mulchPlugin: AgentPlugin = {
  name: 'agent-plugin-mulch',

  async onSessionStart(context: AgentContext): Promise<void> {
    const topicHint = getTopicHint(context);

    if (!topicHint) {
      return;
    }

    const lessons = await queryMulch(topicHint, context.repoRoot);

    if (lessons.length === 0) {
      return;
    }

    context.promptSegments.push(
      `## Experience Lessons\n\n${lessons.map(formatLesson).join('\n\n')}`,
    );
  },
};

export default mulchPlugin;

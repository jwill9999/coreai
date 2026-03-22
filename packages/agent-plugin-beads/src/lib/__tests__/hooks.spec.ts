import type { AgentConfig, RuntimeContext } from '@conscius/runtime';
import { beadsPlugin } from '../hooks.js';
import * as beadsAdapter from '../beadsAdapter.js';
import * as contextLoader from '../contextLoader.js';

jest.mock('../beadsAdapter.js');
jest.mock('../contextLoader.js');

const mockFetchBeadsTask = beadsAdapter.fetchBeadsTask as jest.MockedFunction<
  typeof beadsAdapter.fetchBeadsTask
>;
const mockLoadSpecContent =
  contextLoader.loadSpecContent as jest.MockedFunction<
    typeof contextLoader.loadSpecContent
  >;

function makeContext(overrides: Partial<RuntimeContext> = {}): RuntimeContext {
  return {
    repoRoot: '/repo',
    config: {} as AgentConfig,
    memorySegments: [],
    pendingMulchLessons: [],
    conversation: [],
    compressionSummaries: [],
    ...overrides,
  };
}

describe('beadsPlugin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env['BD_TASK_ID'];
  });

  describe('name', () => {
    it('has the correct plugin name', () => {
      expect(beadsPlugin.name).toBe('agent-plugin-beads');
    });
  });

  describe('onTaskStart', () => {
    it('does nothing when no taskId is available', async () => {
      const context = makeContext();
      await beadsPlugin.onTaskStart!(context);

      expect(mockFetchBeadsTask).not.toHaveBeenCalled();
      expect(context.memorySegments).toHaveLength(0);
    });

    it('uses context.activeTask.id when set', async () => {
      mockFetchBeadsTask.mockResolvedValue({
        id: 'task-1',
        title: 'My Task',
        status: 'in_progress',
      });
      mockLoadSpecContent.mockResolvedValue(null);

      const context = makeContext({
        activeTask: { id: 'task-1', title: '', status: 'in_progress' },
      });
      await beadsPlugin.onTaskStart!(context);

      expect(mockFetchBeadsTask).toHaveBeenCalledWith('task-1', '/repo');
    });

    it('falls back to BD_TASK_ID env var when activeTask is not set', async () => {
      process.env['BD_TASK_ID'] = 'env-task-42';
      mockFetchBeadsTask.mockResolvedValue({
        id: 'env-task-42',
        title: 'Env Task',
        status: 'todo',
      });
      mockLoadSpecContent.mockResolvedValue(null);

      const context = makeContext();
      await beadsPlugin.onTaskStart!(context);

      expect(mockFetchBeadsTask).toHaveBeenCalledWith('env-task-42', '/repo');
    });

    it('sets context.activeTask to the fetched BeadsTask', async () => {
      const fetchedTask = {
        id: 'task-2',
        title: 'Test Task',
        status: 'review' as const,
        description: 'A description',
        assignee: 'bob',
        dependencies: ['task-0'],
      };
      mockFetchBeadsTask.mockResolvedValue(fetchedTask);
      mockLoadSpecContent.mockResolvedValue(null);

      const context = makeContext({
        activeTask: { id: 'task-2', title: '', status: 'todo' },
      });
      await beadsPlugin.onTaskStart!(context);

      expect(context.activeTask).toEqual(fetchedTask);
    });

    it('pushes a task metadata memory segment', async () => {
      mockFetchBeadsTask.mockResolvedValue({
        id: 'task-3',
        title: 'Feature Work',
        status: 'in_progress',
        description: 'Build the feature',
        assignee: 'carol',
        dependencies: ['task-1', 'task-2'],
      });
      mockLoadSpecContent.mockResolvedValue(null);

      const context = makeContext({
        activeTask: { id: 'task-3', title: '', status: 'todo' },
      });
      await beadsPlugin.onTaskStart!(context);

      expect(context.memorySegments).toHaveLength(1);
      expect(context.memorySegments[0].type).toBe('instruction');
      const segment = context.memorySegments[0].content;
      expect(segment).toContain('## Active Beads Task');
      expect(segment).toContain('**ID**: task-3');
      expect(segment).toContain('**Title**: Feature Work');
      expect(segment).toContain('**Status**: in_progress');
      expect(segment).toContain('**Description**: Build the feature');
      expect(segment).toContain('**Assignee**: carol');
      expect(segment).toContain('**Depends on**: task-1, task-2');
    });

    it('omits optional fields from the segment when not present', async () => {
      mockFetchBeadsTask.mockResolvedValue({
        id: 'task-min',
        title: 'Minimal',
        status: 'todo',
      });
      mockLoadSpecContent.mockResolvedValue(null);

      const context = makeContext({
        activeTask: { id: 'task-min', title: '', status: 'todo' },
      });
      await beadsPlugin.onTaskStart!(context);

      const segment = context.memorySegments[0].content;
      expect(segment).not.toContain('**Description**');
      expect(segment).not.toContain('**Assignee**');
      expect(segment).not.toContain('**Depends on**');
    });

    it('pushes a spec segment when task has a specPath with readable content', async () => {
      mockFetchBeadsTask.mockResolvedValue({
        id: 'task-4',
        title: 'Spec Task',
        status: 'todo',
        specPath: 'docs/specs/task-4.md',
      });
      mockLoadSpecContent.mockResolvedValue('# Task 4 Spec\n\nDo the thing.');

      const context = makeContext({
        activeTask: { id: 'task-4', title: '', status: 'todo' },
      });
      await beadsPlugin.onTaskStart!(context);

      expect(mockLoadSpecContent).toHaveBeenCalledWith(
        'docs/specs/task-4.md',
        '/repo',
      );
      expect(context.memorySegments).toHaveLength(2);
      expect(context.memorySegments[1].type).toBe('context');
      const specSegment = context.memorySegments[1].content;
      expect(specSegment).toContain(
        '## Task Specification (docs/specs/task-4.md)',
      );
      expect(specSegment).toContain('# Task 4 Spec');
    });

    it('does not push a spec segment when specPath is undefined', async () => {
      mockFetchBeadsTask.mockResolvedValue({
        id: 'task-5',
        title: 'No Spec',
        status: 'todo',
      });
      mockLoadSpecContent.mockResolvedValue(null);

      const context = makeContext({
        activeTask: { id: 'task-5', title: '', status: 'todo' },
      });
      await beadsPlugin.onTaskStart!(context);

      expect(mockLoadSpecContent).not.toHaveBeenCalled();
      expect(context.memorySegments).toHaveLength(1);
    });

    it('does not push a spec segment when spec file is unreadable (returns null)', async () => {
      mockFetchBeadsTask.mockResolvedValue({
        id: 'task-6',
        title: 'Missing Spec',
        status: 'todo',
        specPath: 'docs/missing.md',
      });
      mockLoadSpecContent.mockResolvedValue(null);

      const context = makeContext({
        activeTask: { id: 'task-6', title: '', status: 'todo' },
      });
      await beadsPlugin.onTaskStart!(context);

      expect(context.memorySegments).toHaveLength(1);
    });
  });
});

import type { AgentContext, MulchLesson } from '@conscius/agent-types';
import { mulchPlugin } from '../hooks.js';
import { queryMulch } from '../mulchAdapter.js';
import { writeMulchLesson } from '../lessonWriter.js';

jest.mock('../mulchAdapter.js', () => ({
  queryMulch: jest.fn(),
}));
jest.mock('../lessonWriter.js', () => ({
  writeMulchLesson: jest.fn(),
}));

const mockQueryMulch = queryMulch as jest.MockedFunction<typeof queryMulch>;
const mockWriteMulchLesson = writeMulchLesson as jest.MockedFunction<
  typeof writeMulchLesson
>;

function createContext(overrides: Partial<AgentContext> = {}): AgentContext {
  return {
    repoRoot: '/repo',
    config: {},
    promptSegments: [],
    conversation: [],
    compressionSummaries: [],
    ...overrides,
  };
}

describe('mulchPlugin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns early when activeTask is absent', async () => {
    const context = createContext();

    await mulchPlugin.onSessionStart?.(context);

    expect(mockQueryMulch).not.toHaveBeenCalled();
    expect(context.promptSegments).toEqual([]);
  });

  it('uses the active task description as the topic hint and injects lessons', async () => {
    const lessons: MulchLesson[] = [
      {
        id: 'lesson-1',
        topic: 'jest mocking',
        summary: 'util.promisify loses its custom symbol under Jest',
        recommendation: 'Use a manual Promise wrapper around execFile',
        created: '2026-03-15',
      },
      {
        id: 'lesson-2',
        topic: 'typescript configuration',
        summary: 'tsconfig.spec.json needs customConditions: null',
        recommendation: 'Set customConditions to null in Jest tsconfig',
        created: '2026-03-16',
      },
    ];

    mockQueryMulch.mockResolvedValue(lessons);

    const context = createContext({
      activeTask: {
        id: 'coreai-x3b.3',
        title: 'Implement hooks',
        status: 'in_progress',
        description: 'Jest mocking and TypeScript configuration',
      },
    });

    await mulchPlugin.onSessionStart?.(context);

    expect(mockQueryMulch).toHaveBeenCalledWith(
      'Jest mocking and TypeScript configuration',
      '/repo',
    );
    expect(context.promptSegments).toEqual([
      [
        '## Experience Lessons',
        '',
        '### util.promisify loses its custom symbol under Jest',
        '**Topic**: jest mocking',
        '**Recommendation**: Use a manual Promise wrapper around execFile',
        '**Created**: 2026-03-15',
        '',
        '### tsconfig.spec.json needs customConditions: null',
        '**Topic**: typescript configuration',
        '**Recommendation**: Set customConditions to null in Jest tsconfig',
        '**Created**: 2026-03-16',
      ].join('\n'),
    ]);
  });

  it('falls back to the active task title when description is absent', async () => {
    mockQueryMulch.mockResolvedValue([
      {
        id: 'lesson-1',
        topic: 'mulch hooks',
        summary: 'Hook startup should be quiet when there are no lessons',
        recommendation: 'Return early without mutating promptSegments',
        created: '2026-03-15',
      },
    ]);

    const context = createContext({
      activeTask: {
        id: 'coreai-x3b.3',
        title: 'Mulch hooks startup behavior',
        status: 'todo',
      },
    });

    await mulchPlugin.onSessionStart?.(context);

    expect(mockQueryMulch).toHaveBeenCalledWith(
      'Mulch hooks startup behavior',
      '/repo',
    );
    expect(context.promptSegments).toHaveLength(1);
  });

  it('returns silently when there is no active task topic hint', async () => {
    const context = createContext({
      activeTask: {
        id: 'coreai-x3b.3',
        title: '   ',
        status: 'todo',
      },
    });

    await mulchPlugin.onSessionStart?.(context);

    expect(mockQueryMulch).not.toHaveBeenCalled();
    expect(context.promptSegments).toEqual([]);
  });

  it('returns silently when no lessons are found', async () => {
    mockQueryMulch.mockResolvedValue([]);

    const context = createContext({
      activeTask: {
        id: 'coreai-x3b.3',
        title: 'Jest configuration',
        status: 'review',
      },
    });

    await mulchPlugin.onSessionStart?.(context);

    expect(mockQueryMulch).toHaveBeenCalledWith('Jest configuration', '/repo');
    expect(context.promptSegments).toEqual([]);
  });

  it('returns silently when there are no pending lessons at session end', async () => {
    const context = createContext();

    await mulchPlugin.onSessionEnd?.(context);

    expect(mockWriteMulchLesson).not.toHaveBeenCalled();
  });

  it('persists each explicitly supplied pending lesson at session end', async () => {
    const lessons: MulchLesson[] = [
      {
        id: 'lesson-1',
        topic: 'typescript',
        summary: 'Jest tsconfig needs customConditions set to null',
        recommendation: 'Override customConditions in tsconfig.spec.json',
        created: '2026-03-17T00:00:00.000Z',
      },
      {
        id: 'lesson-2',
        topic: 'mulch',
        summary: 'Explicit lessons should be supplied via AgentContext',
        recommendation: 'Populate pendingMulchLessons before onSessionEnd',
        created: '2026-03-17T00:05:00.000Z',
      },
    ];

    const context = createContext({
      pendingMulchLessons: lessons,
    });

    await mulchPlugin.onSessionEnd?.(context);

    expect(mockWriteMulchLesson).toHaveBeenNthCalledWith(
      1,
      lessons[0],
      '/repo',
    );
    expect(mockWriteMulchLesson).toHaveBeenNthCalledWith(
      2,
      lessons[1],
      '/repo',
    );
  });
});

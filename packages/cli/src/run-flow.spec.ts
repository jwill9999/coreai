import { DEFAULT_AGENT_CONFIG } from '@conscius/runtime';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runFullCycleAndBuildPrompt } from './run-flow.js';

function writeMinimalAgentConfig(repoRoot: string): void {
  const agentDir = join(repoRoot, '.agent');
  mkdirSync(agentDir, { recursive: true });
  writeFileSync(
    join(agentDir, 'config.json'),
    JSON.stringify(DEFAULT_AGENT_CONFIG, null, 2) + '\n',
    'utf8',
  );
}

describe('runFullCycleAndBuildPrompt', () => {
  it('prints user input in the recent conversation section of the prompt', async () => {
    const repoRoot = mkdtempSync(join(tmpdir(), 'conscius-run-'));
    writeMinimalAgentConfig(repoRoot);

    const { prompt, built } = await runFullCycleAndBuildPrompt({
      repoRoot,
      input: 'hello from test',
    });

    expect(prompt).toContain('## Recent Conversation');
    expect(prompt).toContain('hello from test');
    expect(prompt).toContain('**user:**');
    expect(built.messageCount).toBe(1);
  });

  it('returns an empty prompt when input is empty and no plugins add segments', async () => {
    const repoRoot = mkdtempSync(join(tmpdir(), 'conscius-run-'));
    writeMinimalAgentConfig(repoRoot);

    const { prompt, built } = await runFullCycleAndBuildPrompt({
      repoRoot,
      input: '',
    });

    expect(prompt).toBe('');
    expect(built.messageCount).toBe(0);
  });
});

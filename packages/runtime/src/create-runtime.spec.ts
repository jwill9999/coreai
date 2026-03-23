import { DEFAULT_AGENT_CONFIG } from './hook-runner.js';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRuntime } from './create-runtime.js';

function writeMinimalAgentConfig(repoRoot: string): void {
  const agentDir = join(repoRoot, '.agent');
  mkdirSync(agentDir, { recursive: true });
  writeFileSync(
    join(agentDir, 'config.json'),
    JSON.stringify(DEFAULT_AGENT_CONFIG, null, 2) + '\n',
    'utf8',
  );
}

describe('createRuntime().run', () => {
  it('returns the final prompt string for one user turn', async () => {
    const repoRoot = mkdtempSync(join(tmpdir(), 'conscius-run-'));
    writeMinimalAgentConfig(repoRoot);

    const runtime = createRuntime();
    const prompt = await runtime.run('hello from runtime.run', repoRoot);

    expect(prompt).toContain('## Recent Conversation');
    expect(prompt).toContain('hello from runtime.run');
    expect(prompt).toContain('**user:**');
  });

  it('returns empty string when input is empty and no plugins add segments', async () => {
    const repoRoot = mkdtempSync(join(tmpdir(), 'conscius-run-'));
    writeMinimalAgentConfig(repoRoot);

    const runtime = createRuntime();
    const prompt = await runtime.run('', repoRoot);

    expect(prompt).toBe('');
  });
});

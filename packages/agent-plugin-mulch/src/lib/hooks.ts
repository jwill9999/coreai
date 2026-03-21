import { access } from 'node:fs/promises';
import { join } from 'node:path';
import type { RuntimeContext } from '@conscius/runtime';
import { definePlugin } from '@conscius/runtime';
import {
  assertMlRunnable,
  queryMulch,
  resolveMlExecutable,
  runMlInit,
} from './mulchAdapter.js';

/**
 * Three-step setup guard:
 * 1. Is `ml` on PATH?
 * 2. Can `ml` execute (is Bun present)?
 * 3. Is `.mulch/` initialised? If not, run `ml init`.
 */
export async function ensureMlReady(repoRoot: string): Promise<void> {
  const mlPath = await resolveMlExecutable();
  await assertMlRunnable(mlPath);

  // Check for mulch.config.yaml — the file ml init creates.
  // A bare .mulch/ directory without this config causes ml prime to fail.
  const mulchConfig = join(repoRoot, '.mulch', 'mulch.config.yaml');

  try {
    await access(mulchConfig);
  } catch {
    await runMlInit(mlPath, repoRoot);
  }
}

/**
 * `agent-plugin-mulch` — injects experience lessons from `ml prime`
 * into structured memory when a session starts.
 */
const mulchPlugin = definePlugin({
  name: 'agent-plugin-mulch',

  async onSessionStart(context: RuntimeContext): Promise<void> {
    await ensureMlReady(context.repoRoot);

    const output = await queryMulch(context.repoRoot);

    if (!output) {
      return;
    }

    context.memorySegments.push({
      type: 'experience',
      content: output,
    });
  },
});

export { mulchPlugin };
export default mulchPlugin;

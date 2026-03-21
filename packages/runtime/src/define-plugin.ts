import type { Plugin } from './public-types.js';

const ALLOWED_HOOKS = [
  'onSessionStart',
  'onTaskStart',
  'onMemoryCompose',
  'onSessionEnd',
] as const;

type AllowedHook = (typeof ALLOWED_HOOKS)[number];

function isAllowedHook(key: string): key is AllowedHook {
  return (ALLOWED_HOOKS as readonly string[]).includes(key);
}

/**
 * Validates and normalises a plugin definition. Unknown hook keys and
 * non-function hook values are rejected.
 */
export function definePlugin(raw: unknown): Plugin {
  if (raw === null || typeof raw !== 'object') {
    throw new Error('definePlugin: expected a plugin object');
  }

  const obj = raw as Record<string, unknown>;
  const name = obj['name'];

  if (typeof name !== 'string' || name.trim().length === 0) {
    throw new Error('definePlugin: "name" must be a non-empty string');
  }

  for (const key of Object.keys(obj)) {
    if (key === 'name') continue;
    if (!isAllowedHook(key)) {
      throw new Error(`definePlugin: unknown hook or property "${key}"`);
    }
    const fn = obj[key];
    if (fn !== undefined && typeof fn !== 'function') {
      throw new Error(`definePlugin: hook "${key}" must be a function`);
    }
  }

  const plugin: Plugin = { name: name.trim() };

  for (const h of ALLOWED_HOOKS) {
    const fn = obj[h];
    if (typeof fn === 'function') {
      plugin[h] = fn as Plugin[typeof h];
    }
  }

  return plugin;
}

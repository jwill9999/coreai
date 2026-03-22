# Adding a plugin

This guide walks through scaffolding a new Conscius plugin package and wiring it into `@conscius/runtime`.

## Prerequisites

- Working monorepo install (see [Getting started](./getting-started.md))
- [Runtime v3 spec](../specs/runtime-v3.md) — hooks and `memorySegments`

## 1. Scaffold the package

Use the Nx generator to create a new publishable library:

```bash
npx nx g @nx/js:lib packages/agent-plugin-<name> \
  --publishable \
  --importPath=@conscius/agent-plugin-<name>
```

Replace `<name>` with your plugin's short identifier (e.g. `mulch`, `session`, `guardrails`).

## 2. Add the `@conscius/runtime` dependency

In `packages/agent-plugin-<name>/package.json`, add:

```json
{
  "dependencies": {
    "@conscius/runtime": "*"
  }
}
```

Set `tsconfig.lib.json` `references` to `../runtime/tsconfig.lib.json`. Run `npm install` from the repo root.

## 3. Apply project config

Copy the Jest and ESLint config pattern from an existing plugin (e.g. `agent-plugin-beads`):

- `jest.config.cts` — set `displayName` to `@conscius/agent-plugin-<name>`
- `.eslintrc.json` — extend `../../.eslintrc.js`
- `tsconfig.spec.json` — set `"customConditions": null`

## 4. Implement the plugin

Use **`definePlugin`** and v3 hooks. Add segments via **`context.memorySegments`** only.

```typescript
import type { RuntimeContext } from '@conscius/runtime';
import { definePlugin } from '@conscius/runtime';

const myPlugin = definePlugin({
  name: '@conscius/agent-plugin-<name>',

  async onSessionStart(context: RuntimeContext): Promise<void> {
    context.memorySegments.push({
      type: 'context',
      content: '## My section\n\n…',
    });
  },
});

export { myPlugin };
export default myPlugin;
```

Allowed hooks: `onSessionStart`, `onTaskStart`, `onMemoryCompose`, `onSessionEnd`.

## 5. Register with the runtime

List the package name in `.agent/config.json` `plugins` array, or pass plugin instances to **`createRuntime({ plugins: [...] })`** from application code.

## 6. Verify

```bash
npx nx run-many -t typecheck,lint,test --projects=@conscius/agent-plugin-<name>
```

## Related

- [Runtime v3 spec](../specs/runtime-v3.md)
- [`@conscius/runtime` API reference](../api/runtime.md)

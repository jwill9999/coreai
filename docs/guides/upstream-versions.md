# Upstream tooling — Mulch and Beads

Conscius adapters talk to **external CLIs** (`ml` / `mulch` from `@os-eco/mulch-cli`, and `bd` from [Beads](https://github.com/steveyegge/beads) — see also [bead-tools/beads](https://github.com/bead-tools/beads)). This document records **how we version them**, what **CI guarantees**, and how to **bump safely** when upstream releases breaking changes.

---

## `@os-eco/mulch-cli` (Mulch)

### Policy

- **package.json** declares a **caret range** — currently **`^0.6.3`** — so npm may install **patch and minor** updates within the 0.6 line, but **not** a hypothetical `1.0.0` without explicitly widening the range.
- **`package-lock.json`** is the **authoritative resolved version** for reproducible installs. **Commit lockfile changes** whenever you change Mulch-related dependencies.
- **CI** runs **`npm ci`**, which installs **exactly** what the lockfile specifies — that is the **gate** for published Mulch CLI behavior in this repo.

### Validated version (maintainer testing)

The lockfile currently resolves **`@os-eco/mulch-cli@0.6.3`**. The **mulch interactive smoke test** (`npm run test:mulch-record-interactive`) runs after unit tests in CI and exercises real `ml` / script wiring (dry-run paths).

### How to bump Mulch

1. Update **`^0.6.x`** in `packages/agent-plugin-mulch/package.json` if you need a new **minor** line (e.g. `^0.7.0`).
2. Run **`npm install`** at the repo root and commit **`package-lock.json`**.
3. Run **`npx nx run-many -t typecheck,lint,test --projects=@conscius/agent-plugin-mulch`** and **`npm run test:mulch-record-interactive`** (Bun + `ml` on PATH locally).
4. Adjust adapter code and tests if flags or output changed; note the bump in **`CHANGELOG.md`**.

---

## `bd` (Beads)

### Policy

Beads is **not** an npm dependency of this monorepo. Developers install **`bd`** separately (see [`.beads/README.md`](../../.beads/README.md)).

### Recommended version (maintainer testing)

**`bd` version `0.59.0`** is what we use for local issue tracking and is the baseline for **“works with this repo”** documentation. Newer **`bd`** releases may work; if Beads changes JSON shape or CLI flags that **`agent-plugin-beads`** relies on, update the plugin and this section.

### CI note

**`@conscius/agent-plugin-beads` unit tests mock `execFile`** — they do **not** invoke a real `bd` binary on CI. A breaking **`bd` release** may not fail CI until:

- someone runs tests with a real `bd`, or
- you add an optional integration/smoke job.

Treat **manual checks** (or future integration tests) as part of bumping supported **`bd`** semantics.

### How to adopt a new `bd` major/minor

1. Install the new **`bd`** locally; run **`bd doctor`** if Beads suggests it.
2. Run **`npx nx test @conscius/agent-plugin-beads`** and exercise **`bd show --json`** shapes against [beadsAdapter expectations](../../packages/agent-plugin-beads/src/lib/beadsAdapter.ts).
3. Update **this file** and **`packages/agent-plugin-beads/README.md`** with the new recommended version when verified.

---

## Summary

| Tool         | Declared in repo             | CI gate                           |
| ------------ | ---------------------------- | --------------------------------- |
| Mulch (`ml`) | `^0.6.3` + **lockfile**      | `npm ci` + Nx tests + mulch smoke |
| Beads (`bd`) | Docs only; install via Beads | Mocked unit tests; manual `bd`    |

# Backlog

Items not yet promoted to an active epic. Managed by the `planning` skill — use `/new-backlog` and `/move-to-feature` to maintain this list in sync with the Beads task graph (`bd` CLI).

---

### Pin workspace deps pre-publish (`pin-workspace-deps`)

**Planning ID:** backlog-2026-03-10-001
**Beads ID:** coreai-p9g
**Status:** open (chore)
**Created:** 10/03/2026 (GMT)
**Priority:** medium
**Effort:** small
**Description:** Replace `"@conscius/runtime": "*"` wildcard in `cli` and plugin `package.json` files with a pinned concrete version (e.g. `"^0.5.0-alpha.0"`) before the first `npm publish`. The wildcard resolves correctly inside the npm workspace but is unsafe for public consumers.
**Dependencies:** Must be done before any `npm publish` run
**Related Docs:** [Publishing guide](../guides/publishing.md)

---

### Epic 5 — agent-plugin-session

**Planning ID:** backlog-2026-03-10-002
**Beads ID:** coreai-vq3
**Status:** not started
**Created:** 10/03/2026 (GMT)
**Priority:** high
**Effort:** medium
**Description:** Plugin that reads and writes `SESSION.md` — automates the session handoff document that is currently maintained manually.
**Related Docs:** [Session continuity spec](../specs/archive/session_continuity_layer_spec_v2.md)

---

### Epic 6 — agent-plugin-compression (pre-v3 — frozen)

**Planning ID:** backlog-2026-03-10-003
**Beads ID:** coreai-mbp
**Status:** closed in Beads — **do not implement as written** (pre-v3 plugin-on-`agent-core` design)
**Created:** 10/03/2026 (GMT)
**Superseded by:** [Epic 11 — Runtime MVP Hardening](./index.md) (`coreai-2f5`) task MVP-1 for **runtime-level** compression basics
**Related Docs:** [E6 brief](../specs/e6-agent-plugin-compression.md) (historical), [Runtime v3](../specs/runtime-v3.md)

---

### Epic 7 — agent-plugin-guardrails (pre-v3 — frozen)

**Planning ID:** backlog-2026-03-10-004
**Beads ID:** coreai-7mm
**Status:** closed in Beads — **do not implement as written** (pre-v3 plugin-on-`agent-core` design)
**Created:** 10/03/2026 (GMT)
**Superseded by:** Epic 11 (`coreai-2f5`) task MVP-2 for **runtime-level** guardrails basics
**Related Docs:** [E7 brief](../specs/e7-agent-plugin-guardrails.md) (historical), [Runtime v3](../specs/runtime-v3.md)

---

### Epic 8 — agent-stack-standard (pre-v3 — frozen)

**Planning ID:** backlog-2026-03-10-005
**Beads ID:** coreai-zsh
**Status:** closed in Beads — **do not implement as written** (bundled `agent-core` stack)
**Created:** 10/03/2026 (GMT)
**Note:** A future v3 “stack” or meta-package may be replanned after MVP hardening.
**Related Docs:** [E8 brief](../specs/e8-agent-stack-standard.md) (historical)

---

### Epic 9 — skillshare

**Planning ID:** backlog-2026-03-10-006
**Beads ID:** coreai-yfl
**Status:** not started
**Created:** 10/03/2026 (GMT)
**Priority:** low
**Effort:** small
**Description:** Standalone `skillshare` package and CLI for syncing reusable skills/instructions from manifests across repositories.

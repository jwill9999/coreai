# MVP SCOPE (FULL)

## MUST INCLUDE

- Runtime loop
- Plugin lifecycle hooks
- memorySegments pipeline
- Deterministic ordering:
  - priority DESC
  - type ordering:
    system > instruction > context > experience

- Basic compression:
  - remove duplicates
  - trim low priority segments

- Basic guardrails:
  - simple injection detection
  - segment filtering

- promptChunks adapter

---

## ACCEPTANCE CRITERIA

- Runtime builds
- Plugins work
- Ordering deterministic
- No direct prompt mutation
- Adapter functional

---

## MUST NOT INCLUDE

- MCP
- Multi-agent orchestration
- Advanced compression
- External orchestration layers

# Reynard Assistant

The assistant streams typed chunks, routes tool calls with validation, and
integrates with Ollama for chat and embeddings.

## Streaming Types

`app/types/streaming.py` defines chunk models:

- `start`, `thinking`, `response`, `content` (legacy), `tool_execution`,
  `tool_result`, `complete`, `error` Helper creators build dicts for SSE
  payloads. The chat API forwards chunk dictionaries directly to SSE.

## Tooling Layer

Tools extend `BaseTool` and define typed `parameters` with validation rules
(types, ranges, choices, patterns). `ToolRegistry` manages registration,
listing, and execution with permission checks (`guest`/`user`/`admin`).
Parameter handling includes:

- Drop unknown keys before validation
- Apply defaults for optional parameters
- Re-validate post-defaults and return structured validation errors when invalid
- Redact sensitive values (paths, tokens) in logs

- Files:
  - `app/tools/base.py`
  - `app/tools/registry.py`

## Ollama Integration

`app/api/ollama.py` exposes chat and admin endpoints. `POST /api/ollama/chat`
streams an SSE response. It injects `user_id` and `user_role` into context for
permission-aware tools and emits a `tool_execution` chunk when raw inline
tool_call blocks are detected in upstream content. Other endpoints expose
models, pull progress, assistant models/tools, and health.

## Tests

End-to-end tests exercise tool selection, streaming shape, and error mapping
under `app/tests/integration/`.

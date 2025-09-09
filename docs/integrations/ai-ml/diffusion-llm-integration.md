# Diffusion LLM Integration (DreamOn, LLaDA)

This document describes how diffusion-based language models are integrated into YipYap for text generation and infilling, providing real-time streaming, robust model management, and a polished user experience.

## Architecture and Services

The backend exposes a dedicated API namespace under `/api/diffusion`. The `DiffusionLLMService` is registered with the `ServiceManager` when `diffusion_llm_enabled` is set to true in the app configuration. The service can operate in embedded mode using an internal `DiffusionModelManager`, or in proxy mode (planned for the future). The manager maintains model instances, supports device selection and safe unloading, and automatically falls back to CPU if an out-of-memory condition occurs.

```mermaid
flowchart LR
    A[UI Panels\n- TextGeneratorPanel\n- TextInfillerPanel] --> B[useDiffusionLLM]
    B -->|typed requests| C[/api/diffusion/*]
    C --> D[DiffusionLLMService]
    D --> E[DiffusionModelManager]
    E --> F[DreamOn / LLaDA Models]
    D --> G[(Metrics DB)]
```

## API Endpoints and Contracts

**Model Management:**

- `GET /api/diffusion/models`  
  Lists available models with metadata and loaded state.

- `POST /api/diffusion/models/{id}/load`  
  Loads or switches the active model. Accepts an optional `device` parameter (`auto`, `cuda`, `cpu`).

- `GET /api/diffusion/models/current`  
  Returns information about the currently loaded model.

**Text Generation:**

- `POST /api/diffusion/generate`  
  Produces a complete response with `text`, `history`, `generation_time`, and `model_used`.

- `POST /api/diffusion/generate/stream`  
  Streams Server-Sent Events (SSE) describing status, step updates, completion, and errors.

**Text Infilling:**

- `POST /api/diffusion/infill`  
  Produces a complete response for prefix/suffix infilling.

- `POST /api/diffusion/infill/stream`  
  Streams SSE in the same format as generation.

## Server-Sent Events Schema

Example SSE frame sequence:

```text
data: {"type":"status","message":"Starting text generation..."}
data: {"type":"step","step":1,"text":"Once upon"}
data: {"type":"step","step":2,"text":" a time"}
data: {"type":"complete","text":"Once upon a time","generation_time":0.02,"model_used":"llada"}
```

Events are formatted as JSON frames in `data:` lines.

- **Status frames** indicate startup state.
- **Step frames** carry incremental text.
- **Complete frames** contain the final text, `model_used`, and `generation_time`.
- **Error frames** contain `error_type`, `message`, and `retryable`.

## Error Handling and Redaction

Errors are mapped to structured categories: `validation`, `network`, `timeout`, `model_loading`, `model_unavailable`, and `generation`. Sensitive inputs such as `prompt`, `prefix`, and `suffix` are redacted in logs and error payloads. HTTP 429 is returned when per-client rate limits are exceeded on streaming endpoints.

## Observability and Limits

### Structured Logging

The diffusion LLM integration uses structured logging with correlation IDs for comprehensive observability:

- **Correlation IDs**: All requests receive a unique correlation ID that is propagated through the entire request lifecycle
- **Structured JSON logs**: Logs are formatted as JSON with consistent fields including timestamp, level, correlation ID, and structured data
- **Enhanced redaction**: Sensitive fields (prompt, prefix, suffix) are automatically redacted in logs, with additional redaction for debug-level logs
- **Context propagation**: Correlation IDs are maintained across async operations using context variables

### Log Files

- `logs/structured.log` - Contains structured JSON logs for diffusion LLM operations
- `logs/backend.log` - Contains traditional formatted logs including diffusion LLM entries

### Correlation ID Usage

Streaming routes attach an `X-Correlation-ID` header. The start and end of streams are logged with the correlation ID and duration. Stream durations are recorded in the metrics database. Per-client rate limiting is enabled for streaming endpoints to protect the server under load.

## Model Management and Downloads

DreamOn and LLaDA are registered in the unified model download registry. The system honors HuggingFace cache configuration when downloading model weights. The Model Management settings view displays overall download and cache status and provides quick access to downloads.

## Frontend Composition and Panels

Typed types are provided in `src/types/diffusionLLM.ts`. A Solid composable in `src/composables/useDiffusionLLM.ts` implements model listing, model loading (with device preference), and streaming for generation and infilling. Panels for model selection, generation, and infilling are implemented in `src/components/LLM` and are integrated into the functionality system via `TextLLMFunctionality`.

## Settings and Persistence

Additional cleanup flags are supported end-to-end:

- `auto_trim`: Trim whitespace in streamed text on server (and optionally client)
- `fix_punctuation`: Normalize basic punctuation spacing on server (and optionally client)

These are toggled in Settings and persisted via `localStorage`.

User-facing settings allow configuration of default `max_new_tokens`, request timeout, and preferred device. These settings are persisted in `localStorage` and read on startup via the app context. The composable and panels respect these defaults when calling the API.

## Troubleshooting

- If text appears with odd spacing, ensure `Fix punctuation` is enabled in Settings, or send `fix_punctuation: true`.
- If trailing whitespace appears, enable `Auto-trim`.

If streaming returns no events, verify that the service is enabled and that a model is loaded. If a 429 rate limit is returned, reduce request frequency or wait a few seconds. If model loading fails due to memory constraints, switch the device to CPU or close other GPU workloads. Confirm that HuggingFace cache variables (`HF_HOME`, `HF_CACHE`) are correctly configured when using embedded mode.

# Comfy Integration

Backend and frontend integration with ComfyUI for queueing workflows, inspecting status, streaming progress, and ingesting generated images into the gallery.

## Configuration

Enable the integration with `AppConfig` fields. The core fields are `comfy_enabled`, `comfy_api_url`, `comfy_timeout`, and `comfy_image_dir`. When enabled, the service creates the image directory if necessary and wires a thin client to the ComfyUI server using the configured base URL and timeout. Defaults are conservative; if `comfy_api_url` is absent, the client uses `http://127.0.0.1:8188`.

Environment variable overrides are supported. Use `COMFY_ENABLED`, `COMFY_API_URL`, `COMFY_TIMEOUT`, and `COMFY_IMAGE_DIR` for the core settings. Watchdog and reconnection tunables can be set via `COMFY_HEALTH_INTERVAL_S`, `COMFY_RECONNECT_MAX_ATTEMPTS`, `COMFY_RECONNECT_BASE_DELAY_S`, and `COMFY_RECONNECT_MAX_DELAY_S`.

Files:

- `app/services/core/app_config.py`
- `app/services/core/config_manager_service.py`

## Backend Service

The `ComfyService` is lifecycle managed, depends on the config manager, and is feature‑flagged. During initialization it reads configuration, prepares `comfy_image_dir` when enabled, then attempts to import and wire `workflowbuilder.utils.comfy_api.ComfyApi`. If the optional workflowbuilder dependency is not present, the service continues to run so health and discovery endpoints still work; client‑dependent operations will error when invoked.

The public surface includes queueing a workflow to obtain a `{ prompt_id, client_id? }`, checking generation status for a prompt, fetching image bytes by filename/subfolder/type, retrieving history when the client supports it, fetching the Comfy object graph with an internal TTL cache, and streaming status updates. Streaming prefers a websocket provided by the client; on failure it falls back to polling with a small delay and emits structured events including `status`, `warning`, `error`, and `images` when available.

Files:

- `app/services/integration/comfy_service.py`

## Health and Watchdog Tunables

The integration participates in the service watchdog. The probe interval is controlled by `comfy_health_interval_s` or `COMFY_HEALTH_INTERVAL_S` and defaults to 60 seconds. Reconnection/backoff knobs include `comfy_reconnect_max_attempts`, `comfy_reconnect_base_delay_s`, and `comfy_reconnect_max_delay_s`, with corresponding environment variables. Defaults are five attempts, a 0.5 second base delay, and a 30 second cap. The streamer attempts websocket first and degrades to polling if the client raises errors.

## API Endpoints

The API is mounted at `/api/comfy` and is protected by `get_current_active_user`.

The health endpoint returns an `ok` status and whether the feature flag is enabled. When enabled, it also includes service info such as the configured base URL, timeout, and whether a client is wired. The queue endpoint accepts a JSON object with a `workflow` graph and an optional `client_id` and returns a JSON object containing `prompt_id` and `client_id`. The status endpoint returns the current generation status for a given prompt id and may include progress and images depending on the Comfy server. The history endpoint returns a sanitized structure with `prompt_id`, `status`, `progress`, `images`, and `items` when supported by the client. The object graph endpoint returns Comfy `object_info` and respects a `refresh=1` query parameter to bypass the internal TTL cache.

The view endpoint fetches image bytes by `filename`, optional `subfolder`, and optional `type` (default `output`). The handler rejects path traversal, applies a light per‑user rate limit, and returns image content as PNG by default. The text‑to‑image endpoint builds a workflow using the workflowbuilder adapter when available and otherwise uses a minimal fallback; it validates inputs and requires a nonempty caption. The ingest endpoint accepts a multipart upload with a file and form fields for `prompt_id`, `workflow` (JSON string), and `metadata` (JSON string). The endpoint writes to `ROOT_DIR/generated/comfy/YYYY-MM-DD/`, deduplicates by content hash, and creates a sidecar JSON containing provenance and any provided metadata. The stream endpoint exposes Server‑Sent Events that carry status updates, warnings, errors, and image notifications for the provided prompt id.

Files:

- `app/api/comfy.py`

## Frontend Composable

The `useComfy` composable encapsulates authenticated calls to the endpoints and integrates with the global notification system. Queueing and text‑to‑image operations use exponential backoff with user notifications on retries. The `subscribeToStatus` helper opens an `EventSource` to the stream endpoint and dispatches progress updates and completion notifications; it supports `(promptId, onEvent, onComplete)` and `(promptId, onComplete)` calling forms. The image fetcher constructs a URL for the view endpoint and applies the same retry and notification strategy. The ingest helper posts multipart form data to persist a selected result back into the gallery with provenance captured in a JSON sidecar. A `getComfyInfo` helper fetches Comfy `object_info` with an optional refresh toggle.

Files:

- `src/composables/useComfy.ts`
- `src/types/comfy.ts`

## Request Validation and Types

The text‑to‑image request validates width and height between 64 and 4096, steps between 1 and 150, CFG between 0.1 and 20.0, and a nonnegative seed. Optional fields include `checkpoint`, multiple `loras` with `lora_weights`, and advanced switches like `pag`, `deepshrink`, `detail_daemon`, and `split_sigmas`. Frontend types mirror the backend: `ComfyQueueResponse`, `ComfyText2ImgResponse`, `ComfyStatus` (open‑shaped with optional `images`), `ComfyObjectInfo`, and `Text2ImgParams`.

Files:

- `src/types/comfy.ts`

## Object Graph Caching

The `object-info` endpoint is backed by a simple TTL cache inside the service. Requests without `refresh` reuse cached data when it is recent; requests with `refresh=1` force a fetch. The default TTL is one hour.

## Storage and Security Notes

Ingestion stores files under a date‑based folder in `ROOT_DIR/generated/comfy/` and writes a sidecar containing the content hash, prompt id, parsed workflow, optional metadata, and file details. The API rejects path traversal in filename and subfolder parameters, applies a minimal per‑user rate limit to the view endpoint, and requires authentication for all routes.

## Optional Dependency and Fallbacks

The integration prefers the optional workflowbuilder package for constructing and interacting with ComfyUI. When the dependency is missing, build helpers and the client surface may be unavailable; the API falls back to a minimal, self‑contained workflow builder for text‑to‑image so development and testing can proceed without workflowbuilder installed.

Files:

- `app/integration/workflowbuilder_adapter.py`

## Related Files

Files:

- `config/comfy/presets/sample_basic_sdxl.json`
- `app/tests/api/test_comfy_api.py`

## ComfyUI Server Assumptions and Further Reading

This integration expects a running ComfyUI server reachable at the configured base URL. The client interacts with ComfyUI’s HTTP API and, when available, a websocket for streaming. Refer to the upstream project for server setup, API behavior, and node semantics: see the [ComfyUI repository](https://github.com/comfyanonymous/ComfyUI).

For broader context on extending ComfyUI, see the official guides on API nodes and custom nodes, as well as community resources on deploying workflows as APIs and development tooling. Useful starting points include the ComfyUI documentation on API Nodes and Custom Nodes, and the ComfyUI‑Manager project for managing node installations.

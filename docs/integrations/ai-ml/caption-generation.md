# Caption Generation

This system provides a unified, model-agnostic way to generate captions and
tags in the Reynard framework. It discovers captioners at runtime, applies retry and post-processing policies, and
can persist results for the gallery. The system is implemented in the `reynard-annotating` package.

## Architecture

Captioning is implemented as a modular plugin system across multiple packages in
the Reynard ecosystem. The system provides a unified interface while
maintaining clear separation of concerns between core functionality and individual generators.

### Package Structure

```
reynard-annotating/
├── annotating-core/          # Core functionality, types, and services
│   ├── managers/            # Model lifecycle, health monitoring, circuit breakers
│   ├── services/            # Annotation services, batch processing, event system
│   └── types/               # TypeScript definitions and interfaces
├── annotating-jtp2/          # JTP2 generator package (furry artwork tagging)
│   ├── core/                # JTP2Generator implementation
│   ├── config/              # Configuration schemas and validation
│   ├── plugin/              # Plugin registration and lifecycle
│   └── simulation/          # Model simulation for development/testing
├── annotating-joy/           # JoyCaption generator package (multilingual LLM)
├── annotating-florence2/     # Florence2 generator package (general purpose)
├── annotating-wdv3/          # WDv3 generator package (Danbooru-style tagging)
└── annotating/               # Unified interface (this package)
    ├── core/                # Manager delegation and plugin management
    ├── factory/             # Factory functions for creating managers
    ├── generators/          # Generator accessors and convenience methods
    └── config/              # Production configuration
```

### Key Components

- **UnifiedAnnotationManager** - Main orchestrator that coordinates all generators
- **BaseCaptionGenerator** - Abstract interface defining generation, availability checks, configuration schema, versioning, and caption types
- **Plugin System** - Dynamic registration and discovery of generator plugins
- **Health Monitoring** - Real-time health checks and performance metrics
- **Circuit Breakers** - Fault tolerance and error handling
- **Usage Tracking** - Model usage statistics and performance monitoring

### Frontend Files (packages/annotating\*)

- `packages/annotating/src/UnifiedAnnotationManager.ts` - Main orchestrator
- `packages/annotating-core/src/services/AnnotationService.ts` - Service layer
- `packages/annotating-core/src/services/CaptionGenerator.ts` - Abstract base class
- `packages/annotating-*/src/*` - Individual generator implementations

### Backend Files (TBD)

- `app/caption_generation/base.py`
- `app/caption_generation/__init__.py`
- `app/caption_generation/plugin_loader.py`
- `app/caption_generation/caption_service.py`
- `app/caption_generation/plugins/*`

## Available Generators and Types

Generator categories are used to optimize loading: lightweight models such as `jtp2` and
`wdv3` are loaded eagerly, while heavy models such as `joy` and
`florence2` are coordinated via async locks to avoid duplicate downloads. Each generator exposes a `caption_type`. For
example, `jtp2` returns `tags`, so saved captions will use a `.tags` extension. The unified service exposes
`get_available_generators()`, `is_generator_available(name)`, and `is_model_loaded(name)` for introspection.

## Backend API

The main endpoints for captions live in the app router. Use `POST /api/generate-caption/{path}` to
trigger a single caption with query parameters `generator` (name), `force` (bool), and
`post_process` (bool). The service validates the generator via the unified manager and
returns a structured result with `success`, `caption`, `processing_time`, and
`caption_type`. Use `POST /api/batch-generate-captions` to stream progress for many images;
the request body contains an `items` array of image descriptors, a `generator` string, and
an optional `config` object. Existing captions are skipped unless `force` is true. Use `PUT /api/caption/{path}` and
`DELETE /api/caption/{path}` to write or
remove specific caption sidecars by `type`. Use `PUT /api/captioner-config/{name}` to
update generator configuration at runtime.

## Service Behavior

Single requests call `UnifiedCaptionService.generate_single_caption(image_path, generator_name, config, force,
data_source)`. The service coordinates model loading via per-model async locks and can queue a request if
a model is not yet available. Before generation,
it checks for an existing caption sidecar of the generator’s `caption_type` and returns a concise error if present and
`force` is not enabled. Generation is wrapped in `_retry_with_backoff` with exponential delays and
error-type heuristics to decide retryability. After success, optional post-processing normalizes output (for example,
replacing underscores for taggers) before saving through the `data_source` with the resolved `caption_type`.

## Errors and Post‑processing

Errors are reported with a concise `error` message, an `error_type` such as `model_loading`, `model_unavailable`,
`generation`, or `unexpected`, and a `retryable` flag. For `generation` errors,
the formatted message keeps only the reason after the colon. Post‑processing can be enabled per request and
is applied generator‑specifically.

## Frontend Integration

The gallery module exposes caption actions and uses typed fetches with progress and
notifications. The `generateCaption` flow in `src/modules/gallery/captions.ts` accepts `path`, `type`, and
an optional `model` (defaulting to `jtp2`), updates loading state, and
notifies on completion. A composable in
`src/composables/useUnifiedCaptionGeneration.ts` centralizes UI integration for batch flows.

- Files:
  - `src/modules/gallery/captions.ts`
  - `src/composables/useUnifiedCaptionGeneration.ts`

## Adding a New Captioner

Implement a class conforming to `CaptionGenerator` with `generate`, `is_available`, `name`, `caption_type`,
`description`, `version`, and `config_schema`. Place it under `app/caption_generation/plugins/` and
ensure dependencies are lazily imported. The system will discover it at runtime, and
it becomes available through the unified service and API.

### Plugin authoring details

Plugins live under `app/caption_generation/plugins/<your_plugin>` and
are discovered dynamically. Each plugin package must provide an `__init__.py` that
exports a `register_plugin()` function returning a dictionary with `name`, `module_path`, and
optionally `default_config`. The module referenced by `module_path` must export `get_generator(config)` which
returns an instance of a class implementing `CaptionGenerator`. Heavy dependencies should be imported lazily inside
`get_generator` to keep startup fast and to allow availability checks to fail gracefully without crashing the
application. The captioner instance must return a `caption_type` string; this maps directly to the sidecar file
extension used when saving results (for example, `tags`, `wd`, `caption`, or `florence`).

The plugin loader handles lazy initialization, availability checks, and
configuration updates without requiring an application restart. Configuration changes are applied by
resetting the plugin so that the next call re‑initializes with the updated config.

## Unified Service Behavior

The `UnifiedCaptionService` coordinates model availability, loading, and generation for both single and
batch operations. Models are categorized as lightweight or
heavy to guide loading decisions. Per‑model async locks serialize load and
download phases to prevent duplicate downloads and reduce contention. When a heavy model is not yet
available, the service can place the request into a queue and return a queued response so
the UI can notify the user and poll status. All generation attempts use bounded retries with exponential backoff;
retryability is decided by error type.

Before generation, the service checks for existing sidecars matching the generator’s `caption_type` and
skips work unless `force` is set. After success, optional post‑processing can normalize output (for example,
replacing underscores with spaces for taggers) prior to persistence through
the data source. Processing time is measured and returned to clients for UI feedback and metrics.

## Backend API Reference

Single caption generation is provided
by `POST /api/generate-caption/{path}`. Query parameters include `generator` (required), `force` (boolean,
default `false`), and `post_process` (boolean, default `true`). The `path` supports a root shorthand where
files at the root may be referenced as `_/file.png`. On success the response contains `success`, `caption`,
`generator`, `caption_type`, and `processing_time`. When the target caption already exists and
`force` is not set, an error is returned with `caption_exists`. If
a heavy model download is still in progress, the endpoint returns a queued response with `queued: true`,
a `request_id`, and a human‑readable `message` so the caller can monitor progress.

Batch generation is provided by `POST /api/batch-generate-captions` and
returns a streaming response of progress events. The request body contains an `items` array of `{ path,
name }` entries, a `generator` string, and an optional `config` including `force` and
`post_process`. The stream emits JSON lines prefixed with `data:` including a `start` event with `total`,
`item_complete` events that include `item_result` with `success`, optional `caption`, and error details when
applicable, and a final `complete` event with `processed`, `successful`, and
`failed`. The stream uses `text/plain` with headers that disable buffering so
the frontend can process updates in real time.

Caption files can be written and deleted via `PUT /api/caption/{path}` and
`DELETE /api/caption/{path}`. The update endpoint expects a JSON body with `type` (for example, `caption`, `tags`,
`wd`, `florence`) and `caption` (string). Deletion requires a `caption_type` query parameter. Available caption sidecar
extensions are managed by `GET /api/caption-types` and `POST /api/caption-types`, which respectively return and update
the server‑side set of recognized extensions. Captioner configuration can be updated at runtime using `PUT
/api/captioner-config/{name}` with a JSON body of configuration values; the plugin will be reset and re‑initialized on
next use.

For queued heavy‑model requests the server exposes `GET /api/caption-request-queue-status` for queue summaries,
`GET /api/caption-request-status/{request_id}` for per‑request status, and
`DELETE /api/caption-request/{request_id}` to cancel a queued request when
supported. All endpoints enforce authentication.

## Post‑processing Options

Post‑processing can be applied to captions to normalize spacing, replace underscores, enforce terminal punctuation,
and adjust case. The unified caption service supports both a simple default behavior and
an advanced, configurable pipeline that can be customized globally and per‑generator.

Settings are stored server‑side and exposed via:

- `GET /api/caption-post-processing`: returns the current settings
- `PUT /api/caption-post-processing`: updates settings (admin)

Settings schema (representative):

```json
{
  "enabled": true,
  "rules": {
    "replace_underscores": true,
    "case_conversion": "none",
    "trim_whitespace": true,
    "remove_duplicate_spaces": true,
    "normalize_punctuation_spacing": true,
    "ensure_terminal_punctuation": true
  },
  "pipeline": [
    "replace_underscores",
    "trim_whitespace",
    "remove_duplicate_spaces",
    "normalize_punctuation_spacing",
    "case_conversion",
    "ensure_terminal_punctuation"
  ],
  "overrides": {
    "jtp2": { "replace_underscores": true },
    "joy": { "replace_underscores": false }
  }
}
```

When no explicit settings are provided, the backend applies a minimal default suitable for common models (e.g.,
replacing underscores for taggers and ensuring terminal punctuation for longer sentences).

## Error Model and Retries

Errors returned from single or batch flows include a concise `error` message, an `error_type`, and
a `retryable` flag. The main error types are `model_loading`, `model_unavailable`, `model_download`, `generation`,
`caption_exists`, `network`, `timeout`, and `unexpected`. The unified service and
frontend composable both apply bounded exponential backoff for retryable categories and
surface user‑friendly notifications for non‑retryable ones. Batch streaming enriches `item_complete` events with
derived `error_type` and `retryable` to allow responsive UI feedback.

## Frontend Usage

The gallery integrates captioning through a composable at
`src/composables/useUnifiedCaptionGeneration.ts`. It provides `generateSingleCaption(imagePath, { generator, force,
postProcess })` and `generateBatchCaptions({ items, generator, config, force,
postProcess })`. The single‑request path automatically interprets queued responses by handing off to
a caption request queue composable in `src/composables/useCaptionRequestQueue.ts`,
which polls `caption-request-queue-status` and `caption-request-status` endpoints and
surfaces notifications. Batch flows consume the streaming response by reading lines beginning with `data:` and
updating progress in real time. A convenience path for
classic operations is available via `src/resources/browse.ts` where
`generateCaption(path, name, generator, force)` calls the single‑caption endpoint, and
advanced gallery operations in `src/modules/gallery/advancedOperations.ts` wrap tag generation with notifications.

## Request and Response Examples

Single caption generation request using the root shorthand:

```bash
curl -X POST \
  "http://localhost:7000/api/generate-caption/_/example.jpg?generator=jtp2&post_process=true" \
  -H "Authorization: Bearer <token>"
```

Successful response shape:

```json
{
  "success": true,
  "caption": "tag_one, tag_two, tag_three",
  "generator": "jtp2",
  "caption_type": "tags",
  "processing_time": 0.42
}
```

Queued response shape when a heavy model is downloading:

```json
{
  "success": false,
  "queued": true,
  "request_id": "c1a2b3c4-d5e6-7f89-0123-456789abcdef",
  "message": "Model florence2 is being downloaded. Your request has been queued and will be processed automatically when the download completes.",
  "error": "Request queued (ID: c1a2...)",
  "error_type": "model_unavailable",
  "retryable": true
}
```

Batch request body example:

```json
{
  "items": [
    { "path": "", "name": "example.jpg" },
    { "path": "", "name": "another.png" }
  ],
  "generator": "joy",
  "config": { "force": false, "post_process": true }
}
```

The streaming response consists of lines starting with `data:` containing JSON objects such as `{ "type": "start",
"total": 2 }`, `{ "type": "item_complete", "item_result": { "success": true, "caption": "...",
"caption_type": "caption" } }`, and a final `{ "type": "complete", "processed": 2, "successful": 2, "failed": 0 }`.

## Notes on Sidecar Types

Recognized caption sidecar extensions are managed server‑side and can be read and
updated without restart. The default set includes `.caption`, `.txt`, `.tags`, `.florence`, and
`.wd`. Frontend UI uses a caption types context to present both manual and auto‑captioner types, and
backend persistence writes sidecars using the generator’s `caption_type` as the extension. When
adding a new captioner, choose a `caption_type` that is concise, unique, and representative of the output format.

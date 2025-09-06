# Caption Models Preloading API

This document describes the caption model preloading and unloading endpoints that complement the unified caption generation system. These endpoints allow administrators to proactively load caption generators into memory, optionally run a warmup pass, unload them to reclaim resources, and query which models are currently resident.

All endpoints require authentication. Mutating actions are restricted to administrators. Configuration defaults for preloading are managed by the global configuration service and can be updated at runtime from the Settings panel.

## Endpoints

### GET /api/caption-models/loaded

Returns the set of currently loaded caption model names. Use this to drive UI indicators for availability and to confirm the effect of manual preload or unload actions.

Successful responses contain a JSON object with a `loaded` array.

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:7000/api/caption-models/loaded
```

```json
{ "loaded": ["jtp2", "joy"] }
```

### POST /api/caption-models/preload

Loads one or more caption models into memory with optional warmup and bounded concurrency. When no explicit list of generators is provided, the service uses the configured defaults from the global configuration. The request body supports a `generators` array of names, a `warmup` flag, and a `max_concurrent` integer to bound simultaneous loads. The response reports per‑generator status.

```bash
curl -X POST -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $TOKEN" \
  -d '{ "generators": ["jtp2", "wdv3"], "warmup": false, "max_concurrent": 2 }' \
  http://localhost:7000/api/caption-models/preload
```

```json
{ "results": [ { "model": "jtp2", "loaded": true }, { "model": "wdv3", "loaded": true } ] }
```

When a generator exposes a `warmup()` method, warmup will be executed best‑effort after the model loads. Load times are recorded into the model usage tracker for performance analysis.

### POST /api/caption-models/unload/{name}

Unloads a specific caption model from memory. This updates the model usage tracker and frees resources when the model supports explicit unloading. The response confirms the model name and unload status.

```bash
curl -X POST -H "Authorization: Bearer $TOKEN" \
  http://localhost:7000/api/caption-models/unload/jtp2
```

```json
{ "model": "jtp2", "unloaded": true }
```

If the model was not loaded, the endpoint returns a 404 with a concise error message.

### POST /api/caption-models/unload-all

Unloads all resident caption models. The response lists the models that were unloaded during this operation. Use this to quickly reclaim memory on shared systems or after batch workloads.

```bash
curl -X POST -H "Authorization: Bearer $TOKEN" \
  http://localhost:7000/api/caption-models/unload-all
```

```json
{ "unloaded": ["jtp2", "joy"] }
```

## Startup Preloading

The application can preload caption models automatically during startup based on the global configuration. When preloading is enabled and `on_startup` is true, the service loads the configured default generators using the specified concurrency and optional warmup. This improves first‑use latency for common actions while keeping overall startup time bounded.

Configuration keys are managed by the configuration manager and exposed at `/api/config` for admin users:

```json
{
  "caption_preload_enabled": true,
  "caption_preload_default_generators": ["jtp2"],
  "caption_preload_on_startup": true,
  "caption_preload_warmup": false,
  "caption_preload_max_concurrent_preloads": 1
}
```

## Access Control and Behavior

Only administrators may call mutating endpoints to preload or unload models. Read‑only queries for loaded status are available to authenticated users. The unified caption service coordinates model loads and avoids duplicate downloads by using per‑model async locks. The model usage tracker records load events and marks models as unloaded when requested or when automatic timeouts elapse.

# Unified Caption Generation – User Guide

This guide explains how to generate captions and tags in Reynard using the unified caption system, how to adjust post‑processing, and how to resolve common issues.

## What it does

The unified caption system provides a single, consistent workflow to generate captions or tags using multiple models (e.g., JTP2, WDv3, JoyCaption, Florence2). It automatically handles model loading, download coordination, retries, and optional text cleanup so you can focus on results.

## Quick start

1. Open an image in the gallery and use the caption action to generate a caption. By default, the system uses a fast model (e.g., `jtp2`) and applies post‑processing for readability.
2. For multiple images, use the batch transform dialog and select a generator. Progress updates appear in real time.
3. Saved captions use a sidecar file based on the model’s type (for example, `.tags` for taggers, `.caption` for sentence captions).

## Choosing a caption model

- **JTP2, WDv3 (Lightweight)**: Fast taggers best for quick keywords. Output type is typically `tags`.
- **JoyCaption, Florence2 (Heavy)**: Descriptive captions. Heavier load and download times; recommended for batch runs.

You can switch the model per request. If a heavy model needs to download or load, the UI will notify you and may queue the request until ready.

## Post‑processing

Post‑processing cleans up results for readability. Typical rules include:

- Replace underscores with spaces
- Normalize spacing and punctuation
- Ensure terminal punctuation for long sentences

You can enable/disable post‑processing per request (e.g., a toggle in dialogs) and configure global rules from Settings → Model Management → Caption Models → Post‑Processing (admin). Generator‑specific overrides allow fine control (e.g., keep underscores for certain models).

## Preloading and unloading (admins)

To reduce first‑use latency, admins can preload models and optionally run a warmup pass:

- Go to Settings → Model Management → Preloading
- Choose default generators (defaults to `jtp2`), enable “Preload on Startup,” set concurrency, and run “Preload Selected Now”
- Use “Unload Selected” or “Unload All” to reclaim resources

These controls map to the API described in `docs/caption-models-api.md` and respect admin‑only access.

## Tips

- For quick tags, prefer `jtp2`. For descriptive captions, use `joy` or `florence2`.
- Enable preloading on servers with enough RAM/VRAM to minimize cold starts.
- Keep post‑processing enabled for cleaner results; disable if you need raw outputs for downstream scripts.

## Troubleshooting

- **Model is downloading**: The request may be queued. Wait for the download to complete; progress is visible in Model Management → Downloads. You can switch to a lightweight model to proceed immediately.
- **Caption already exists**: Enable “Force” to overwrite, or delete the existing sidecar from the file actions.
- **GPU memory errors**: Unload heavy models from the Preloading tab or reduce concurrency in batch operations.
- **Slow generation**: Preload the chosen model or switch to a lighter generator. Confirm HF cache is configured (`docs/hf-cache-configuration.md`).
- **Post‑processing not applied**: Ensure the per‑request toggle is enabled and verify admin settings for the post‑processing pipeline.

## Where to learn more

- API reference and examples: `docs/caption-generation.md`
- Preloading API: `docs/caption-models-api.md`
- Model management: `docs/model-management.md`
- Notifications and error handling: `docs/notifications.md`

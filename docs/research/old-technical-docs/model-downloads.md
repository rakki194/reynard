# Unified Model Downloads

A single system orchestrates downloads for captioners, detection models, diffusion LLMs, and generic artifacts. It provides a queue, progress reporting, cache integration with Hugging Face, retry/backoff, and admin APIs.

## Overview

- Manager: `UnifiedModelDownloadManager` registers `ModelInfo` entries and provides queueing, duplicate suppression, and global locking to ensure one active download at a time.
- Templates: Download templates handle common model families (caption, detection) by fetching only needed files (e.g., `wdv3` ONNX + labels; `jtp2` `JTP_PILOT2/*`) with progress estimation via cache size.
- Cache: Integrates with HF cache (`get_hf_hub_dir`, `try_to_load_from_cache`), marks models completed if files already exist.
- Retry: Retries transient failures (`timeout`, `network`, `rate limit`) with capped backoff.

- Files:
  - `app/managers/unified_model_download.py`

## Registration

Register models for the queue:

- `register_caption_generator(model_id, repo_id, description?, total_size_estimate?, file_count_estimate?)`
- `register_detection_model(model_id, repo_id, description?, ...)`
- `register_generic_model(model_id, download_func, description?, model_path?)`

## Queue and Status

- Queue methods: `start_download(model_id)`, `cancel_download(model_id)`, `is_downloading(model_id)`, `is_completed(model_id)`, `get_download_status(model_id)`, `get_queue_status()`
- Status includes current file, files downloaded/total, bytes downloaded/total, speed, percent, and timestamps.

## API Endpoints

- `POST /api/model-download/{model_id}/start`: start background download for any registered model (respects `DISABLE_MODEL_DOWNLOADS`)
- `GET  /api/model-download-status/{model_id}`: return status (completed/downloading/not_started) and HF cache existence, plus queue summary
- `GET  /api/model-download-queue-status`: queue size/running/currently_downloading summary
- `POST /api/model-download/{model_id}/clear` (admin): clear stuck status/queue entries for a model

- Files:
  - `app/api/model_download.py`
  - `app/api/model_download_status.py`
  - `app/api/model_download_queue_status.py`

## Notes

- The manager promotes already‑cached models to completed status to avoid redundant downloads.
- For large repos, only required files are fetched for certain models to reduce bandwidth/time.
- `HF_HUB_DOWNLOAD_TIMEOUT` and `HF_DOWNLOAD_MAX_RETRIES` influence robustness.

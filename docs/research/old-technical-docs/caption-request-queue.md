# Caption Request Queue

Queues caption generation requests when models aren’t yet available and processes them automatically once downloads complete. Exposes a background service and a manager with query and cancel operations.

## Overview

- Manager: `CaptionRequestQueueManager` holds requests keyed by ID with per‑generator grouping and a lock‑protected queue. It polls the unified download manager to decide when a generator is available, then calls the unified caption service to generate and persist captions.
- Background: `CaptionRequestQueueService` owns the manager instance and starts its processor during app boot.

- Files:
  - `app/managers/caption_request_queue.py`
  - `app/services/background/caption_request_queue_service.py`

## Request Lifecycle

1. Queue: `queue_request(image_path, generator_name, config, force?, post_process?, data_source?, callback?)` returns a `request_id`.
2. Process: When `is_completed(model_id)` is true for the mapped generator, the manager generates a caption via `UnifiedCaptionService.generate_single_caption`.
3. Complete: The request transitions to `COMPLETED`/`FAILED`, optionally invoking a callback. Results include `success`, `caption`, and `processing_time`.
4. Cleanup: `cleanup_old_requests(max_age_hours)` removes stale completed/failed/cancelled entries.

## Status and Control

- `get_request_status(request_id)` returns status fields and any result/error.
- `get_queue_status()` summarizes queued/processing/completed/failed/cancelled per generator.
- `cancel_request(request_id)` cancels a queued (not yet processing) request.

## Notes

- Requests are grouped by image path to process sequentially per image and avoid race conditions on sidecar writes.
- Known generator→model IDs: `jtp2 → jtp2-pilot2`, `wdv3 → wdv3`, `joy → joycaption`, `florence2 → florence2`.

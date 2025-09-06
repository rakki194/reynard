# Model Usage Tracker

Tracks usage and auto‑unloads models after inactivity, with configurable timeouts per model type and admin/user APIs to inspect/update settings.

## Overview

The tracker records when a model is loaded/used, preserves per‑model metrics, and runs a background cleanup loop to unload inactive models from VRAM/RAM based on timeouts. Timeouts can be tuned globally per model type and individually per model.

- Files:
  - `app/managers/model_usage_tracker.py`
  - `app/api/model_usage_tracker_config.py`
  - `app/services/core/app_config.py` (timeouts and flags)

## Configuration

AppConfig keys (with env/file overrides):

- `model_usage_tracker_enabled`
- `model_usage_tracker_cleanup_interval`
- Per‑type timeouts:
  - Caption: `model_usage_tracker_caption_generator_vram_timeout`, `..._ram_timeout`
  - Detection: `model_usage_tracker_detection_model_vram_timeout`, `..._ram_timeout`
  - Ollama/TTS: `model_usage_tracker_ollama_model_vram_timeout`, `..._ram_timeout`
- Advanced: `model_usage_tracker_enable_priority_unloading`, `model_usage_tracker_enable_time_based_unloading`, `model_usage_tracker_night_hours_start/end`, `model_usage_tracker_night_timeout_multiplier`

## Internals

- Model types: `caption_generator`, `detection_model`, `ollama_model`, `tts_model`
- Registration: `register_model(model_id, model_type, vram_timeout?, ram_timeout?)`
- Usage: `record_usage(model_id, user_id?)` (updates `last_used`, `usage_count`, and sets `is_loaded = True`)
- Performance: `record_load_time`, `record_caption_time`, `record_detection_time`
- Cleanup loop: periodically checks `time_since_use` and calls unload handlers per model type
- Unloading: captioners via `caption_service.unload_model`, detection via detection manager, TTS via adapter hook, Ollama is a placeholder

## API Endpoints

Prefix: `/api/model-usage-tracker-config`

- `GET /` (admin): returns enabled flag, cleanup interval, per‑type timeouts, individual model overrides, advanced settings
- `GET /basic`: available to all users; returns enabled/interval and basic stats
- `PUT /basic`: allow users to toggle enabled and change cleanup interval
- `PUT /` (admin): update enabled, interval, per‑type timeouts, advanced settings (with validation ranges)
- `POST /restart` (admin): applies current config to the running tracker and restarts the loop
- `PUT /model/{model_id}/timeout` (admin): set per‑model VRAM/RAM timeouts
- `POST /model/{model_id}/unload` (admin): manually unload a tracked model (VRAM/RAM)
- `GET /analytics` (admin): summary and per‑model stats (loaded, usage counts, timeouts, time since last use)

## Notes

- Tracker persists metrics and usage in the metrics database. On startup it verifies actual load state (e.g., via unified caption service) and corrects stale entries.
- When toggled off, start() is a no‑op; when toggled on, the cleanup loop runs at `cleanup_interval` seconds.

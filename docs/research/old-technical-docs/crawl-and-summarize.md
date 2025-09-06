# Crawl and Summarize

Fetch markdown content via Firecrawl and summarize it with Ollama. Both systems provide streaming endpoints and cached storage for results.

## Crawl (Firecrawl)

Feature‑flagged by `crawl_enabled` with base URL `firecrawl_base_url` and cache dir `crawl_cache_dir`. The service caches results per‑URL with a TTL (max_age_days), and exposes helpers to submit jobs, poll status, and direct fetch with polling.

- Endpoints (prefix `/api/crawl`):
  - `POST /fetch`: `{ url, max_age_days }` → `{ job_id }`
  - `GET /status/{job_id}`: returns Firecrawl status JSON
  - `GET /direct?url=&max_age_days=`: direct fetch; returns `{ url, markdown, cached?, metadata? }`
  - `POST /purge-cache`: optional `url` to purge one; otherwise purge all
  - `GET /stream`: SSE; accepts `url` or an existing `job_id`; emits `status`, `submitted`, `done`, `error`

- Files:
  - `app/api/crawl.py`
  - `app/services/integration/crawl_service.py`

## Summarize

Summarize markdown with Ollama, providing both non‑streaming and streaming variants. Results are normalized and persisted for later retrieval.

- Endpoints (prefix `/api/summarize`):
  - `POST /url`: `{ url, max_age_days, include_outline?, include_highlights? }` → normalized summary payload with `summary_id`
  - `GET /{summary_id}`: returns persisted summary
  - `GET /stream?url=...`: SSE stream with events: `crawl_progress`, `cleaning`, `llm_tokens`, `done`, `error`

- Files:
  - `app/api/summarize.py`
  - `app/services/integration/summarize_service.py`

## Notes

- Summarize streaming path first emits crawl progress, then streams LLM tokens as they arrive, and finally emits a structured `done` payload persisted to disk under `cache/summaries/`.
- TTS API supports `speak-summary` using the `summary_id` payload.

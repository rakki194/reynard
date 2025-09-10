# RAG Operations Guide

This document summarizes operational knobs, metrics, and playbooks for Reynard's RAG stack (Postgres + pgvector + embeddings).

Overview

- Vector store: Postgres with pgvector
- Services: `VectorDBService`, `EmbeddingService`, `ClipEmbeddingService`, `RAGService`, `EmbeddingIndexService`
- Admin endpoints are under `/api/rag/ops/*` (admin-only)

Environment and Config

The following tunables control watchdogs and health checks across services. They can be set via environment variables (preferred for ops) and are persisted in the config file via the config manager.

- VectorDB (Postgres):
  - `PG_HEALTH_INTERVAL_S` (default 60): health probe cadence for `VectorDBService`
  - `PG_RECONNECT_ON_ERROR` (default true): rebuild engine on operational errors during ops flows
  - `PG_POOL_PRE_PING` (default true): enable SQLAlchemy `pool_pre_ping` to validate connections before checkout

- NLWeb Router:
  - `NLWEB_HEALTH_INTERVAL_S` (default 120)
  - `NLWEB_RECONNECT_MAX_ATTEMPTS` (default 5)
  - `NLWEB_RECONNECT_BASE_DELAY_MS` (default 200)
  - `NLWEB_RECONNECT_MAX_DELAY_MS` (default 5000)

- Comfy:
  - `COMFY_HEALTH_INTERVAL_S` (default 60)
  - `COMFY_RECONNECT_MAX_ATTEMPTS` (default 5)
  - `COMFY_RECONNECT_BASE_DELAY_S` (default 0.5)
  - `COMFY_RECONNECT_MAX_DELAY_S` (default 30)

Environment Variables Summary (defaults)

- VectorDB (Postgres)
  - `PG_HEALTH_INTERVAL_S=60`
  - `PG_RECONNECT_ON_ERROR=true`
  - `PG_POOL_PRE_PING=true`
- NLWeb Router
  - `NLWEB_HEALTH_INTERVAL_S=120`
  - `NLWEB_RECONNECT_MAX_ATTEMPTS=5`
  - `NLWEB_RECONNECT_BASE_DELAY_MS=200`
  - `NLWEB_RECONNECT_MAX_DELAY_MS=5000`
- Comfy
  - `COMFY_HEALTH_INTERVAL_S=60`
  - `COMFY_RECONNECT_MAX_ATTEMPTS=5`
  - `COMFY_RECONNECT_BASE_DELAY_S=0.5`
  - `COMFY_RECONNECT_MAX_DELAY_S=30`

Key Metrics

- kNN latency: last query time (ms) recorded per session
- Hybrid latency: last hybrid query time (ms) recorded per session
- HNSW ef_search: session-level setting; higher = better recall, slower queries
- Index sizes: per-index total size via `pg_total_relation_size`
- Heap/Buffer usage: `pg_statio_user_tables` for `rag_*` relations
- Declared vs observed dims: `dimensions` section shows `declared_dim` from table type vs `sample_row_dim` from data
- Queue lag: reported by `EmbeddingIndexService` (`/api/rag/admin/status`)

Admin Endpoints

- GET `/api/rag/ops/metrics`: JSON summary of ef_search, last latencies, index sizes, and heap stats
- POST `/api/rag/ops/set_ef_search` { ef_search: number }: set HNSW ef_search for new session
- POST `/api/rag/ops/analyze`: run `ANALYZE`
- POST `/api/rag/ops/vacuum` { verbose?: boolean }: run `VACUUM`
- POST `/api/rag/ops/reindex` { table?: string }: run `REINDEX TABLE IF EXISTS <table>`

Readiness Checks

- Postgres connectivity
  - Ensure your DSN is correct and reachable.
  - Quick probe:

    ```bash
    psql "$PG_DSN" -c "SELECT 1"  # expected: ?column? | 1
    ```

- pgvector extension
  - Verify extension is installed and version is reported:

    ```bash
    psql "$PG_DSN" -c "\dx vector"          # lists installed extensions
    psql "$PG_DSN" -c "SELECT extversion FROM pg_extension WHERE extname='vector';"
    ```

  - Create if missing (requires superuser or appropriate privileges):

    ```bash
    psql "$PG_DSN" -c "CREATE EXTENSION IF NOT EXISTS vector;"
    ```

- Schema and migrations
  - Base objects live under `scripts/db/` and are applied by `VectorDBService` at startup when enabled.
  - Validate core tables exist (examples):

    ```bash
    psql "$PG_DSN" -c "\dt rag_*"          # lists rag_* tables
    psql "$PG_DSN" -c "\di rag_*"          # lists indexes for rag_* tables
    ```

  - If first-time setup failed, re-run migrations by restarting the service or manually executing the SQL in `scripts/db/001_pgvector.sql`, `002_embeddings.sql`, and `003_indexes.sql`.

- Health endpoint sanity
  - Once services are up, the following calls should return healthy or degraded (not error): see Quickchecks below.

Troubleshooting

- OperationalError during health checks
  - The service will attempt an engine rebuild when `PG_RECONNECT_ON_ERROR=true`. Confirm DSN/network and retry.
  - Enable connection validation with `PG_POOL_PRE_PING=true` to avoid stale connections from the pool.
- Permission errors creating extension
  - Ask your DBA to install pgvector or grant the role permission to `CREATE EXTENSION vector` in the target database.
- Missing tables or indexes
  - Ensure `VectorDBService` is enabled and migrations ran. Check logs, then re-run migrations from `scripts/db/*.sql`.
- Performance degradation after large ingests
  - Run `VACUUM`/`ANALYZE` via ops endpoints, verify index sizes in `/api/rag/ops/metrics`, and adjust batch sizes.

Queue Admin

- POST `/api/rag/admin/pause|resume|drain`
- GET `/api/rag/admin/status`
- GET `/api/rag/admin/dead_letter` and POST `/api/rag/admin/dead_letter/requeue`

Tuning Guidance

Latency vs Recall

- ef_search increases recall but also query time. Start with 64–128; scale up under low QPS when recall matters
- Monitor `last_knn_ms` and `last_hybrid_ms` after raising ef_search; aim to keep p95 within SLO

Index Health

- After large ingests, run `ANALYZE` to update statistics
- Use `VACUUM` periodically to reclaim space after deletes; do not automate without monitoring
- Reindex specific tables if bloat or corruption is suspected (use with caution)

Model/Dim Consistency

- EmbeddingService includes a registry of expected dimensions and metrics for known models. Inserts will warn/fail if the returned embedding dimension does not match the registry.
- Use `/api/rag/ops/metrics` to confirm the declared `VECTOR(N)` matches sample row `dim`. Mismatches will be surfaced under `dimensions[].mismatch`.

Thresholds and Automation

- The indexing service can trigger a best-effort `ANALYZE` after a configurable volume of inserted rows.
  - Configure with `RAG_ANALYZE_AFTER_ROWS` (default 5000; set 0 to disable) and optional `RAG_ANALYZE_TABLES` (comma-separated list) to limit to specific tables.
  - The hook fires after batched inserts of embeddings and never throws; it is safe under load.
- Batch sizes are configurable to trade off throughput vs. write pressure:
  - `RAG_INGEST_BATCH_SIZE_TEXT` (default 16)
  - `RAG_INGEST_BATCH_SIZE_CLIP` (default 8)
  - Lower these values if Postgres CPU rises or write amplification is observed; increase cautiously to improve throughput.

VACUUM vs REINDEX Guidance

- Prefer `VACUUM (ANALYZE)` when table bloat is modest and deletes are the primary source of churn.
- Consider `REINDEX TABLE` for a specific embedding table when:
  - Index size grows disproportionately vs. row count and `VACUUM` does not reduce size over time
  - Planner regressions persist after `ANALYZE`
  - Corruption is suspected
- Inspect `/api/rag/ops/metrics` regularly to track `rag_*` index sizes and plan maintenance windows.

Throughput & Backpressure

- Monitor `EmbeddingIndexService` queue depth and `in_flight` to understand lag
- If CPU-bound on embeddings, reduce concurrency via config `rag_ingest_concurrency`
- If Postgres CPU climbs, lower ingest batch sizes or introduce ingest pauses

Security & Privacy

- Role gating: RAG ingestion endpoints require admin role. Query endpoints require an authenticated user.
- Rate limits: per-user per-minute caps for ingest and query are configurable in `AppConfig` (`rag_ingest_rate_limit_per_minute`, `rag_query_rate_limit_per_minute`).
- Size clamps: request payloads are clamped with `rag_ingest_max_items_per_request`, `rag_ingest_max_content_length`, `rag_clip_max_items_per_request`, and `rag_query_topk_max`.
- Redaction: logs and streamed events are redacted by default (`rag_redact_logs=true`). Highlights can be suppressed with `rag_redact_highlights=true`.
- Path allow-list: CLIP image ingestion enforces `rag_ingest_allowed_roots` to prevent traversal; only files under these roots are accepted.
- Compliance toggles: `rag_purge_on_disable` and `rag_rebuild_on_enable` reserved for future workflows.

Playbooks

Slow kNN Queries

1. Check `/api/rag/ops/metrics` for `ef_search` and last latencies
2. If recall is OK, lower `ef_search` via `/ops/set_ef_search`
3. Run `ANALYZE` if recent large ingests
4. Inspect index sizes for abnormal growth

High Queue Lag

1. Get `/api/rag/admin/status` (queue_depth, in_flight)
2. Pause queue and reconfigure concurrency or batch sizes
3. Resume and watch metrics; drain if needed

Index Bloat Suspected

1. Get `/api/rag/ops/metrics` and compare index sizes over time
2. Run `VACUUM` and `ANALYZE`
3. If still bloated and safe to do so, run `REINDEX` on the specific table

Timeouts

- Query: keep application timeouts slightly above typical p95
- Ingest: use smaller batches and monitor DB and embedding service saturation

Notes

- These actions are not automated. Use during maintenance windows when possible.
- Always snapshot metrics before/after to validate impact.

Quickchecks

- Vector DB service health (generic services API)

  ```bash
  curl -s -H "Authorization: Bearer $TOKEN" \
    "$BASE_URL/api/services/health/vector_db" | jq
  # Expect: health: healthy|degraded|unhealthy, service_info includes connection_state/attempts
  ```

- Vector DB ops health (admin)

  ```bash
  curl -s -H "Authorization: Bearer $ADMIN_TOKEN" \
    "$BASE_URL/api/rag/ops/health/vector_db" | jq
  ```

- Comfy health

  ```bash
  curl -s -H "Authorization: Bearer $TOKEN" \
    "$BASE_URL/api/comfy/health" | jq
  # Expect: { enabled, status: ok|disabled|error, connection_state }
  ```

- NLWeb router health

  ```bash
  curl -s -H "Authorization: Bearer $TOKEN" \
    "$BASE_URL/api/nlweb/health" | jq
  # Expect: { enabled, status: ok|disabled|error, connection_state }
  ```

## RAG Ops Notes

## Postgres + pgvector Operational Guidance

### Autovacuum and ANALYZE

- Ensure `autovacuum` is enabled for all RAG tables.
- After large insert batches, run `ANALYZE` manually to refresh statistics.
- During heavy write phases, consider temporarily increasing autovacuum scale factors for RAG tables.
- After bulk loads, run `VACUUM (ANALYZE)` to maintain performance.

### Memory Settings

- `work_mem`: Increase to 64MB–256MB per connection to support complex ranking and sorting queries during retrieval. Adjust based on expected concurrency.
- `maintenance_work_mem`: Set to 512MB–2GB when creating HNSW indexes to speed up index construction.

### IO Concurrency

- On Linux with fast storage, set `effective_io_concurrency` to a non-zero value (e.g., 100–300) to improve parallel read performance.

### HNSW Index Tuning

- Indexes are created with `m=16` and `ef_construction=200` by default.
- Tune query-time recall and latency per session with:

  ```sql
  SET hnsw.ef_search = 40;  -- Increase for higher recall, decrease for lower latency
  ```

### Reindexing and Bloat

- Vector indexes can grow over time; periodically evaluate index size.
- Use `REINDEX` for heavily updated tables if bloat is detected.
- Avoid unnecessary updates to embedding rows—prefer insert-on-change patterns to minimize index churn.

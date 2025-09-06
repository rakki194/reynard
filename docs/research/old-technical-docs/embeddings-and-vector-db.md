# Embeddings & Vector DB Operations

This note collects recommended settings and practices for embeddings and pgvector in YipYap.

Device and Batching

On GPU systems, start with moderate CLIP batch sizes and adjust based on memory:

- GPU (ViT-L/14): start `RAG_CLIP_BATCH_MAX=8`, enable `RAG_CLIP_AUTOSCALE=true`.
- CPU: start `RAG_CLIP_BATCH_MAX=2–4`, autoscale can remain enabled; throughput will be lower than GPU.

The CLIP service enforces a conservative memory cap and will auto-downscale sub-batches if an OOM is detected (best-effort). You can disable autoscaling by setting `RAG_CLIP_AUTOSCALE=false` and manually tune batch sizes.

Vector Dimensions

Text/code/captions default to `VECTOR(1024)` and CLIP image embeddings to `VECTOR(768)`. The embedding service validates model dimensions and surfaces mismatches in `/api/rag/ops/metrics` under `dimensions`.

Changing Dimensions

To migrate from `VECTOR(1024)` to `VECTOR(768)` (or vice versa):

1. Schedule maintenance (writes paused; queries may continue on old data).
2. Create new columns/tables with the target `VECTOR(N)` or rebuild tables if downtime is acceptable.
3. Re-embed affected content into the new dimension.
4. Switch queries to read from the new columns/tables.
5. Drop or archive old columns/tables when confident.

Prefer parallel tables for zero-downtime migrations; single-column type changes require exclusive locks and are not recommended in production.

Maintenance

- Run `ANALYZE` after large ingests (automated threshold available via `RAG_ANALYZE_AFTER_ROWS`).
- Use `VACUUM (ANALYZE)` after deletions when bloat is suspected.
- Rebuild HNSW indexes selectively during maintenance windows if bloat persists.

## Embeddings and Vector Database

Text and image embeddings are produced by dedicated services and stored in Postgres using `pgvector`. The indexing service ingests documents in a streaming-friendly way, while the RAG service exposes a simple orchestrated flow.

## Configuration

Enable via `AppConfig`:

- `rag_enabled: bool`
- `pg_dsn: string`
- Default models and CLIP settings: `rag_text_model`, `rag_code_model`, `rag_caption_model`, `rag_clip_model`, `rag_clip_preprocess`, `rag_clip_multicrop`.

## Embedding Service (Text)

`EmbeddingService.embed_texts(model, texts, timeout_s?) -> List[List[float]]` calls Ollama `/api/embed` and preserves input order, with an in-memory cache keyed by `(model,text)` and normalization of whitespace. On errors or when Ollama is unavailable, it falls back to a deterministic hash-based vector with the expected dimension. Basic metrics (`requests`, `errors`, `last_ms`) are tracked.

- Files:
  - `app/services/integration/embedding_service.py`

## Vector DB Service (pgvector)

`VectorDBService` initializes a SQLAlchemy engine from `pg_dsn` and runs three idempotent migrations: `001_pgvector.sql`, `002_embeddings.sql`, and `003_indexes.sql`. It provides helpers:

- `insert_document_with_chunks(source, content, metadata, chunks)` -> `(document_id, [(chunk_id, chunk_index), ...])`
- `insert_document_embeddings(rows)` -> inserted row count; rows include `chunk_id`, `embedding`, `model_id`, `dim`, `metric`
- `similar_document_chunks(embedding, top_k)` -> list with `chunk_id`, `model_id`, `dim`, and `score = 1 - cosine_distance`

- Files:
  - `app/services/integration/vector_db_service.py`
  - `scripts/db/*.sql`

### Health and Watchdog Tunables

Operational tunables are exposed via env and `AppConfig`:

- `PG_HEALTH_INTERVAL_S` (default 60): health probe cadence for `VectorDBService`
- `PG_POOL_PRE_PING` (default true): enable SQLAlchemy `pool_pre_ping` to validate connections before checkout
- `PG_RECONNECT_ON_ERROR` (default true): toggle for auto-reconnect path that disposes/rebuilds the engine on operational errors (implemented in watchdog phase)

## Indexing Service

`EmbeddingIndexService.ingest_documents(items, model, batch_size)` accepts a sequence of `{source, content}` items, chunks each document, stores document/chunk rows, batches text for embeddings, and inserts vectors in groups. Yields progress events `{type: 'progress'|'error'|'complete', ...}` suitable for streaming UIs.

- Files:
  - `app/services/background/embedding_index_service.py`

## RAG Service

`RAGService.ingest_document(source, content, chunks, model, metric)` performs a synchronous ingest and embedding call; `query_similar(vector, top_k)` delegates to the vector DB service. Intended as a minimal orchestrator for early integration.

- Files:
  - `app/services/integration/rag_service.py`

## Notes

- Embedding rows record `model_id`, `dim`, and `metric` to support multiple models simultaneously.
- `vector_literal` encodes vectors as `[v1,v2,...]` for `pgvector` casts.
- For large batches, prefer the streaming `ingest_documents` API to avoid long request times.

## Schema and Dimensions

The default schema provisions fixed dimensions for vector columns:

- Documents/code/captions: `VECTOR(1024)`
- CLIP images: `VECTOR(768)`

Ensure the chosen embedding model dimension matches the table definition. The default text models include a mix of 1024- and 768-dimensional models (e.g., `mxbai-embed-large` 1024, `bge-m3` 1024, `nomic-embed-text` 768). If you select a 768-dim model for documents or captions, adjust the migrations to use `VECTOR(768)` or create a new column/table variant. The runtime also stores `dim` per row for auditing, but Postgres will enforce the declared `VECTOR(n)` arity at insert time.

- Files:
  - `scripts/db/002_embeddings.sql`

## Query Patterns and Operators

Similarity search uses pgvector’s `<=>` operator with cosine distance and returns a normalized score in
\( [0,1] \) as `score = 1 - cosine_distance`:

```sql
SELECT e.chunk_id, e.model_id, e.dim,
       (1 - (e.embedding <=> CAST(:vec AS vector))) AS score
FROM rag_document_embeddings e
ORDER BY e.embedding <=> CAST(:vec AS vector)
LIMIT :k;
```

The service uses this pattern for document/code/caption/image searches. When doing brute-force comparisons for recall checks, the session temporarily disables index and bitmap scans.

- Files:
  - `app/services/integration/vector_db_service.py`

## Indexing Strategy and Tuning

HNSW indexes are created for all embedding tables with cosine ops:

```sql
CREATE INDEX IF NOT EXISTS idx_document_embeddings_hnsw
ON rag_document_embeddings
USING hnsw (embedding vector_cosine_ops)
WITH (m=16, ef_construction=200);
```

At query time, you can tune search quality/latency via `hnsw.ef_search` (session-level). The service exposes `VectorDBService.set_ef_search(ef)` which executes `SET hnsw.ef_search = :ef` best-effort on the engine’s connections.

General guidance (see pgvector docs): increase `ef_search` for higher recall at the cost of latency; `m` and `ef_construction` control index build time/memory/recall trade-offs. Run `ANALYZE` regularly so the planner has fresh stats.

- Files:
  - `scripts/db/003_indexes.sql`
  - `app/services/integration/vector_db_service.py`

## Batch Insertion and Vector Literals

Embeddings are inserted in batches using a compact vector literal format `"[v1,v2,...]"` and cast on the server:

```sql
INSERT INTO rag_document_embeddings (chunk_id, embedding, model_id, dim, metric)
VALUES (:chunk_id, CAST(:embedding AS vector), :model_id, :dim, :metric);
```

The helper `vector_literal(vec)` formats floats with fixed precision and preserves input order. For large ingests, prefer batching and the streaming indexer.

- Files:
  - `app/services/integration/vector_db_service.py`
  - `app/services/background/embedding_index_service.py`

## Recall Sampling and Metrics

To estimate recall, the RAG service compares top-K results from the HNSW index against a sequential-scan query and computes set overlap. Samples may be persisted to `rag_recall_samples` (created idempotently during migrations) with optional `q_hash` and `correlation_id` for later analysis. The vector DB service can also report index sizes and heap stats via `get_pg_metrics()`.

- Files:
  - `app/services/integration/rag_service.py`
  - `app/services/integration/vector_db_service.py`

## Ollama Embed API Details

Text/code/caption embeddings are requested from Ollama’s `/api/embed` in ordered batches. Inputs are normalized for whitespace when caching small texts. On non-200 responses or client unavailability, a deterministic hash-based fallback produces vectors of the expected dimension to keep pipelines functional during outages.

Example request payload:

```http
POST /api/embed
Content-Type: application/json

{ "model": "mxbai-embed-large", "input": ["first text", "second text"] }
```

Expected response (shape varies by model/provider):

```json
{ "embeddings": [[...], [...]] }
```

- Files:
  - `app/services/integration/embedding_service.py`

## Image Embeddings (CLIP)

Image vectors are stored in `rag_image_embeddings` with default dimension 768 (ViT-L/14). The indexer currently schedules per-image items and inserts rows via `VectorDBService.insert_image_embeddings`. Text→image retrieval uses cosine on the image embedding table. The current wiring uses a placeholder `image_id` until full image metadata integration lands.

- Files:
  - `scripts/db/002_embeddings.sql`
  - `app/services/integration/vector_db_service.py`
  - `app/services/background/embedding_index_service.py`

## Operational Guidance

Connectivity and Migrations:

- The vector DB service creates a SQLAlchemy engine using `pg_dsn`, verifies connection (`SELECT 1`), and applies idempotent migrations on start. Health probes check connectivity and the `vector` extension.
- `pg_pool_pre_ping` defaults to true to validate pooled connections. `pg_health_interval_s` controls probe cadence. A `pg_reconnect_on_error` flag exists in configuration and may be used by future watchdog logic; the current implementation relies on health checks plus pre-ping.

Postgres/pgvector tips:

- Keep `VACUUM`/`ANALYZE` running and autovacuum tuned for your ingest rate.
- Monitor index sizes and heap stats; `VectorDBService.get_pg_metrics()` returns basic insights that you can export to your monitoring.
- Adjust `hnsw.ef_search` per workload and consider separate indexes per metric/model space if mixing metrics.

## Security and Limits

Server-side rate limits and content clamps protect resources during RAG operations. Query/ingest limits, allowed filesystem roots for CLIP image ingestion, and privacy toggles are configured via `AppConfig` (`rag_query_rate_limit_per_minute`, `rag_ingest_*`, `rag_ingest_allowed_roots`, redaction flags). API endpoints enforce these constraints.

- Files:
  - `app/services/core/app_config.py`
  - `app/api/rag.py`

## End-to-End Flow (Docs)

Synchronous path (RAG service): store document and chunks, embed synchronously via the text model, insert vectors, then query with `similar_document_chunks` or `hybrid_search_documents`.

Streaming path (Indexing service): enqueue documents, chunk, batch-embed, and insert vectors with progress events suitable for SSE-driven UIs. The queue supports pause/resume, retries with exponential backoff, and a dead-letter list.

- Files:
  - `app/services/integration/rag_service.py`
  - `app/services/background/embedding_index_service.py`

## Troubleshooting

- Insert fails with dimension mismatch: make sure your table’s `VECTOR(n)` matches the chosen model, or migrate to the correct dimension.
- Empty or zero vectors in results: during outages the embedder may fall back; check `EmbeddingService` metrics (`requests`, `errors`, `last_ms`) and Ollama health.
- Slow queries: confirm HNSW indexes exist, adjust `hnsw.ef_search`, and run `ANALYZE`. For diagnostics, compare index vs brute-force results via the recall sampling helper.

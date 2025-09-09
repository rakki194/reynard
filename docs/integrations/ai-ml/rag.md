# RAG Chunking & Ingestion

This document outlines the recommended chunking strategies and ingestion pipeline for Retrieval-Augmented Generation (RAG) in YipYap.

## Architecture Overview

YipYap's RAG subsystem is composed of a streaming-friendly indexing service, dedicated embedding services for text and images, a vector database layer backed by Postgres and pgvector, and a thin API. The indexing service coordinates chunking, batching, embedding, and vector upserts with progress events. The text embedding service talks to Ollama's `/api/embed` and preserves input ordering with simple caching, while the OpenCLIP service lazily loads a CLIP backbone and encodes images or text for cross-modal retrieval. The vector database service manages the SQLAlchemy engine, idempotent migrations for enabling the `vector` extension and provisioning tables, and helper queries for both pure vector search and hybrid ranking. The API exposes ingestion, query, and administrative endpoints and enforces rate limits and privacy redaction governed by `AppConfig` and environment overrides.

## Document Chunking

Use semantic-first chunking: split documents by headings and sentences, then group into windows targeting approximately 1000 tokens (minimum 800, maximum 1200), with 10–15% overlap. If semantic segmentation cannot reach the minimum size, fall back to a recursive character splitter (about 4 characters per token).

## Code Chunking

Prefer language-aware parsing (such as tree-sitter) when available. If unavailable, use regex to identify `def`, `class`, and import block boundaries, then build windows of 150–400 lines of code with a 3–5 line overlap. Maintain a simple symbol map (functions, classes, imports) to support highlighting and search.

## Caption Chunking

Chunk captions individually. Optionally, add a grouped "summary" chunk by concatenating the first N captions to support retrieval warm-up and overview queries.

## Token Budgeting

Estimate token counts using a blended heuristic (word counts and ≈4 characters per token). Clamp window sizes to the target range and compute overlap as a fraction of the window size.

## Batching and Idempotency

Batch database upserts for embeddings, using batch sizes of 16–64 depending on model latency. Generate idempotency keys as a hash of source identifiers, chunk content, and model ID. De-duplicate on conflicts. For transient database or network errors, use exponential backoff retries.

## Ingestion Orchestrator

The ingestion service streams progress events, including processed counts, errors, and a final completion summary. It coordinates chunkers, embedding models, and vector upserts.

## Security, Limits, and Privacy Controls

The RAG subsystem includes configurable limits and privacy toggles in `AppConfig` with corresponding env overrides via the config manager. Defaults are chosen for safe operation.

- Rate limits (per user):
  - `rag_query_rate_limit_per_minute` (default 60)
  - `rag_ingest_rate_limit_per_minute` (default 10)
- Request size clamps:
  - `rag_query_topk_max` (default 50)
  - `rag_ingest_max_items_per_request` (default 100)
  - `rag_ingest_max_content_length` (default 50000)
  - `rag_clip_max_items_per_request` (default 100)
- Filesystem sandbox:
  - `rag_ingest_allowed_roots`: list of allowed root directories for ingestion (paths outside are rejected)
- Privacy toggles:
  - `rag_redact_logs` (default true)
  - `rag_redact_highlights` (default true)
- Ops toggles for compliance workflows:
  - `rag_purge_on_disable` (default false)
  - `rag_rebuild_on_enable` (default false)

## Recommended Presets

Documents: target 1000 tokens (min 800, max 1200), overlap 10–15%.  
Code: 150–400 lines of code, overlap 3–5 lines.  
Captions: per-item chunking plus optional summary chunk.

## System Overview

YipYap's RAG stack consists of an ingestion orchestrator, embedding services for text and images, a vector database service backed by Postgres + pgvector, and a thin API layer. Content is chunked according to the presets above, embedded in batches, and upserted into Postgres where HNSW indexes provide fast approximate nearest-neighbor search. Queries embed the input text and retrieve relevant chunks; for images, CLIP text→image retrieval is supported.

Files:

- `app/api/rag.py`
- `app/services/background/embedding_index_service.py`
- `app/services/integration/vector_db_service.py`
- `app/services/integration/embedding_service.py`
- `app/services/integration/clip_embedding_service.py`
- `app/managers/chunking.py`
- `scripts/db/001_pgvector.sql`, `scripts/db/002_embeddings.sql`, `scripts/db/003_indexes.sql`
- `src/composables/useRAG.ts`
- `docs/rag-demo-flows.md`

## Schema and Dimensions

The default schema provisions explicit vector dimensions for each modality. Documents, code, and captions share the same text embedding space and default to `VECTOR(1024)` columns to accommodate common 1,024‑dimensional models such as `mxbai-embed-large` and `bge-m3`, while the CLIP image table defaults to `VECTOR(768)` in line with ViT‑L/14. Each embedding row records `model_id`, the row's actual `dim`, and the `metric` used, which enables operating multiple models concurrently while preserving auditability. Postgres enforces the declared `VECTOR(n)` arity at insert; if you choose a 768‑dimensional text model like `nomic-embed-text` you should either adjust the migration to `VECTOR(768)` or introduce a parallel table or column variant. The service helpers format vectors using a compact literal like `[v1,v2,...]` and cast at insert time for reliable performance. The embedding service maintains a model registry with expected `dim`/`metric` and validates batch inserts accordingly, while the ops metrics endpoint surfaces any declared vs observed dimension mismatches per table.

## API Reference

The API is minimal and streaming-friendly for ingestion.

POST `/api/rag/ingest` accepts a JSON body containing `items` and a text embedding `model`. It validates size clamps and rate limits, then streams NDJSON progress events. A typical event includes processed counts, any error, and a final completion summary with inserted document and embedding counts.

POST `/api/rag/reindex` provides an administrative pathway to regenerate embeddings when models change. It accepts optional filters and runs safely with backpressure.

POST `/api/rag/query` embeds `q` with the configured text or code model depending on `modality` and returns top‑K hits with scores. When image modality is selected, CLIP text→image search is used instead. Results may include minimal highlights depending on privacy redaction toggles.

Role gating enforces that ingestion and reindex operations require admin privileges. Query operations are available to authenticated users and are rate limited per user. Payload redaction is applied in logs when redaction is enabled.

## Data Model and Storage

Documents, code files, and captions are stored alongside their chunk tables with embedding tables per modality. Chunk rows record text, token estimates, and metadata such as symbol boundaries for code. Embedding rows record the model identifier, vector dimension, and metric (cosine). The default text dimensions cover common models such as `mxbai-embed-large` and `bge-m3`. The vector database service performs idempotent migrations to provision `CREATE EXTENSION vector`, core tables, and HNSW indexes.

Similarity search uses pgvector cosine distance and returns a normalized score as `score = 1 - cosine_distance`. At query time, HNSW parameters can be tuned per session for quality/latency trade‑offs.

## Hybrid Retrieval

For text, code, and captions, hybrid ranking combines vector similarity with a text ranking signal, normalized per cohort. The combined score follows \( score = w*{vec} \cdot (1 - dist) + w*{text} \cdot rank \), with defaults favoring vector similarity. Weights are configurable per modality.

## API Contracts and Examples

Ingestion expects a compact body with items containing optional sources and required content along with a model identifier. The server enforces per‑user rate limits and request clamps and emits newline‑delimited JSON objects for responsiveness during scheduling and processing. A minimal request looks like the following and streams events such as enqueued counts, acceptance, errors, and a final completion summary. Querying requires only a string and an optional modality and returns a collection of scored hits ordered by similarity along with an optional correlation identifier for tracing.

```http
POST /api/rag/ingest
Content-Type: application/json

{ "items": [{ "source": "manual", "content": "Some text" }], "model": "mxbai-embed-large" }
```

```http
POST /api/rag/query
Content-Type: application/json

{ "q": "how do I configure vector search?", "modality": "docs", "top_k": 20 }
```

```json
{
  "hits": [
    {
      "id": 123,
      "score": 0.82,
      "highlights": ["vector search"],
      "extra": { "chunk_id": 123 }
    }
  ],
  "total": 1,
  "correlation_id": "..."
}
```

## Vector Indexing and Tuning (pgvector)

HNSW indexes with `vector_cosine_ops` are created for the embedding tables, with `m` and `ef_construction` set to reasonable defaults. Query recall/latency can be tuned via `SET hnsw.ef_search = <value>` per session. Periodic `ANALYZE` keeps planner statistics fresh. For large ingests, batch upserts minimize write amplification. The indexing service includes a best-effort post-batch `ANALYZE` hook that triggers after `RAG_ANALYZE_AFTER_ROWS` inserted rows (0 disables) and can target specific tables via `RAG_ANALYZE_TABLES`. Batch sizes are tunable via `RAG_INGEST_BATCH_SIZE_TEXT` and `RAG_INGEST_BATCH_SIZE_CLIP`. See `docs/embeddings-and-vector-db.md` for SQL examples and additional operational notes.

## Frontend Usage

The SolidJS client `src/composables/useRAG.ts` provides a small NDJSON streaming parser and a client factory for calling the RAG endpoints with the app's authenticated fetch. Ingestion progress is consumed as a stream of events, while queries return structured hits with scores and optional highlights.

## Enablement and Settings

RAG is disabled by default and enabled via configuration. The configuration manager merges `config.json` and environment variables. Set `RAG_ENABLED=true` and provide a `PG_DSN` for the vector database. Default embedding model IDs for text, code, and captions can be set via `RAG_TEXT_MODEL`, `RAG_CODE_MODEL`, and `RAG_CAPTION_MODEL`. Limits include per‑user rate limits for ingest and query, maximum items per request, and maximum content length per item. Privacy toggles control log and highlight redaction. A filesystem sandbox restricts ingestion to allowed root directories for security when ingesting local paths.

## Operational Guidance

Prefer batching for embeddings and database upserts, with batch sizes adjusted to model latency and available CPU/GPU resources. Monitor queue depth, throughput, and error counters in the indexing service, and apply backoff or pause ingestion when necessary. For pgvector, use HNSW indexes for scale and adjust `ef_search` for recall; higher values improve recall at the cost of latency. When changing the default embedding model or dimensions, reindex affected content using the administrative endpoint to keep distances consistent.

## References

General background on retrieval‑augmented generation and multimodal retrieval is available in accessible overviews and ongoing research. For vector indexing in Postgres, consult the pgvector documentation on HNSW parameters and cosine distance. External primers provide practical guidance on chunking strategies, overlap, and hybrid scoring approaches.

## Endpoint Schemas and Streaming Events

Ingestion uses NDJSON streaming for responsiveness under load. The request body for `POST /api/rag/ingest` contains `items` where each item includes an optional `source` and a required `content`, and a `model` string indicating the embedding model. The server enforces rate limits and request clamps and emits newline‑delimited objects such as `{"type":"enqueued","scheduled":<n>,"total":<m>}` while scheduling, followed by `{"type":"accepted","total":<m>}` once all items are accepted. Errors appear as `{"type":"error","error":"..."}` and the response carries an `X-Correlation-ID` header for tracing. Background processing continues after stream completion and can be monitored via the admin status endpoint.

For CLIP image ingestion, `POST /api/rag/clip/ingest_images` accepts `items` with `image_id` and a filesystem `path`, with an optional `batch_size`. When `rag_ingest_allowed_roots` is configured, paths outside the allowlist are rejected. The stream yields per‑item errors and concludes with a `{"type":"complete","inserted":<k>}` summary.

The administrative reindex placeholder at `POST /api/rag/reindex` streams `{"type":"accepted"}` and then `{"type":"complete"}` and is designed to run safely with backpressure once full reindex logic is implemented.

Queries use `POST /api/rag/query` with `{ q, modality, top_k, correlation_id? }` and return `{ hits, total, correlation_id? }`. When `modality` is `images`, the service performs CLIP text→image search and returns hits containing a `score` and additional image metadata under `extra`. For `docs`, `code`, and `captions`, the service embeds the query using the configured model, performs hybrid retrieval with vector‑first ranking, and returns hits with `id` (chunk id), `score`, optional `highlights` when redaction is disabled, and `extra` containing row details.

Administrative controls for the ingestion queue are exposed under `/api/rag/admin/*`, including `pause`, `resume`, `drain`, `status`, `dead_letter`, and `dead_letter/requeue`. Operational controls for the vector database live under `/api/rag/ops/*` and include `metrics`, `set_ef_search`, `analyze`, `vacuum`, `reindex`, and a `recall_sample` endpoint that compares index results to a brute‑force scan to estimate recall for a given query and stores a sample row for later analysis.

## Chunking Implementation Details

Document chunking performs semantic‑first segmentation by markdown‑style headings and sentences, then builds overlapping windows targeting approximately one thousand tokens, with a minimum of eight hundred and a maximum of twelve hundred. When semantic units cannot form a minimum‑sized chunk, it falls back to a recursive character‑based window sized by an approximate four‑characters‑per‑token heuristic. Code chunking prefers language‑aware parsing when available but falls back to a regular‑expression based splitter that identifies `def`, `class`, and import blocks and then assembles windows of roughly one hundred fifty to four hundred lines with a small overlap. A simple symbol map is produced, recording naive function and class names with line numbers and import statements, which can be used to build small, context‑aware highlights. Caption chunking treats each caption as an individual chunk and can add a summary chunk by concatenating the first set of captions to support overview retrieval.

## Hybrid Retrieval Notes

Hybrid ranking combines the cosine‑based vector similarity returned from pgvector with a placeholder textual ranking term to support future integration of BM25 or `ts_rank`. The effective score follows the combined form in the section above, with modality‑specific weights drawn from the configurable settings. In the current implementation, the vector term dominates and the text term is a zero placeholder, which keeps the interface stable while allowing future enhancement without breaking API shape.

## Vector Indexing and Tuning Notes

HNSW indexes are created with `vector_cosine_ops` using defaults `m=16` and `ef_construction=200`. Query‑time recall and latency can be traded by adjusting `hnsw.ef_search` per session; an operational endpoint is available to set this safely at runtime. Default embedding dimensions are one thousand twenty‑four for text, code, and captions and seven hundred sixty‑eight for CLIP image embeddings; when changing model dimensions, plan a migration to update the `VECTOR(N)` column or maintain parallel embedding tables. Periodic `ANALYZE` keeps planner statistics fresh, and routine `VACUUM` and `REINDEX` operations help maintain performance for large indexes. For deeper guidance on parameter trade‑offs, see the pgvector documentation at [pgvector documentation](https://github.com/pgvector/pgvector).

## Frontend Client Usage

The SolidJS client in `src/composables/useRAG.ts` exposes a small NDJSON parser that tolerates both strict JSON and Python‑style dictionary output by sanitizing tokens before parsing. A client factory accepts the app's authenticated fetch and provides `query` for synchronous search and `ingestDocuments` for streaming ingestion with an event callback that receives decoded NDJSON events. For reactive search UIs, `useRAG()` returns `createRAGSearchResource`, which wraps `query` in a Solid resource and manages an `AbortController` to cancel in‑flight requests on parameter changes.

## Enablement and Environment Overrides

RAG enablement requires `rag_enabled` in configuration, typically set via `RAG_ENABLED=true`, and a valid Postgres DSN via `PG_DSN`. The configuration manager also honors environment overrides such as `PG_HEALTH_INTERVAL_S`, `PG_RECONNECT_ON_ERROR`, and `PG_POOL_PRE_PING` to tune connectivity and health‑checking. Default embedding model identifiers can be set with `RAG_TEXT_MODEL`, `RAG_CODE_MODEL`, and `RAG_CAPTION_MODEL`. Image retrieval settings including `rag_clip_model`, `rag_clip_preprocess`, and `rag_clip_multicrop` are available in the application configuration. Privacy and safety controls including `rag_redact_logs`, `rag_redact_highlights`, and the filesystem allowlist for ingestion guard operational use in shared environments.

## Troubleshooting and Operations

Common API errors include `400` when RAG is disabled, `429` when hitting per‑user rate limits for ingestion or querying, and `503` when a dependent service such as the vector database or embedding service is unavailable. For CLIP image ingestion, `403` indicates a path that falls outside configured allowed roots. To tune recall and latency, start by reading baseline metrics from the vector database metrics endpoint, increase `ef_search` gradually while sampling recall with the `recall_sample` endpoint, and periodically analyze or vacuum tables as part of regular maintenance. For large ingests, consider smaller streaming batches and observe queue depth and throughput from the admin status endpoint, pausing or draining when necessary during maintenance.

## Demo Flows

Ingestion can be exercised directly from the SolidJS client or via `curl`. From the UI, use a small helper that calls `ingestDocuments` with a grouped notification for progress and success or error. The streamed events update a single toast with a spinner until completion. For queries, use `createRAGSearchResource` to embed a search box that reactively issues requests and renders results by score, or call `query` imperatively. Screenshots of the query UI and ingest progress can be captured from the RAG panel and included in release notes; the demo GIF at `docs/yipyap_demo_optimized.gif` illustrates the general interaction pattern.

```ts
// Example: streaming ingest with grouped notifications
const rag = useRAG();
const app = useAppContext();
const group = "rag-ingest";
app.notify("Starting ingest…", "info", group, "spinner", 0);
await rag.ingestDocuments(
  [{ source: "manual", content: "Some text" }],
  "mxbai-embed-large",
  (evt) => {
    const processed = evt.processed ?? 0;
    const total = evt.total ?? 0;
    const pct = total > 0 ? Math.round((processed / total) * 100) : undefined;
    app.notify(`Ingest ${processed}/${total}`, "info", group, "spinner", pct);
  },
);
app.notify("Ingest complete", "success", group);
```

```ts
// Example: reactive query resource for a simple search box
const rag = useRAG();
const [params, setParams] = createSignal({ q: "", modality: "docs" as const });
const results = rag.createRAGSearchResource(() => params());
```

## Embedding Model Management

The RAG system includes comprehensive embedding model management capabilities that automatically handle model loading, unloading, and memory optimization. This system transforms the traditional "load once, keep forever" approach into a dynamic, memory-efficient model lifecycle management system.

### Automatic Model Unloading

Embedding models are automatically unloaded based on configurable timeouts to optimize memory usage:

- **Vision Embedding Models (CLIP)**: Automatically unloaded from VRAM after 10 minutes of inactivity, from RAM after 30 minutes
- **Text Embedding Models**: Automatically unloaded from VRAM after 10 minutes of inactivity, from RAM after 30 minutes
- **Memory Pressure Detection**: Models are proactively unloaded when system memory usage exceeds configurable thresholds

### Model Usage Tracking

The system tracks model usage patterns and automatically manages model lifecycles:

- **Usage Monitoring**: Records when models are loaded, used, and last accessed
- **Performance Metrics**: Tracks loading times, inference latency, and memory consumption
- **Automatic Cleanup**: Background task periodically checks for inactive models and unloads them

### Configuration Options

Embedding model management can be configured through environment variables and the configuration system:

```bash
# Enable/disable automatic model unloading
MODEL_USAGE_TRACKER_ENABLED=true

# Timeout settings for vision embedding models (seconds)
MODEL_USAGE_TRACKER_VISION_EMBEDDING_VRAM_TIMEOUT=600
MODEL_USAGE_TRACKER_VISION_EMBEDDING_RAM_TIMEOUT=1800

# Timeout settings for text embedding models (seconds)
MODEL_USAGE_TRACKER_EMBEDDING_MODEL_VRAM_TIMEOUT=600
MODEL_USAGE_TRACKER_EMBEDDING_MODEL_RAM_TIMEOUT=1800

# Cleanup interval (seconds)
MODEL_USAGE_TRACKER_CLEANUP_INTERVAL=60
```

### Management API Endpoints

The system provides comprehensive API endpoints for managing embedding models:

- `POST /api/rag/embedding/unload/{model_type}`: Manually unload models by type (vision/text)
- `GET /api/rag/embedding/status`: Get current loading status and memory usage
- `POST /api/rag/embedding/reload/{model_type}`: Force reload specific model types
- `GET /api/rag/embedding/health`: Get detailed health information for embedding services

### Memory Optimization Features

The embedding model management system includes several memory optimization features:

- **Lazy Loading**: Models are loaded only when first needed, reducing initial memory footprint
- **Smart Preloading**: Frequently used models can be preloaded during idle periods
- **Memory Pressure Response**: Automatic unloading when system memory usage is high
- **Model Switching**: Support for switching between different model variants with automatic cleanup

### Service Integration

Embedding model management integrates seamlessly with existing services:

- **ClipEmbeddingService**: Supports multiple CLIP model variants with automatic unloading
- **EmbeddingService**: Manages Ollama text embedding models with lifecycle tracking
- **ModelUsageTracker**: Centralized tracking and automatic cleanup for all model types
- **Health Monitoring**: Integration with service health checks and metrics collection

For detailed information about embedding model management configuration, API usage, and best practices, see `docs/embedding-model-management.md`.

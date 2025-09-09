# RAG Demo Flows

This document provides a practical ingest walkthrough and a concise hybrid ranking explanation. Query screenshots are pending and will be added once the final search UI is captured.

## Ingest Walkthrough (Streaming NDJSON)

RAG ingestion accepts a compact payload and streams NDJSON events so the UI can present progress in real time. The backend enforces per‑user rate limits, request clamps, and optional privacy redaction.

To ingest a small document set using cURL, provide `items` and a text embedding `model`:

```bash
curl -N -s \
  -H 'Content-Type: application/json' \
  -X POST http://localhost:7001/api/rag/ingest \
  -d '{"items":[{"source":"manual","content":"The quick brown fox jumps over the lazy dog."}],"model":"mxbai-embed-large"}'
```

The response streams newline‑delimited objects like `{ "type": "enqueued", "scheduled": 1, "total": 1 }`, `{ "type": "accepted", "total": 1 }`, and errors if any occur. The frontend client in `src/composables/useRAG.ts` parses these chunks and forwards structured events to the caller.

To wire this into the SolidJS UI with grouped notifications:

```ts
import { useAppContext } from "~/contexts/app";
import { useRAG } from "~/composables/useRAG";

const app = useAppContext();
const rag = useRAG();

const group = "rag-ingest";
app.notify("Starting ingest…", "info", group, "spinner", 0);
await rag.ingestDocuments(
  [{ source: "manual", content: "The quick brown fox…" }],
  "mxbai-embed-large",
  (evt) => {
    const processed = evt.processed ?? 0;
    const total = evt.total ?? 0;
    const percent =
      total > 0 ? Math.round((processed / total) * 100) : undefined;
    app.notify(
      `Ingest ${processed}/${total}`,
      "info",
      group,
      "spinner",
      percent,
    );
    if (evt.type === "error")
      app.notify(evt.error || "Ingest error", "error", group);
  },
);
app.notify("Ingest complete", "success", group);
```

## Hybrid Ranking Explanation

For text, code, and captions, hybrid ranking combines vector similarity from pgvector with a textual ranking signal. Scores are normalized per modality and combined as \( score = w*{vec} \cdot (1 - dist) + w*{text} \cdot rank \). In the current implementation, the text term is a placeholder set to zero while preserving the interface, and vector similarity dominates. The default weights favor vector similarity (docs/code `w_vec=0.7`, `w_text=0.3`; captions `0.8/0.2`). These weights are configurable in `AppConfig` and can be tuned per deployment without changing API contracts.

Vector similarity uses cosine distance and returns a normalized score in \([0,1]\). HNSW indexes accelerate nearest‑neighbor search; recall and latency can be traded by setting `hnsw.ef_search` at session time. When textual ranking (e.g., BM25 or `ts_rank`) is introduced, the API shape will remain compatible and weights will blend both signals coherently.

For images, CLIP text→image retrieval computes cosine similarity in the CLIP space and returns hits with scores. The image embedding table uses `VECTOR(768)` by default (ViT‑L/14), and the text tower or a mapped text embedding is used for compatibility.

## Notes

Ensure RAG is enabled and the Postgres DSN is provided (`RAG_ENABLED=true`, `PG_DSN=…`). See `docs/rag.md` for architecture, schema, and endpoint details, and `docs/notifications.md` for progress notification patterns.

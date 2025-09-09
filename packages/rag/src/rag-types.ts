export type RAGModality = "docs" | "code" | "captions" | "images";

export interface RAGQueryParams {
  q: string;
  modality?: RAGModality;
  topK?: number;
}

export interface RAGQueryHit<TExtra = Record<string, unknown>> {
  id?: number | string;
  score: number;
  highlights?: string[];
  extra?: TExtra;
  // File navigation information
  file_path?: string;
  file_content?: string;
  file_metadata?: Record<string, unknown>;
  chunk_index?: number;
  chunk_text?: string;
  chunk_tokens?: number;
  chunk_metadata?: Record<string, unknown>;
  // Image information
  image_path?: string;
  image_id?: string;
  thumbnail_path?: string;
  preview_path?: string;
  image_metadata?: Record<string, unknown>;
  image_dimensions?: { width: number; height: number };
  image_size?: number;
  image_format?: string;
  embedding_vector?: number[];
}

export interface RAGQueryResponse<TExtra = Record<string, unknown>> {
  hits: RAGQueryHit<TExtra>[];
  total: number;
}

export interface RAGIngestItem {
  source?: string | null;
  content: string;
}

export type RAGStreamEvent = Record<string, unknown> & {
  type?: string;
  processed?: number;
  total?: number;
  failures?: number;
  error?: string;
};

export interface RAGConfig {
  // Core RAG settings
  rag_enabled: boolean;
  pg_dsn?: string;

  // Embedding models
  rag_text_model: string;
  rag_code_model: string;
  rag_caption_model: string;
  rag_clip_model: string;
  rag_clip_preprocess: number;
  rag_clip_multicrop: boolean;

  // Hybrid weights
  rag_w_vec_docs: number;
  rag_w_text_docs: number;
  rag_w_vec_code: number;
  rag_w_text_code: number;
  rag_w_vec_captions: number;
  rag_w_text_captions: number;
  rag_hybrid_normalize: string;

  // Batching and performance
  rag_ingest_batch_size_text: number;
  rag_ingest_batch_size_clip: number;
  rag_analyze_after_rows: number;
  rag_clip_batch_max: number;
  rag_clip_autoscale: boolean;

  // Chunking parameters
  rag_chunk_max_tokens: number;
  rag_chunk_min_tokens: number;
  rag_chunk_overlap_ratio: number;

  // Model-specific token limits
  rag_text_model_max_tokens: number;
  rag_code_model_max_tokens: number;
  rag_caption_model_max_tokens: number;

  // Rate limits and limits
  rag_query_rate_limit_per_minute: number;
  rag_ingest_rate_limit_per_minute: number;
  rag_ingest_queue_max: number;
  rag_ingest_throttle_ms: number;
  rag_query_topk_max: number;
  rag_ingest_max_items_per_request: number;
  rag_ingest_max_content_length: number;
  rag_clip_max_items_per_request: number;

  // Privacy and security
  rag_redact_logs: boolean;
  rag_redact_highlights: boolean;
  rag_purge_on_disable: boolean;
  rag_rebuild_on_enable: boolean;
}

export interface RAGIndexingStatus {
  queue_depth: number;
  in_flight: number;
  processed: number;
  failed: number;
  dead_letter: number;
  avg_latency_ms: number;
  max_lag_s: number;
  paused: boolean;
  workers: number;
  throughput_last_sec: number;
}

export interface RAGMetrics {
  vector_db?: {
    total_rows?: number;
    last_query_ms?: number;
    ef_search?: number;
  };
  clip?: {
    model?: string;
    batch_size?: number;
    autoscale?: boolean;
  };
}

export interface RAGClientOptions {
  authFetch: (input: string | URL, init?: RequestInit) => Promise<Response>;
  configUrl?: string;
  queryUrl?: string;
  ingestUrl?: string;
  adminUrl?: string;
  metricsUrl?: string;
}

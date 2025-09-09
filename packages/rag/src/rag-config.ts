import { RAGConfig, RAGClientOptions } from "./rag-types";

/**
 * Normalizes raw config data with default values
 */
function normalizeRAGConfig(config: Record<string, unknown>): RAGConfig {
  return {
    rag_enabled: Boolean(config.rag_enabled) || false,
    pg_dsn: typeof config.pg_dsn === "string" ? config.pg_dsn : undefined,
    rag_text_model: String(config.rag_text_model || "mxbai-embed-large"),
    rag_code_model: String(config.rag_code_model || "bge-m3"),
    rag_caption_model: String(config.rag_caption_model || "nomic-embed-text"),
    rag_clip_model: String(config.rag_clip_model || "ViT-L-14/openai"),
    rag_clip_preprocess: Number(config.rag_clip_preprocess) || 224,
    rag_clip_multicrop: Boolean(config.rag_clip_multicrop) || false,
    rag_w_vec_docs: Number(config.rag_w_vec_docs) || 0.7,
    rag_w_text_docs: Number(config.rag_w_text_docs) || 0.3,
    rag_w_vec_code: Number(config.rag_w_vec_code) || 0.7,
    rag_w_text_code: Number(config.rag_w_text_code) || 0.3,
    rag_w_vec_captions: Number(config.rag_w_vec_captions) || 0.8,
    rag_w_text_captions: Number(config.rag_w_text_captions) || 0.2,
    rag_hybrid_normalize: String(config.rag_hybrid_normalize || "none"),
    rag_ingest_batch_size_text: Number(config.rag_ingest_batch_size_text) || 16,
    rag_ingest_batch_size_clip: Number(config.rag_ingest_batch_size_clip) || 8,
    rag_analyze_after_rows: Number(config.rag_analyze_after_rows) || 5000,
    rag_clip_batch_max: Number(config.rag_clip_batch_max) || 8,
    rag_clip_autoscale: Boolean(config.rag_clip_autoscale) || true,
    rag_chunk_max_tokens: Number(config.rag_chunk_max_tokens) || 512,
    rag_chunk_min_tokens: Number(config.rag_chunk_min_tokens) || 100,
    rag_chunk_overlap_ratio: Number(config.rag_chunk_overlap_ratio) || 0.15,
    rag_text_model_max_tokens: Number(config.rag_text_model_max_tokens) || 512,
    rag_code_model_max_tokens: Number(config.rag_code_model_max_tokens) || 512,
    rag_caption_model_max_tokens:
      Number(config.rag_caption_model_max_tokens) || 512,
    rag_query_rate_limit_per_minute:
      Number(config.rag_query_rate_limit_per_minute) || 60,
    rag_ingest_rate_limit_per_minute:
      Number(config.rag_ingest_rate_limit_per_minute) || 10,
    rag_ingest_queue_max: Number(config.rag_ingest_queue_max) || 800,
    rag_ingest_throttle_ms: Number(config.rag_ingest_throttle_ms) || 50,
    rag_query_topk_max: Number(config.rag_query_topk_max) || 50,
    rag_ingest_max_items_per_request:
      Number(config.rag_ingest_max_items_per_request) || 100,
    rag_ingest_max_content_length:
      Number(config.rag_ingest_max_content_length) || 50000,
    rag_clip_max_items_per_request:
      Number(config.rag_clip_max_items_per_request) || 100,
    rag_redact_logs: Boolean(config.rag_redact_logs) || true,
    rag_redact_highlights: Boolean(config.rag_redact_highlights) || true,
    rag_purge_on_disable: Boolean(config.rag_purge_on_disable) || false,
    rag_rebuild_on_enable: Boolean(config.rag_rebuild_on_enable) || false,
  };
}

/**
 * Creates a RAG config client for configuration management
 *
 * @param authFetch Authenticated fetch function
 * @param configUrl Config endpoint URL
 * @returns Config client with get/update capabilities
 */
export function createRAGConfigClient(
  authFetch: RAGClientOptions["authFetch"],
  configUrl: string,
) {
  const getConfig = async (): Promise<RAGConfig> => {
    const res = await authFetch(configUrl);
    if (!res.ok) throw new Error(`Failed to get config (${res.status})`);
    const config = await res.json();
    return normalizeRAGConfig(config);
  };

  const updateConfig = async (config: Partial<RAGConfig>): Promise<void> => {
    const res = await authFetch(`${configUrl}/rag`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
    if (!res.ok) throw new Error(`Failed to update RAG config (${res.status})`);
  };

  return { getConfig, updateConfig };
}

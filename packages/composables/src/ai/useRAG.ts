import { Accessor, createResource, onCleanup, createSignal, createEffect } from 'solid-js';

export type RAGModality = 'docs' | 'code' | 'captions' | 'images';

export interface RAGQueryParams {
  q: string;
  modality?: RAGModality;
  topK?: number;
}

export interface RAGQueryHit<TExtra = Record<string, any>> {
  id?: number | string;
  score: number;
  highlights?: string[];
  extra?: TExtra;
  // File navigation information
  file_path?: string;
  file_content?: string;
  file_metadata?: Record<string, any>;
  chunk_index?: number;
  chunk_text?: string;
  chunk_tokens?: number;
  chunk_metadata?: Record<string, any>;
  // Image information
  image_path?: string;
  image_id?: string;
  thumbnail_path?: string;
  preview_path?: string;
  image_metadata?: Record<string, any>;
  image_dimensions?: { width: number; height: number };
  image_size?: number;
  image_format?: string;
  embedding_vector?: number[];
}

export interface RAGQueryResponse<TExtra = Record<string, any>> {
  hits: RAGQueryHit<TExtra>[];
  total: number;
}

export interface RAGIngestItem {
  source?: string | null;
  content: string;
}

export type RAGStreamEvent = Record<string, any> & {
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
  authFetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
  configUrl?: string;
  queryUrl?: string;
  ingestUrl?: string;
  adminUrl?: string;
  metricsUrl?: string;
}

function parseNdjsonChunk(line: string): RAGStreamEvent | null {
  const trimmed = line.trim();
  if (!trimmed) return null;
  
  try {
    return JSON.parse(trimmed);
  } catch {
    // Attempt to sanitize Python dict repr to JSON
    try {
      const sanitized = trimmed
        .replace(/'/g, '"')
        .replace(/\bNone\b/g, 'null')
        .replace(/\bTrue\b/g, 'true')
        .replace(/\bFalse\b/g, 'false');
      return JSON.parse(sanitized);
    } catch {
      return { type: 'raw', raw: trimmed } as any;
    }
  }
}

/**
 * Creates a RAG client for querying and ingesting documents
 * 
 * @param options Configuration options including authFetch function
 * @returns RAG client with query, ingest, and admin capabilities
 */
export function createRAGClient(options: RAGClientOptions) {
  const {
    authFetch,
    configUrl = '/api/config',
    queryUrl = '/api/rag/query',
    ingestUrl = '/api/rag/ingest',
    adminUrl = '/api/rag/admin',
    metricsUrl = '/api/rag/ops/metrics'
  } = options;

  const query = async <TExtra = any>(
    params: RAGQueryParams,
    signal?: AbortSignal
  ): Promise<RAGQueryResponse<TExtra>> => {
    const payload = {
      q: params.q || '',
      modality: params.modality || 'docs',
      top_k: params.topK ?? 20,
    };
    
    const res = await authFetch(queryUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal,
    });
    
    if (!res.ok) throw new Error(`RAG query failed (${res.status})`);
    return (await res.json()) as RAGQueryResponse<TExtra>;
  };

  const ingestDocuments = async (
    items: RAGIngestItem[],
    model: string,
    onEvent?: (evt: RAGStreamEvent) => void,
    signal?: AbortSignal
  ): Promise<void> => {
    const res = await authFetch(ingestUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items, model }),
      signal,
    });
    
    if (!res.ok) throw new Error(`RAG ingest failed (${res.status})`);
    if (!res.body) return;
    
    const reader = (res.body as any).getReader?.();
    const decoder = new TextDecoder();
    let buf = '';
    if (!reader) return;
    
    // Read NDJSON
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      let idx: number;
      while ((idx = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, idx);
        buf = buf.slice(idx + 1);
        const evt = parseNdjsonChunk(line);
        if (evt && onEvent) onEvent(evt);
      }
    }
    if (buf) {
      const evt = parseNdjsonChunk(buf);
      if (evt && onEvent) onEvent(evt);
    }
  };

  const getConfig = async (): Promise<RAGConfig> => {
    const res = await authFetch(configUrl);
    if (!res.ok) throw new Error(`Failed to get config (${res.status})`);
    const config = await res.json();

    // Extract RAG-related config with defaults
    return {
      rag_enabled: config.rag_enabled || false,
      pg_dsn: config.pg_dsn,
      rag_text_model: config.rag_text_model || 'mxbai-embed-large',
      rag_code_model: config.rag_code_model || 'bge-m3',
      rag_caption_model: config.rag_caption_model || 'nomic-embed-text',
      rag_clip_model: config.rag_clip_model || 'ViT-L-14/openai',
      rag_clip_preprocess: config.rag_clip_preprocess || 224,
      rag_clip_multicrop: config.rag_clip_multicrop || false,
      rag_w_vec_docs: config.rag_w_vec_docs || 0.7,
      rag_w_text_docs: config.rag_w_text_docs || 0.3,
      rag_w_vec_code: config.rag_w_vec_code || 0.7,
      rag_w_text_code: config.rag_w_text_code || 0.3,
      rag_w_vec_captions: config.rag_w_vec_captions || 0.8,
      rag_w_text_captions: config.rag_w_text_captions || 0.2,
      rag_hybrid_normalize: config.rag_hybrid_normalize || 'none',
      rag_ingest_batch_size_text: config.rag_ingest_batch_size_text || 16,
      rag_ingest_batch_size_clip: config.rag_ingest_batch_size_clip || 8,
      rag_analyze_after_rows: config.rag_analyze_after_rows || 5000,
      rag_clip_batch_max: config.rag_clip_batch_max || 8,
      rag_clip_autoscale: config.rag_clip_autoscale || true,
      rag_chunk_max_tokens: config.rag_chunk_max_tokens || 512,
      rag_chunk_min_tokens: config.rag_chunk_min_tokens || 100,
      rag_chunk_overlap_ratio: config.rag_chunk_overlap_ratio || 0.15,
      rag_text_model_max_tokens: config.rag_text_model_max_tokens || 512,
      rag_code_model_max_tokens: config.rag_code_model_max_tokens || 512,
      rag_caption_model_max_tokens: config.rag_caption_model_max_tokens || 512,
      rag_query_rate_limit_per_minute: config.rag_query_rate_limit_per_minute || 60,
      rag_ingest_rate_limit_per_minute: config.rag_ingest_rate_limit_per_minute || 10,
      rag_ingest_queue_max: config.rag_ingest_queue_max || 800,
      rag_ingest_throttle_ms: config.rag_ingest_throttle_ms || 50,
      rag_query_topk_max: config.rag_query_topk_max || 50,
      rag_ingest_max_items_per_request: config.rag_ingest_max_items_per_request || 100,
      rag_ingest_max_content_length: config.rag_ingest_max_content_length || 50000,
      rag_clip_max_items_per_request: config.rag_clip_max_items_per_request || 100,
      rag_redact_logs: config.rag_redact_logs || true,
      rag_redact_highlights: config.rag_redact_highlights || true,
      rag_purge_on_disable: config.rag_purge_on_disable || false,
      rag_rebuild_on_enable: config.rag_rebuild_on_enable || false,
    };
  };

  const updateConfig = async (config: Partial<RAGConfig>): Promise<void> => {
    const res = await authFetch(`${configUrl}/rag`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    if (!res.ok) throw new Error(`Failed to update RAG config (${res.status})`);
  };

  const getIndexingStatus = async (): Promise<RAGIndexingStatus> => {
    const res = await authFetch(`${adminUrl}/status`);
    if (!res.ok) throw new Error(`Failed to get indexing status (${res.status})`);
    return await res.json();
  };

  const getMetrics = async (): Promise<RAGMetrics> => {
    const res = await authFetch(metricsUrl);
    if (!res.ok) throw new Error(`Failed to get metrics (${res.status})`);
    return await res.json();
  };

  const admin = {
    pause: async () => {
      const res = await authFetch(`${adminUrl}/pause`, { method: 'POST' });
      if (!res.ok) throw new Error('Pause failed');
      return res.json();
    },
    resume: async () => {
      const res = await authFetch(`${adminUrl}/resume`, { method: 'POST' });
      if (!res.ok) throw new Error('Resume failed');
      return res.json();
    },
    drain: async () => {
      const res = await authFetch(`${adminUrl}/drain`, { method: 'POST' });
      if (!res.ok) throw new Error('Drain failed');
      return res.json();
    },
    clearAllData: async () => {
      const res = await authFetch(`${adminUrl}/clear-all-data`, { method: 'POST' });
      if (!res.ok) throw new Error('Clear all data failed');
      return res.json();
    },
    status: async () => {
      const res = await authFetch(`${adminUrl}/status`, { method: 'GET' });
      if (!res.ok) throw new Error('Status failed');
      return res.json();
    },
    deadLetter: async () => {
      const res = await authFetch(`${adminUrl}/dead_letter`, { method: 'GET' });
      if (!res.ok) throw new Error('Dead-letter failed');
      return res.json();
    },
    requeueDeadLetter: async () => {
      const res = await authFetch(`${adminUrl}/dead_letter/requeue`, { method: 'POST' });
      if (!res.ok) throw new Error('Requeue failed');
      return res.json();
    },
  };

  return {
    query,
    ingestDocuments,
    admin,
    getConfig,
    updateConfig,
    getIndexingStatus,
    getMetrics,
  };
}

/**
 * RAG composable for SolidJS applications
 * 
 * @param options Configuration options including authFetch function
 * @returns RAG client with reactive resources and utilities
 */
export function useRAG(options: RAGClientOptions) {
  const client = createRAGClient(options);

  // Create reactive resources for config and status
  const [config, { refetch: refetchConfig }] = createResource<RAGConfig>(() => client.getConfig());
  const [indexingStatus, { refetch: refetchIndexingStatus }] = createResource<RAGIndexingStatus>(() =>
    client.getIndexingStatus()
  );
  const [metrics, { refetch: refetchMetrics }] = createResource<RAGMetrics>(() => client.getMetrics());

  // Auto-refresh status every 5 seconds
  const [statusRefreshInterval, setStatusRefreshInterval] = createSignal<NodeJS.Timeout | null>(null);

  createEffect(() => {
    if (config()?.rag_enabled) {
      // Start auto-refresh when RAG is enabled
      const interval = setInterval(() => {
        try {
          refetchIndexingStatus();
          refetchMetrics();
        } catch (error) {
          // Silently handle errors in auto-refresh to avoid console spam
          console.debug('RAG auto-refresh error:', error);
        }
      }, 5000);
      setStatusRefreshInterval(interval);

      onCleanup(() => {
        if (interval) clearInterval(interval);
      });
    } else {
      // Stop auto-refresh when RAG is disabled
      if (statusRefreshInterval()) {
        clearInterval(statusRefreshInterval()!);
        setStatusRefreshInterval(null);
      }
    }
  });

  /**
   * Creates a reactive search resource that automatically queries when parameters change
   * 
   * @param params Accessor that returns query parameters or null
   * @returns Resource that contains search results
   */
  function createRAGSearchResource<TExtra = any>(params: Accessor<RAGQueryParams | null>) {
    let controller: AbortController | null = null;
    let lastParamsKey: string | null = null;

    const [data] = createResource<RAGQueryResponse<TExtra> | null, RAGQueryParams | null>(
      () => {
        const p = params();
        if (!p || !p.q?.trim()) return null;

        // Create a stable key for the parameters
        const paramsKey = JSON.stringify({ q: p.q, modality: p.modality, topK: p.topK });

        // Only return new params if they've actually changed
        if (paramsKey === lastParamsKey) {
          return null; // Return null to prevent re-fetch
        }

        lastParamsKey = paramsKey;
        return p;
      },
      async p => {
        if (!p || !p.q?.trim()) return { hits: [], total: 0 } as any;

        if (controller) {
          controller.abort();
        }
        controller = new AbortController();
        
        try {
          const result = await client.query<TExtra>(p, controller.signal);
          return result;
        } catch (error) {
          // Only log the error if it's not an abort error
          if (
            error instanceof Error &&
            error.name !== 'AbortError' &&
            error.name !== 'DOMException' &&
            error.message !== 'The operation was aborted.'
          ) {
            console.error('RAG query error:', error);
          }
          throw error;
        } finally {
          controller = null;
        }
      }
    );
    
    onCleanup(() => controller?.abort());
    return data;
  }

  return {
    ...client,
    createRAGSearchResource,
    config,
    indexingStatus,
    metrics,
    refreshStatus: () => {
      refetchIndexingStatus();
      refetchMetrics();
    },
    refreshConfig: refetchConfig,
  };
}
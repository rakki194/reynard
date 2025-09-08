import { RAGQueryParams, RAGQueryResponse, RAGClientOptions } from './rag-types';

/**
 * Creates a RAG query client for searching documents
 * 
 * @param authFetch Authenticated fetch function
 * @param queryUrl Query endpoint URL
 * @returns Query client with search capabilities
 */
export function createRAGQueryClient(authFetch: RAGClientOptions['authFetch'], queryUrl: string) {
  const query = async <TExtra = Record<string, unknown>>(
    params: RAGQueryParams,
    signal?: globalThis.AbortSignal
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

  return { query };
}

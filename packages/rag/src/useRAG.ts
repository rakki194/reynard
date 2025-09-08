import { createResource } from 'solid-js';
import { createRAGClient } from './rag-client';

// Import types
import type { 
  RAGClientOptions, 
  RAGConfig, 
  RAGIndexingStatus, 
  RAGMetrics, 
  RAGQueryParams 
} from './rag-types';

// Re-export all types
export * from './rag-types';

// Re-export the createRAGClient from the modular implementation
export { createRAGClient };

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

  return {
    ...client,
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
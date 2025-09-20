import { RAGClientOptions } from "./rag-types";
import { createRAGQueryClient } from "./rag-query";
import { createRAGIngestClient } from "./rag-ingest";
import { createRAGConfigClient } from "./rag-config";
import { createRAGAdminClient } from "./rag-admin";

/**
 * Creates a RAG client for querying and ingesting documents
 *
 * @param options Configuration options including authFetch function
 * @returns RAG client with query, ingest, and admin capabilities
 */
export function createRAGClient(options: RAGClientOptions) {
  const {
    authFetch,
    configUrl = "/api/config",
    queryUrl = "/api/rag/query",
    ingestUrl = "/api/rag/ingest",
    adminUrl = "/api/rag/admin",
    metricsUrl = "/api/rag/ops/metrics",
  } = options;

  // Create specialized clients
  const queryClient = createRAGQueryClient(authFetch, queryUrl);
  const ingestClient = createRAGIngestClient(authFetch, ingestUrl);
  const configClient = createRAGConfigClient(authFetch, configUrl);
  const adminClient = createRAGAdminClient(authFetch, adminUrl, metricsUrl);

  // Compose the full client interface
  return {
    query: queryClient.query,
    ingestDocuments: ingestClient.ingestDocuments,
    getConfig: configClient.getConfig,
    updateConfig: configClient.updateConfig,
    getIndexingStatus: adminClient.getIndexingStatus,
    getMetrics: adminClient.getMetrics,
    admin: adminClient.admin,
  };
}

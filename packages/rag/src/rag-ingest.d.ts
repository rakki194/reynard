import { RAGIngestItem, RAGStreamEvent, RAGClientOptions } from "./rag-types";
/**
 * Creates a RAG ingest client for document ingestion
 *
 * @param authFetch Authenticated fetch function
 * @param ingestUrl Ingest endpoint URL
 * @returns Ingest client with document processing capabilities
 */
export declare function createRAGIngestClient(authFetch: RAGClientOptions["authFetch"], ingestUrl: string): {
    ingestDocuments: (items: RAGIngestItem[], model: string, onEvent?: (evt: RAGStreamEvent) => void, signal?: globalThis.AbortSignal) => Promise<void>;
};

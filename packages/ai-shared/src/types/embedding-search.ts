/**
 * Embedding and Vector Search Types
 * 
 * Defines types for embedding generation, vector search operations,
 * and RAG (Retrieval-Augmented Generation) functionality within the Reynard framework.
 */

export interface EmbeddingResult {
  id: string
  content: string
  embedding: number[]
  metadata: Record<string, any>
  createdAt: Date
}

export interface SearchResult {
  id: string
  content: string
  similarity: number
  metadata: Record<string, any>
}

export interface IndexItem {
  id: string
  content: string
  contentType: string
  metadata: Record<string, any>
}

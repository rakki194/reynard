/**
 * Generated API client types and classes
 * This is a temporary stub until the backend is running and OpenAPI generation is complete
 */

// Temporary stub types
export interface Configuration {
  basePath?: string;
  timeout?: number;
  fetchApi?: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
}

export class Configuration {
  constructor(config: Configuration) {
    // Stub implementation
  }
}

export class DefaultApi {
  constructor(config: Configuration) {
    // Stub implementation
  }

  // RAG endpoints
  ragQueryPost = async (data: any) => ({ data: [] });
  ragIngestPost = async (data: any) => ({ data: {} });
  ragStatsGet = async () => ({ data: {} });
  ragDocumentsGet = async () => ({ data: [] });

  // Caption endpoints
  captionGeneratePost = async (data: any) => ({ data: {} });
  captionBatchGeneratePost = async (data: any) => ({ data: [] });
  captionGeneratorsGet = async () => ({ data: [] });
  captionUploadPost = async (data: any) => ({ data: {} });

  // Chat endpoints
  ollamaChatPost = async (data: any) => ({ data: {} });
  ollamaChatStreamPost = async (data: any) => ({ data: {} });
  ollamaAssistantPost = async (data: any) => ({ data: {} });
  ollamaAssistantStreamPost = async (data: any) => ({ data: {} });

  // Auth endpoints
  authLoginPost = async (data: any) => ({ data: {} });
  authRegisterPost = async (data: any) => ({ data: {} });
  authRefreshPost = async (data: any) => ({ data: {} });
  authLogoutPost = async (data: any) => ({ data: {} });
  authMeGet = async () => ({ data: {} });

  // Health endpoint
  apiHealthGet = async () => ({ data: { status: 'ok' } });
}

// Export types that might be used
export interface RAGQueryRequest {
  query: string;
  limit?: number;
}

export interface RAGQueryResponse {
  results: Array<{
    document: string;
    score: number;
    metadata?: any;
  }>;
}

export interface RAGDocument {
  id: string;
  title: string;
  content: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface RAGStats {
  total_documents: number;
  total_chunks: number;
  last_updated: string;
}

export interface CaptionRequest {
  image_url: string;
  model?: string;
}

export interface CaptionResponse {
  caption: string;
  confidence?: number;
}

export interface GeneratorInfo {
  name: string;
  description: string;
  supported_formats: string[];
}

export interface OllamaChatRequest {
  message: string;
  model?: string;
  context?: any;
}

export interface OllamaChatResponse {
  response: string;
  context?: any;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  created_at: string;
}

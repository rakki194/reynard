/**
 * Main API client factory for Reynard
 */

import { DefaultApi, Configuration } from './generated/index.js';
import type { AuthFetchOptions, AuthFetch } from './types.js';

export interface ReynardApiClientConfig {
  basePath?: string;
  authFetch?: AuthFetch;
  timeout?: number;
}

/**
 * Creates a configured Reynard API client
 */
export function createReynardApiClient(config: ReynardApiClientConfig = {}) {
  const {
    basePath = 'http://localhost:8000',
    authFetch,
    timeout = 30000
  } = config;

  // Create configuration
  const apiConfig = new Configuration({
    basePath,
    timeout,
    fetchApi: authFetch || fetch
  });

  // Create API client
  const api = new DefaultApi(apiConfig);

  return {
    api,
    config: apiConfig,
    
    // Convenience methods
    rag: {
      query: api.ragQueryPost.bind(api),
      ingest: api.ragIngestPost.bind(api),
      stats: api.ragStatsGet.bind(api),
      documents: api.ragDocumentsGet.bind(api)
    },
    
    caption: {
      generate: api.captionGeneratePost.bind(api),
      batchGenerate: api.captionBatchGeneratePost.bind(api),
      generators: api.captionGeneratorsGet.bind(api),
      upload: api.captionUploadPost.bind(api)
    },
    
    chat: {
      send: api.ollamaChatPost.bind(api),
      stream: api.ollamaChatStreamPost.bind(api),
      assistant: api.ollamaAssistantPost.bind(api),
      assistantStream: api.ollamaAssistantStreamPost.bind(api)
    },
    
    auth: {
      login: api.authLoginPost.bind(api),
      register: api.authRegisterPost.bind(api),
      refresh: api.authRefreshPost.bind(api),
      logout: api.authLogoutPost.bind(api),
      me: api.authMeGet.bind(api)
    },
    
    health: api.apiHealthGet.bind(api)
  };
}

export type ReynardApiClient = ReturnType<typeof createReynardApiClient>;

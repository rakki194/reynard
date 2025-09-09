/**
 * Main API client factory for Reynard
 */

import { DefaultApi, Configuration, RagApi, CaptionApi, CaptionUploadApi, OllamaApi, AuthenticationApi } from './generated/index.js';
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
    fetchApi: authFetch || fetch
  });

  // Create API clients
  const defaultApi = new DefaultApi(apiConfig);
  const ragApi = new RagApi(apiConfig);
  const captionApi = new CaptionApi(apiConfig);
  const captionUploadApi = new CaptionUploadApi(apiConfig);
  const ollamaApi = new OllamaApi(apiConfig);
  const authApi = new AuthenticationApi(apiConfig);

  return {
    api: defaultApi,
    config: apiConfig,
    
    // Convenience methods
    rag: {
      query: ragApi.queryRagApiRagApiRagQueryPost.bind(ragApi),
      ingest: ragApi.ingestDocumentsApiRagApiRagIngestPost.bind(ragApi),
      stats: ragApi.getRagStatsApiRagApiRagAdminStatsGet.bind(ragApi),
      documents: ragApi.getRagConfigApiRagApiRagConfigGet.bind(ragApi)
    },
    
    caption: {
      generate: captionApi.generateCaptionApiCaptionGeneratePost.bind(captionApi),
      batchGenerate: captionApi.generateBatchCaptionsApiCaptionBatchPost.bind(captionApi),
      generators: captionApi.getAvailableGeneratorsApiCaptionGeneratorsGet.bind(captionApi),
      upload: captionUploadApi.uploadAndGenerateCaptionApiCaptionUploadPost.bind(captionUploadApi)
    },
    
    chat: {
      send: ollamaApi.chatApiOllamaChatPost.bind(ollamaApi),
      stream: ollamaApi.chatStreamApiOllamaChatStreamPost.bind(ollamaApi),
      assistant: ollamaApi.assistantChatApiOllamaAssistantPost.bind(ollamaApi),
      assistantStream: ollamaApi.assistantChatStreamApiOllamaAssistantStreamPost.bind(ollamaApi)
    },
    
    auth: {
      login: authApi.loginApiAuthLoginPost.bind(authApi),
      register: authApi.registerApiAuthRegisterPost.bind(authApi),
      refresh: authApi.refreshTokenApiAuthRefreshPost.bind(authApi),
      logout: authApi.logoutApiAuthLogoutPost.bind(authApi),
      me: authApi.getCurrentUserInfoApiAuthMeGet.bind(authApi)
    },
    
    health: defaultApi.healthCheckApiHealthGet.bind(defaultApi)
  };
}

export type ReynardApiClient = ReturnType<typeof createReynardApiClient>;

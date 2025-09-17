"use strict";
/**
 * Main API client factory for Reynard
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReynardApiClient = createReynardApiClient;
var index_js_1 = require("./generated/index.js");
/**
 * Creates a configured Reynard API client
 */
function createReynardApiClient(config) {
    if (config === void 0) { config = {}; }
    var _a = config.basePath, basePath = _a === void 0 ? "http://localhost:8000" : _a, authFetch = config.authFetch, _b = config.timeout, timeout = _b === void 0 ? 30000 : _b;
    // Create configuration
    var apiConfig = new index_js_1.Configuration({
        basePath: basePath,
        fetchApi: authFetch || fetch,
    });
    // Create API clients
    var defaultApi = new index_js_1.DefaultApi(apiConfig);
    var ragApi = new index_js_1.RagApi(apiConfig);
    var captionApi = new index_js_1.CaptionApi(apiConfig);
    var captionUploadApi = new index_js_1.CaptionUploadApi(apiConfig);
    var ollamaApi = new index_js_1.OllamaApi(apiConfig);
    var authApi = new index_js_1.AuthenticationApi(apiConfig);
    return {
        api: defaultApi,
        config: apiConfig,
        // Convenience methods
        rag: {
            query: ragApi.queryRagApiRagApiRagQueryPost.bind(ragApi),
            ingest: ragApi.ingestDocumentsApiRagApiRagIngestPost.bind(ragApi),
            stats: ragApi.getRagStatsApiRagApiRagAdminStatsGet.bind(ragApi),
            documents: ragApi.getRagConfigApiRagApiRagConfigGet.bind(ragApi),
        },
        caption: {
            generate: captionApi.generateCaptionApiCaptionGeneratePost.bind(captionApi),
            batchGenerate: captionApi.generateBatchCaptionsApiCaptionBatchPost.bind(captionApi),
            generators: captionApi.getAvailableGeneratorsApiCaptionGeneratorsGet.bind(captionApi),
            upload: captionUploadApi.uploadAndGenerateCaptionApiCaptionUploadPost.bind(captionUploadApi),
        },
        chat: {
            send: ollamaApi.chatApiOllamaChatPost.bind(ollamaApi),
            stream: ollamaApi.chatStreamApiOllamaChatStreamPost.bind(ollamaApi),
            assistant: ollamaApi.assistantChatApiOllamaAssistantPost.bind(ollamaApi),
            assistantStream: ollamaApi.assistantChatStreamApiOllamaAssistantStreamPost.bind(ollamaApi),
        },
        auth: {
            login: authApi.loginApiAuthLoginPost.bind(authApi),
            register: authApi.registerApiAuthRegisterPost.bind(authApi),
            refresh: authApi.refreshTokensApiAuthRefreshPost.bind(authApi),
            logout: authApi.logoutApiAuthLogoutPost.bind(authApi),
            me: authApi.getCurrentUserInfoApiAuthMeGet.bind(authApi),
        },
        health: defaultApi.healthCheckApiHealthGet.bind(defaultApi),
    };
}

/**
 * Main API client factory for Reynard
 */
import { Configuration } from "./generated/index.js";
import type { AuthFetch } from "./types.js";
export interface ReynardApiClientConfig {
    basePath?: string;
    authFetch?: AuthFetch;
    timeout?: number;
}
/**
 * Creates a configured Reynard API client
 */
export declare function createReynardApiClient(config?: ReynardApiClientConfig): {
    api: any;
    config: Configuration;
    rag: {
        query: (requestParameters: import("./index.js").QueryRagApiRagApiRagQueryPostRequest, initOverrides?: RequestInit | import("./index.js").InitOverrideFunction) => Promise<import("./index.js").RAGQueryResponse>;
        ingest: (requestParameters: import("./index.js").IngestDocumentsApiRagApiRagIngestPostRequest, initOverrides?: RequestInit | import("./index.js").InitOverrideFunction) => Promise<import("./index.js").RAGIngestResponse>;
        stats: (initOverrides?: RequestInit | import("./index.js").InitOverrideFunction) => Promise<import("./index.js").RAGStatsResponse>;
        documents: (initOverrides?: RequestInit | import("./index.js").InitOverrideFunction) => Promise<import("./index.js").RAGConfigResponse>;
    };
    caption: {
        generate: (requestParameters: import("./index.js").GenerateCaptionApiCaptionGeneratePostRequest, initOverrides?: RequestInit | import("./index.js").InitOverrideFunction) => Promise<import("./index.js").CaptionResponse>;
        batchGenerate: (requestParameters: import("./index.js").GenerateBatchCaptionsApiCaptionBatchPostRequest, initOverrides?: RequestInit | import("./index.js").InitOverrideFunction) => Promise<Array<import("./index.js").CaptionResponse>>;
        generators: (initOverrides?: RequestInit | import("./index.js").InitOverrideFunction) => Promise<{
            [key: string]: import("./index.js").GeneratorInfo;
        }>;
        upload: (requestParameters: import("./index.js").UploadAndGenerateCaptionApiCaptionUploadPostRequest, initOverrides?: RequestInit | import("./index.js").InitOverrideFunction) => Promise<import("./index.js").CaptionResponse>;
    };
    chat: {
        send: (requestParameters: import("./index.js").ChatApiOllamaChatPostRequest, initOverrides?: RequestInit | import("./index.js").InitOverrideFunction) => Promise<import("./index.js").OllamaChatResponse>;
        stream: (requestParameters: import("./index.js").ChatStreamApiOllamaChatStreamPostRequest, initOverrides?: RequestInit | import("./index.js").InitOverrideFunction) => Promise<any>;
        assistant: (requestParameters: import("./index.js").AssistantChatApiOllamaAssistantPostRequest, initOverrides?: RequestInit | import("./index.js").InitOverrideFunction) => Promise<import("./index.js").OllamaAssistantResponse>;
        assistantStream: (requestParameters: import("./index.js").AssistantChatStreamApiOllamaAssistantStreamPostRequest, initOverrides?: RequestInit | import("./index.js").InitOverrideFunction) => Promise<any>;
    };
    auth: {
        login: (requestParameters: import("./index.js").LoginApiAuthLoginPostRequest, initOverrides?: RequestInit | import("./index.js").InitOverrideFunction) => Promise<import("./index.js").TokenResponse>;
        register: (requestParameters: import("./index.js").RegisterApiAuthRegisterPostRequest, initOverrides?: RequestInit | import("./index.js").InitOverrideFunction) => Promise<import("./index.js").UserPublic>;
        refresh: any;
        logout: (requestParameters: import("./index.js").LogoutApiAuthLogoutPostRequest, initOverrides?: RequestInit | import("./index.js").InitOverrideFunction) => Promise<any>;
        me: (initOverrides?: RequestInit | import("./index.js").InitOverrideFunction) => Promise<import("./index.js").UserPublic>;
    };
    health: any;
};
export type ReynardApiClient = ReturnType<typeof createReynardApiClient>;

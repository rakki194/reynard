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
        query: any;
        ingest: any;
        stats: any;
        documents: any;
    };
    caption: {
        generate: any;
        batchGenerate: any;
        generators: any;
        upload: any;
    };
    chat: {
        send: any;
        stream: any;
        assistant: any;
        assistantStream: any;
    };
    auth: {
        login: any;
        register: any;
        refresh: any;
        logout: any;
        me: any;
    };
    health: any;
};
export type ReynardApiClient = ReturnType<typeof createReynardApiClient>;

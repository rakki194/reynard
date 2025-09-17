/**
 * Chat composable for Reynard API
 */
import type { OllamaChatRequest, OllamaChatResponse } from "../generated/index.js";
export interface UseChatOptions {
    basePath?: string;
}
export declare function useChat(options?: UseChatOptions): {
    isLoading: import("solid-js").Accessor<boolean>;
    sendMessage: (request: OllamaChatRequest) => Promise<OllamaChatResponse>;
    getModels: () => Promise<string[]>;
};

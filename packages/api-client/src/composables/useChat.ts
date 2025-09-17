/**
 * Chat composable for Reynard API
 */

import { createSignal } from "solid-js";
import type { OllamaChatRequest, OllamaChatResponse } from "../generated/index.js";

export interface UseChatOptions {
  basePath?: string;
}

export function useChat(options: UseChatOptions = {}) {
  const [isLoading, setIsLoading] = createSignal(false);

  const sendMessage = async (request: OllamaChatRequest): Promise<OllamaChatResponse> => {
    setIsLoading(true);
    try {
      // Stub implementation
      console.log("Sending chat message:", request);
      return {
        success: true,
        response: "This is a stub response",
        model: request.model || "llama3.1",
        processingTime: 1.0,
      };
    } finally {
      setIsLoading(false);
    }
  };

  const getModels = async (): Promise<string[]> => {
    // Stub implementation
    return ["llama3", "mistral", "codellama"];
  };

  return {
    isLoading,
    sendMessage,
    getModels,
  };
}

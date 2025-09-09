/**
 * Main chat composable for Reynard Chat System
 *
 * Orchestrates focused composables to provide comprehensive state management
 * and streaming functionality for chat applications.
 */

import { createSignal, createResource, onCleanup, onMount } from "solid-js";
import { useChatMessages } from "./useChatMessages";
import { useChatStreaming } from "./useChatStreaming";
import { useChatTools } from "./useChatTools";
import { useChat as useGeneratedChat, createReynardApiClient } from "reynard-api-client";
import type { ChatState, ChatActions, UseChatReturn } from "../types";

export interface UseChatOptions {
  /** Chat service endpoint */
  endpoint?: string;
  /** Authentication headers */
  authHeaders?: Record<string, string>;
  /** Initial configuration */
  config?: Partial<ChatState["config"]>;
  /** Available tools */
  tools?: any[];
  /** Initial messages */
  initialMessages?: any[];
  /** Auto-connect on mount */
  autoConnect?: boolean;
  /** Custom fetch function */
  fetchFn?: typeof fetch;
  /** Reconnection options */
  reconnection?: {
    enabled: boolean;
    maxAttempts: number;
    delay: number;
    backoff: number;
  };
}

const DEFAULT_CONFIG: ChatState["config"] = {
  enableThinking: true,
  enableTools: true,
  autoScroll: true,
  showTimestamps: true,
  showTokenCounts: false,
  maxHistoryLength: 100,
};

const DEFAULT_RECONNECTION = {
  enabled: true,
  maxAttempts: 3,
  delay: 1000,
  backoff: 2,
};

export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const {
    endpoint = "/api/chat",
    authHeaders = {},
    config: userConfig = {},
    tools = [],
    initialMessages = [],
    autoConnect = true,
    fetchFn = fetch,
    reconnection = DEFAULT_RECONNECTION,
  } = options;

  // Create API client
  const apiClient = createReynardApiClient({
    basePath: endpoint.replace('/api/chat', ''),
    authFetch: fetchFn
  });

  // Use generated chat composable
  const generatedChat = useGeneratedChat({
    apiClient,
    defaultModel: "llama3.1"
  });

  // Core state
  const [availableModels] = createSignal<string[]>([]);
  const [selectedModel] = createSignal<string>();
  const [connectionState, setConnectionState] =
    createSignal<ChatState["connectionState"]>("disconnected");
  const [error, setError] = createSignal<ChatState["error"]>();
  const [config, setConfig] = createSignal<ChatState["config"]>({
    ...DEFAULT_CONFIG,
    ...userConfig,
  });

  // Reconnection state
  const [reconnectionAttempts, setReconnectionAttempts] = createSignal(0);

  // Initialize focused composables
  const messagesComposable = useChatMessages({
    initialMessages,
    maxHistoryLength: config().maxHistoryLength,
  });

  const toolsComposable = useChatTools({
    tools,
  });

  const streamingComposable = useChatStreaming(
    {
      fetchFn,
      authHeaders,
      endpoint,
    },
    {
      addMessage: messagesComposable.addMessage,
      updateMessage: messagesComposable.updateMessage,
      messages: messagesComposable.messages,
    },
  );

  // Resource for checking connection
  const [connectionCheck] = createResource(
    () => endpoint,
    async (url) => {
      try {
        const response = await fetchFn(`${url}/health`, {
          headers: authHeaders,
        });
        return response.ok;
      } catch {
        return false;
      }
    },
  );

  // Update configuration
  const updateConfig = (newConfig: Partial<ChatState["config"]>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
  };

  // Connect to chat service
  const connect = async () => {
    setConnectionState("connecting");

    try {
      const isHealthy = await connectionCheck();
      setConnectionState(isHealthy ? "connected" : "error");
      setReconnectionAttempts(0);
    } catch {
      setConnectionState("error");

      if (
        reconnection.enabled &&
        reconnectionAttempts() < reconnection.maxAttempts
      ) {
        setTimeout(
          () => {
            setReconnectionAttempts((prev) => prev + 1);
            connect();
          },
          reconnection.delay *
            Math.pow(reconnection.backoff, reconnectionAttempts()),
        );
      }
    }
  };

  // Disconnect from chat service
  const disconnect = () => {
    streamingComposable.cancelStreaming();
    setConnectionState("disconnected");
  };

  // Auto-connect on mount
  onMount(() => {
    if (autoConnect) {
      connect();
    }
  });

  // Cleanup on unmount
  onCleanup(() => {
    streamingComposable.cancelStreaming();
  });

  // Actions object - integrate with generated chat composable
  const actions: ChatActions = {
    sendMessage: async (message: string) => {
      try {
        await generatedChat.sendMessage(message, selectedModel());
      } catch (err) {
        setError({
          type: "send_error",
          message: err instanceof Error ? err.message : "Send failed",
          timestamp: Date.now(),
          recoverable: true
        });
      }
    },
    cancelStreaming: streamingComposable.cancelStreaming,
    clearConversation: () => {
      messagesComposable.clearConversation();
      generatedChat.clearMessages();
    },
    retryLastMessage: streamingComposable.retryLastMessage,
    updateConfig,
    connect,
    disconnect,
    exportConversation: messagesComposable.exportConversation,
    importConversation: messagesComposable.importConversation,
  };

  // Return chat state and actions - integrate generated chat state
  return {
    messages: () => {
      // Merge legacy messages with generated chat messages
      const legacyMessages = messagesComposable.messages();
      const generatedMessages = generatedChat.messages();
      return [...legacyMessages, ...generatedMessages];
    },
    currentMessage: messagesComposable.currentMessage,
    isStreaming: () => generatedChat.isStreaming() || streamingComposable.isStreaming(),
    isThinking: streamingComposable.isThinking,
    availableModels: () => generatedChat.models() || availableModels(),
    selectedModel,
    availableTools: toolsComposable.availableTools,
    connectionState,
    error: () => generatedChat.error() || error(),
    config,
    actions,
  };
}

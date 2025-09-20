/**
 * Chat Messages Composable
 *
 * Handles message management including adding, updating, and clearing messages
 */

import { createSignal, batch } from "solid-js";
import type { ChatMessage, ChatState } from "../types";

export interface UseChatMessagesOptions {
  /** Initial messages */
  initialMessages?: ChatMessage[];
  /** Maximum history length */
  maxHistoryLength?: number;
}

export interface UseChatMessagesReturn {
  messages: () => ChatMessage[];
  currentMessage: () => ChatMessage | undefined;
  setCurrentMessage: (message: ChatMessage | undefined) => void;
  addMessage: (message: Omit<ChatMessage, "id" | "timestamp">) => ChatMessage;
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void;
  clearConversation: () => void;
  exportConversation: (format: "json" | "markdown" | "txt") => string;
  importConversation: (data: string, format: "json") => void;
}

export function useChatMessages(options: UseChatMessagesOptions = {}): UseChatMessagesReturn {
  const { initialMessages = [], maxHistoryLength = 100 } = options;

  // Core message state
  const [messages, setMessages] = createSignal<ChatMessage[]>(initialMessages);
  const [currentMessage, setCurrentMessage] = createSignal<ChatMessage | undefined>();

  // Generate unique message ID
  const generateMessageId = (): string => {
    return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Add a new message to the conversation
  const addMessage = (message: Omit<ChatMessage, "id" | "timestamp">): ChatMessage => {
    const newMessage: ChatMessage = {
      id: generateMessageId(),
      timestamp: Date.now(),
      ...message,
    };

    batch(() => {
      setMessages(prev => {
        const updated = [...prev, newMessage];
        return updated.length > maxHistoryLength ? updated.slice(-maxHistoryLength) : updated;
      });
    });

    return newMessage;
  };

  // Update an existing message
  const updateMessage = (id: string, updates: Partial<ChatMessage>) => {
    setMessages(prev => prev.map(msg => (msg.id === id ? { ...msg, ...updates } : msg)));
  };

  // Clear conversation
  const clearConversation = () => {
    batch(() => {
      setMessages([]);
      setCurrentMessage(undefined);
    });
  };

  // Export conversation
  const exportConversation = (format: "json" | "markdown" | "txt"): string => {
    const msgs = messages();

    switch (format) {
      case "json":
        return JSON.stringify(msgs, null, 2);

      case "markdown":
        return msgs
          .map(msg => {
            const timestamp = new Date(msg.timestamp).toLocaleString();
            const role = msg.role === "user" ? "**User**" : "**Assistant**";
            return `## ${role} (${timestamp})\n\n${msg.content}\n\n---\n`;
          })
          .join("\n");

      case "txt":
        return msgs
          .map(msg => {
            const timestamp = new Date(msg.timestamp).toLocaleString();
            return `[${timestamp}] ${msg.role.toUpperCase()}: ${msg.content}`;
          })
          .join("\n\n");

      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  };

  // Import conversation
  const importConversation = (data: string, format: "json") => {
    switch (format) {
      case "json":
        try {
          const importedMessages = JSON.parse(data) as ChatMessage[];
          setMessages(importedMessages);
        } catch {
          throw new Error("Invalid JSON format");
        }
        break;

      default:
        throw new Error(`Unsupported import format: ${format}`);
    }
  };

  return {
    messages,
    currentMessage,
    setCurrentMessage,
    addMessage,
    updateMessage,
    clearConversation,
    exportConversation,
    importConversation,
  };
}

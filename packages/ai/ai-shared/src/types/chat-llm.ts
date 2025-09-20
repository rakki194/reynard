/**
 * Chat and LLM Types
 *
 * Defines types for chat interactions, LLM operations, and conversational
 * AI functionality within the Reynard framework.
 */

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface ChatContext {
  currentPath?: string;
  selectedImages?: string[];
  gitStatus?: any;
  userPreferences?: Record<string, any>;
}

export interface ChatResponse {
  message: string;
  model: string;
  processingTime: number;
  tokensUsed?: number;
  metadata?: Record<string, any>;
}

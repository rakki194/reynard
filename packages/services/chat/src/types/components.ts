/**
 * Component props types for the Reynard Chat System
 */

import type { JSX } from "solid-js";
import type { ChatMessage, Tool, ToolCall } from "./tools";

export interface ChatMessageProps {
  /** Message to display */
  message: ChatMessage;
  /** Whether this is the most recent message */
  isLatest?: boolean;
  /** Whether to show timestamp */
  showTimestamp?: boolean;
  /** Whether to show token count */
  showTokenCount?: boolean;
  /** Custom avatar component */
  avatar?: JSX.Element;
  /** Callback for tool call actions */
  onToolAction?: (action: string, toolCall: ToolCall) => void;
  /** Custom message renderer */
  customRenderer?: (content: string, message: ChatMessage) => JSX.Element;
}

export interface ChatContainerProps {
  /** Initial messages */
  initialMessages?: ChatMessage[];
  /** Available models */
  models?: string[];
  /** Initial model selection */
  initialModel?: string;
  /** Available tools */
  tools?: Tool[];
  /** Chat endpoint URL */
  endpoint?: string;
  /** Authentication headers */
  authHeaders?: Record<string, string>;
  /** Configuration options */
  config?: Partial<import("./state").ChatState["config"]>;
  /** Custom message components */
  messageComponents?: {
    user?: any;
    assistant?: any;
    system?: any;
    tool?: any;
  };
  /** Event callbacks */
  onMessageSent?: (message: ChatMessage) => void;
  onMessageReceived?: (message: ChatMessage) => void;
  onError?: (error: Error) => void;
  onStreamingStart?: () => void;
  onStreamingEnd?: () => void;
  /** Styling props */
  height?: string;
  maxHeight?: string;
  className?: string;
  variant?: "default" | "compact" | "detailed";
}

export interface MessageInputProps {
  /** Placeholder text */
  placeholder?: string;
  /** Whether input is disabled */
  disabled?: boolean;
  /** Whether currently streaming */
  isStreaming?: boolean;
  /** Maximum input length */
  maxLength?: number;
  /** Show character counter */
  showCounter?: boolean;
  /** Enable multiline input */
  multiline?: boolean;
  /** Auto-resize textarea */
  autoResize?: boolean;
  /** Submit callback */
  onSubmit?: (content: string) => void;
  /** Content change callback */
  onChange?: (content: string) => void;
  /** Custom submit button */
  submitButton?: JSX.Element;
  /** Input variant */
  variant?: "default" | "compact";
}

export interface ThinkingIndicatorProps {
  /** Current thinking content */
  content?: string;
  /** Whether thinking is active */
  isActive?: boolean;
  /** Whether to show content */
  showContent?: boolean;
  /** Animation variant */
  variant?: "dots" | "pulse" | "typing";
  /** Custom thinking label */
  label?: string;
}

export interface MarkdownRendererProps {
  /** Markdown content to render */
  content: string;
  /** Whether content is streaming */
  streaming?: boolean;
  /** Custom component overrides */
  components?: Record<string, JSX.Element>;
  /** Code syntax highlighting theme */
  codeTheme?: string;
  /** Enable LaTeX math rendering */
  enableMath?: boolean;
  /** Enable mermaid diagrams */
  enableDiagrams?: boolean;
  /** Custom link click handler */
  onLinkClick?: (url: string, event: Event) => void;
  /** Image loading configuration */
  imageConfig?: {
    lazy?: boolean;
    placeholder?: string;
    errorFallback?: string;
  };
}

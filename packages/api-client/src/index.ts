/**
 * Reynard API Client
 *
 * Auto-generated TypeScript client for Reynard backend API
 * Provides type-safe access to all backend endpoints
 */

// Re-export generated types and client (selective exports to avoid conflicts)
export {
  // Core APIs
  Configuration,
  RagApi,
  CaptionApi,
  CaptionUploadApi,
  OllamaApi,
  AuthenticationApi,
  HealthApi,
  EmailApi,
  AgentEmailApi,
  ImapApi,
  
  // Core types
  type SecureUserLogin,
  type UserCreate,
  type UserPublic,
  type CaptionRequest,
  type CaptionResponse,
  type GeneratorInfo,
  type OllamaChatRequest,
  type OllamaChatResponse,
  type RAGQueryRequest,
  type RAGQueryResponse,
  type RAGStatsResponse,
  
  // Email types
  type EmailSendRequest,
  type EmailSendResponse,
  type EmailBulkRequest,
  type EmailBulkResponse,
  type EmailStatusModel,
  type AgentEmailSendRequest,
  type AgentEmailBulkRequest,
  type AgentEmailConfig,
  type AgentEmailStats,
  type AgentEmailTemplate,
} from "./generated/index";

// Re-export composables and utilities
export * from "./composables/index";
export * from "./utils/index";

// Re-export main client factory
export { createReynardApiClient } from "./client";

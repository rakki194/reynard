// Minimal generated API client for development
export class Configuration {
  constructor(config: { basePath?: string; fetchApi?: any } = {}) {
    this.basePath = config.basePath || "http://localhost:8000";
    this.fetchApi = config.fetchApi;
  }
  public basePath: string;
  public fetchApi?: any;
}

export class AuthenticationApi {
  constructor(private config: Configuration) {}
  
  async loginApiAuthLoginPost(data: any) {
    return { access_token: "mock-token", refresh_token: "mock-refresh" };
  }
  
  async registerApiAuthRegisterPost(data: any) {
    return { access_token: "mock-token", refresh_token: "mock-refresh" };
  }
  
  async refreshTokensApiAuthRefreshPost(data: any) {
    return { access_token: "new-mock-token", refresh_token: "new-mock-refresh" };
  }
  
  async logoutApiAuthLogoutPost() {
    return { message: "Logged out" };
  }
  
  async getCurrentUserInfoApiAuthMeGet() {
    return {
      id: 1,
      username: "mock-user",
      email: "mock@example.com",
      role: "regular",
      isActive: true,
      createdAt: new Date().toISOString(),
      profilePictureUrl: null
    };
  }
}

export class HealthApi {
  constructor(private config: Configuration) {}
  
  async healthCheckApiHealthGet() {
    return { status: "healthy" };
  }
}

export class RagApi {
  constructor(private config: Configuration) {}
  
  async queryRagApiRagQueryPost(data: any) {
    return { results: [] };
  }
  
  async ingestDocumentsApiRagIngestPost(data: any) {
    return { message: "Ingested" };
  }
  
  async getRagStatsApiRagAdminStatsGet() {
    return { stats: {} };
  }
  
  async getRagConfigApiRagConfigGet() {
    return { config: {} };
  }
}

export class CaptionApi {
  constructor(private config: Configuration) {}
  
  async generateCaptionApiCaptionGeneratePost(data: any) {
    return { caption: "Mock caption" };
  }
  
  async generateBatchCaptionsApiCaptionBatchPost(data: any) {
    return { captions: [] };
  }
  
  async getAvailableGeneratorsApiCaptionGeneratorsGet() {
    return { generators: [] };
  }
}

export class CaptionUploadApi {
  constructor(private config: Configuration) {}
  
  async uploadAndGenerateCaptionApiCaptionUploadPost(data: any) {
    return { caption: "Mock caption" };
  }
}

export class OllamaApi {
  constructor(private config: Configuration) {}
  
  async chatApiOllamaChatPost(data: any) {
    return { response: "Mock response" };
  }
  
  async chatStreamApiOllamaChatStreamPost(data: any) {
    return { response: "Mock stream response" };
  }
  
  async assistantChatApiOllamaAssistantPost(data: any) {
    return { response: "Mock assistant response" };
  }
  
  async assistantChatStreamApiOllamaAssistantStreamPost(data: any) {
    return { response: "Mock assistant stream response" };
  }
}

export class EmailApi {
  constructor(private config: Configuration) {}
  
  async sendEmailApiEmailSendPost(data: any) {
    return { message: "Email sent" };
  }
  
  async sendBulkEmailApiEmailSendBulkPost(data: any) {
    return { message: "Bulk email sent" };
  }
  
  async getEmailStatusApiEmailStatusGet() {
    return { status: "sent" };
  }
}

export class AgentEmailApi {
  constructor(private config: Configuration) {}
  
  async sendAgentEmailApiEmailAgentsAgentIdSendPost(agentId: string, data: any) {
    return { message: "Agent email sent" };
  }
  
  async sendAgentBulkEmailApiEmailAgentsAgentIdSendBulkPost(agentId: string, data: any) {
    return { message: "Agent bulk email sent" };
  }
  
  async getAgentEmailConfigApiEmailAgentsAgentIdConfigGet(agentId: string) {
    return { config: {} };
  }
  
  async updateAgentEmailConfigApiEmailAgentsAgentIdConfigPut(agentId: string, data: any) {
    return { config: {} };
  }
  
  async getAgentEmailStatsApiEmailAgentsAgentIdStatsGet(agentId: string) {
    return { stats: {} };
  }
  
  async createAgentEmailTemplateApiEmailAgentsAgentIdTemplatesPost(agentId: string, data: any) {
    return { template: {} };
  }
  
  async triggerAgentAutomatedEmailApiEmailAgentsAgentIdTriggerPost(agentId: string, data: any) {
    return { message: "Triggered" };
  }
}

export class ImapApi {
  constructor(private config: Configuration) {}
  
  async testImapConnectionApiImapTestGet() {
    return { status: "connected" };
  }
  
  async getImapStatusApiImapStatusGet() {
    return { status: "active" };
  }
  
  async getEmailsSummaryApiImapEmailsSummaryGet() {
    return { summary: {} };
  }
  
  async getRecentEmailsApiImapEmailsRecentGet() {
    return { emails: [] };
  }
  
  async getUnreadEmailsApiImapEmailsUnreadGet() {
    return { emails: [] };
  }
  
  async getAgentEmailsApiImapEmailsAgentAgentIdGet(agentId: string) {
    return { emails: [] };
  }
  
  async markEmailAsReadApiImapEmailsMessageIdMarkReadPost(messageId: string) {
    return { message: "Marked as read" };
  }
  
  async markEmailAsProcessedApiImapEmailsMessageIdMarkProcessedPost(messageId: string) {
    return { message: "Marked as processed" };
  }
  
  async startEmailMonitoringApiImapMonitoringStartPost() {
    return { message: "Monitoring started" };
  }
}

// Types
export interface SecureUserLogin {
  username: string;
  password: string;
}

export interface UserCreate {
  username: string;
  email: string;
  password: string;
}

export interface UserPublic {
  id?: number;
  username: string;
  email?: string;
  role?: string;
  isActive?: boolean;
  createdAt?: string;
  profilePictureUrl?: string | null;
}

export interface CaptionRequest {
  image_url: string;
  imagePath?: string;
  generator?: string;
  generatorName?: string;
}

export interface CaptionResponse {
  caption: string;
  confidence?: number;
  success?: boolean;
  imagePath?: string;
  generatorName?: string;
}

export interface GeneratorInfo {
  name: string;
  description: string;
  version?: string;
  captionType?: string;
  isAvailable?: boolean;
  isLoaded?: boolean;
  configSchema?: any;
  features?: string[];
  modelCategory?: string;
}

export interface OllamaChatRequest {
  model: string;
  messages: Array<{ role: string; content: string }>;
}

export interface OllamaChatResponse {
  response: string;
  success?: boolean;
  model?: string;
  processingTime?: number;
}

export interface RAGQueryRequest {
  query: string;
  limit?: number;
}

export interface RAGQueryResponse {
  results?: Array<{ content?: string; score: number; chunkText?: string; extra?: any }>;
  hits?: Array<{ content?: string; score: number; chunkText?: string; extra?: any }>;
  total?: number;
}

export interface RAGStatsResponse {
  stats?: Record<string, any>;
  totalDocuments?: number;
  totalChunks?: number;
  chunksWithEmbeddings?: number;
  embeddingCoverage?: number;
  defaultModel?: string;
  vectorDbEnabled?: boolean;
  cacheSize?: number;
}

export interface EmailSendRequest {
  to: string;
  subject: string;
  body: string;
}

export interface EmailSendResponse {
  message: string;
}

export interface EmailBulkRequest {
  emails: Array<{ to: string; subject: string; body: string }>;
}

export interface EmailBulkResponse {
  message: string;
}

export interface EmailStatusModel {
  status: string;
}

export interface AgentEmailSendRequest {
  to: string;
  subject: string;
  body: string;
}

export interface AgentEmailBulkRequest {
  emails: Array<{ to: string; subject: string; body: string }>;
}

export interface AgentEmailConfig {
  config: Record<string, any>;
}

export interface AgentEmailStats {
  stats: Record<string, any>;
}

export interface AgentEmailTemplate {
  template: Record<string, any>;
}

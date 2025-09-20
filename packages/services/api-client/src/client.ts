/**
 * Main API client factory for Reynard
 */

import {
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
} from "./generated/index";
import type { AuthFetchOptions, AuthFetch } from "./types";

export interface ReynardApiClientConfig {
  basePath?: string;
  authFetch?: AuthFetch;
  timeout?: number;
}

/**
 * Creates a configured Reynard API client
 */
export function createReynardApiClient(config: ReynardApiClientConfig = {}) {
  const { basePath = "http://localhost:8000", authFetch, timeout = 30000 } = config;

  // Create configuration
  const apiConfig = new Configuration({
    basePath,
    fetchApi: authFetch || fetch,
  });

  // Create API clients
  const healthApi = new HealthApi(apiConfig);
  const ragApi = new RagApi(apiConfig);
  const captionApi = new CaptionApi(apiConfig);
  const captionUploadApi = new CaptionUploadApi(apiConfig);
  const ollamaApi = new OllamaApi(apiConfig);
  const authApi = new AuthenticationApi(apiConfig);
  const emailApi = new EmailApi(apiConfig);
  const agentEmailApi = new AgentEmailApi(apiConfig);
  const imapApi = new ImapApi(apiConfig);

  // Create composable instances (to be implemented)
  // const emailService = useEmail({ config: apiConfig } as ReynardApiClient);
  // const ecsService = useECS({ config: apiConfig } as ReynardApiClient);
  // const mcpService = useMCP({ config: apiConfig } as ReynardApiClient);

  return {
    api: healthApi,
    config: apiConfig,

    // Core services
    rag: {
      query: ragApi.queryRagApiRagQueryPost.bind(ragApi),
      ingest: ragApi.ingestDocumentsApiRagIngestPost.bind(ragApi),
      stats: ragApi.getRagStatsApiRagAdminStatsGet.bind(ragApi),
      documents: ragApi.getRagConfigApiRagConfigGet.bind(ragApi),
    },

    caption: {
      generate: captionApi.generateCaptionApiCaptionGeneratePost.bind(captionApi),
      batchGenerate: captionApi.generateBatchCaptionsApiCaptionBatchPost.bind(captionApi),
      generators: captionApi.getAvailableGeneratorsApiCaptionGeneratorsGet.bind(captionApi),
      upload: captionUploadApi.uploadAndGenerateCaptionApiCaptionUploadPost.bind(captionUploadApi),
    },

    chat: {
      send: ollamaApi.chatApiOllamaChatPost.bind(ollamaApi),
      stream: ollamaApi.chatStreamApiOllamaChatStreamPost.bind(ollamaApi),
      assistant: ollamaApi.assistantChatApiOllamaAssistantPost.bind(ollamaApi),
      assistantStream: ollamaApi.assistantChatStreamApiOllamaAssistantStreamPost.bind(ollamaApi),
    },

    auth: {
      login: authApi.loginApiAuthLoginPost.bind(authApi),
      register: authApi.registerApiAuthRegisterPost.bind(authApi),
      refresh: authApi.refreshTokensApiAuthRefreshPost.bind(authApi),
      logout: authApi.logoutApiAuthLogoutPost.bind(authApi),
      me: authApi.getCurrentUserInfoApiAuthMeGet.bind(authApi),
    },

    email: {
      send: emailApi.sendEmailApiEmailSendPost.bind(emailApi),
      sendBulk: emailApi.sendBulkEmailApiEmailSendBulkPost.bind(emailApi),
      getStatus: emailApi.getEmailStatusApiEmailStatusGet.bind(emailApi),
    },

    agentEmail: {
      send: agentEmailApi.sendAgentEmailApiEmailAgentsAgentIdSendPost.bind(agentEmailApi),
      sendBulk: agentEmailApi.sendAgentBulkEmailApiEmailAgentsAgentIdSendBulkPost.bind(agentEmailApi),
      getConfig: agentEmailApi.getAgentEmailConfigApiEmailAgentsAgentIdConfigGet.bind(agentEmailApi),
      updateConfig: agentEmailApi.updateAgentEmailConfigApiEmailAgentsAgentIdConfigPut.bind(agentEmailApi),
      getStats: agentEmailApi.getAgentEmailStatsApiEmailAgentsAgentIdStatsGet.bind(agentEmailApi),
      createTemplate: agentEmailApi.createAgentEmailTemplateApiEmailAgentsAgentIdTemplatesPost.bind(agentEmailApi),
      triggerAutomated: agentEmailApi.triggerAgentAutomatedEmailApiEmailAgentsAgentIdTriggerPost.bind(agentEmailApi),
    },

    imap: {
      testConnection: imapApi.testImapConnectionApiImapTestGet.bind(imapApi),
      getStatus: imapApi.getImapStatusApiImapStatusGet.bind(imapApi),
      getEmailsSummary: imapApi.getEmailsSummaryApiImapEmailsSummaryGet.bind(imapApi),
      getRecentEmails: imapApi.getRecentEmailsApiImapEmailsRecentGet.bind(imapApi),
      getUnreadEmails: imapApi.getUnreadEmailsApiImapEmailsUnreadGet.bind(imapApi),
      getAgentEmails: imapApi.getAgentEmailsApiImapEmailsAgentAgentIdGet.bind(imapApi),
      markAsRead: imapApi.markEmailAsReadApiImapEmailsMessageIdMarkReadPost.bind(imapApi),
      markAsProcessed: imapApi.markEmailAsProcessedApiImapEmailsMessageIdMarkProcessedPost.bind(imapApi),
      startMonitoring: imapApi.startEmailMonitoringApiImapMonitoringStartPost.bind(imapApi),
    },

    // New services (to be implemented)
    // ecs: ecsService,
    // mcp: mcpService,

    health: healthApi.healthCheckApiHealthGet.bind(healthApi),
  };
}

export type ReynardApiClient = ReturnType<typeof createReynardApiClient>;

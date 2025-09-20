/**
 * Reynard Email Package
 *
 * Comprehensive email management system with agent integration
 */

// Composables
export { useEmail, type UseEmailOptions, type UseEmailReturn } from "./composables/useEmail";
export { useAgentEmail, type UseAgentEmailOptions, type UseAgentEmailReturn } from "./composables/useAgentEmail";
export { useImap, type ImapComposable } from "./composables/useImap";

// Components
export { EmailComposer, type EmailComposerProps } from "./components/EmailComposer";

// Types
export type { EmailMessage, EmailAttachment, EmailTemplate, EmailStatus } from "./composables/useEmail";

export type { AgentEmailConfig, AgentEmailStats, AgentEmailTemplate } from "./composables/useAgentEmail";

export type { ImapEmail, ImapStatus, EmailSummary } from "./composables/useImap";

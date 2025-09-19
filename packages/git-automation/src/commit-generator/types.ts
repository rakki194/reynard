/**
 * 🦊 Commit Message Generator Types
 *
 * Type definitions for the commit message generator module
 */

export interface CommitMessageOptions {
  includeBody: boolean;
  includeFooter: boolean;
  maxBodyLength: number;
  includeBreakingChanges: boolean;
  includeIssueReferences: boolean;
}

export interface CommitMessage {
  type: string;
  scope?: string;
  description: string;
  body?: string;
  footer?: string;
  fullMessage: string;
}

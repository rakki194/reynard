/**
 * 🦊 Git Hooks Types
 * 
 * Type definitions for the Reynard git hook system.
 */

export type GitHookType = "pre-commit" | "commit-msg" | "pre-push" | "prepare-commit-msg";

export interface HookConfig {
  hooks: {
    [K in GitHookType]?: HookTypeConfig;
  };
  global: {
    enabled: boolean;
    verbose: boolean;
    failFast: boolean;
  };
}

export interface HookTypeConfig {
  enabled: boolean;
  commands: string[];
  timeout?: number;
  parallel?: boolean;
  failFast?: boolean;
}

export interface HookResult {
  success: boolean;
  message: string;
  details?: string;
  duration?: number;
  timestamp?: Date;
}

export interface PreCommitConfig extends HookTypeConfig {
  linting: {
    enabled: boolean;
    fix: boolean;
    files: string[];
  };
  typeCheck: {
    enabled: boolean;
    strict: boolean;
  };
  tests: {
    enabled: boolean;
    watch: boolean;
    coverage: boolean;
  };
}

export interface CommitMsgConfig extends HookTypeConfig {
  conventional: {
    enabled: boolean;
    types: string[];
    maxLength: number;
  };
  validation: {
    enabled: boolean;
    rules: string[];
  };
}

export interface PrePushConfig extends HookTypeConfig {
  fullTestSuite: {
    enabled: boolean;
    coverage: boolean;
  };
  securityScan: {
    enabled: boolean;
    audit: boolean;
    bandit: boolean;
  };
  build: {
    enabled: boolean;
    clean: boolean;
  };
}

export interface HookExecutionContext {
  hookType: GitHookType;
  projectRoot: string;
  stagedFiles: string[];
  commitMessage?: string;
  branchName?: string;
  remoteName?: string;
  remoteUrl?: string;
}

export interface HookExecutionResult {
  hookType: GitHookType;
  success: boolean;
  results: HookResult[];
  duration: number;
  timestamp: Date;
  context: HookExecutionContext;
}

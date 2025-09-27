/**
 * 🦊 Reynard Git Hooks Index
 * 
 * Main export for git hooks functionality.
 */

export { HookManager } from "./HookManager.js";
export type {
  HookConfig,
  HookResult,
  GitHookType,
  HookTypeConfig,
  PreCommitConfig,
  CommitMsgConfig,
  PrePushConfig,
  HookExecutionContext,
  HookExecutionResult
} from "../types/GitHooks.js";

/**
 * 🦊 Workflow Orchestrator Types
 *
 * Type definitions for the workflow orchestrator module
 */

export interface WorkflowOptions {
  workingDir?: string;
  commit?: boolean;
  version?: boolean;
  changelog?: boolean;
  cleanup?: boolean;
  dryRun?: boolean;
}

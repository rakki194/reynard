/**
 * 🐺 Workflow Processor Module
 * Handles the main processing logic for workflow files
 */

import type { WorkflowScript, ValidationResult, WorkflowFile } from "./types.js";
import type { ReynardLogger } from "reynard-dev-tools-catalyst";
import { ScriptExtractor } from "./scriptExtractor.js";
import { ScriptValidator } from "./scriptValidator.js";
import { ScriptFixer } from "./scriptFixer.js";

export class WorkflowProcessor {
  constructor(
    private logger: ReynardLogger,
    private scriptExtractor: ScriptExtractor,
    private scriptValidator: ScriptValidator,
    private scriptFixer: ScriptFixer
  ) {}

  async processWorkflowFiles(workflowFiles: WorkflowFile[]): Promise<{
    totalScripts: number;
    validScripts: number;
    invalidScripts: number;
    fixesApplied: number;
    extractedScripts: WorkflowScript[];
    validationResults: Array<{ script: WorkflowScript; validation: ValidationResult }>;
  }> {
    let totalScripts = 0;
    let validScripts = 0;
    let invalidScripts = 0;
    let fixesApplied = 0;
    const extractedScripts: WorkflowScript[] = [];
    const validationResults: Array<{ script: WorkflowScript; validation: ValidationResult }> = [];

    for (const workflowFile of workflowFiles) {
      const scripts = this.scriptExtractor.extractShellScripts(workflowFile.path);
      totalScripts += scripts.length;
      extractedScripts.push(...scripts);

      for (const script of scripts) {
        const validationResult = this.scriptValidator.validateScript(script);
        validationResults.push({ script, validation: validationResult });

        if (validationResult.valid) {
          validScripts++;
        } else {
          invalidScripts++;
          const fixes = this.scriptFixer.generateFixes(script, validationResult);
          if (fixes.length > 0) {
            const fixResult = this.scriptFixer.applyFixes(workflowFile.path, fixes);
            fixesApplied += fixResult.count;
          }
        }
      }
    }

    return {
      totalScripts,
      validScripts,
      invalidScripts,
      fixesApplied,
      extractedScripts,
      validationResults,
    };
  }
}

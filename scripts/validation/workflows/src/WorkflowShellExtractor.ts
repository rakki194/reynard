/**
 * 🐺 Workflow Shell Script Extractor
 * Extracts and validates shell scripts embedded in GitHub Actions workflows
 *
 * This tool systematically hunts down every shell script vulnerability
 * in GitHub workflow files, ensuring bulletproof CI/CD security.
 */

import type { WorkflowScript, ValidationResult, ScriptFix, ExtractorOptions, ProcessResult } from "./types.js";
import { ExtractorFactory } from "./extractorFactory.js";

export class WorkflowShellExtractor {
  private readonly components: ReturnType<typeof ExtractorFactory.createComponents>;

  constructor(options: ExtractorOptions = {}) {
    this.components = ExtractorFactory.createComponents(options);
  }

  extractShellScripts(workflowPath: string): WorkflowScript[] {
    return this.components.scriptExtractor.extractShellScripts(workflowPath);
  }

  validateScript(script: WorkflowScript): ValidationResult {
    return this.components.scriptValidator.validateScript(script);
  }

  generateFixes(script: WorkflowScript, validationResult: ValidationResult) {
    return this.components.scriptFixer.generateFixes(script, validationResult);
  }

  applyFixes(workflowPath: string, fixes: ScriptFix[]) {
    return this.components.scriptFixer.applyFixes(workflowPath, fixes);
  }

  async processWorkflows(): Promise<ProcessResult> {
    const startTime = new Date();
    this.components.reportGenerator.generateStartMessage();

    this.components.fileManager.ensureTempDir();
    const workflowFiles = this.components.fileManager.findWorkflowFiles();

    if (workflowFiles.length === 0) {
      this.components.reportGenerator.generateNoWorkflowFilesError();
      return this.createEmptyResult(startTime);
    }

    this.components.reportGenerator.generateWorkflowFilesMessage(workflowFiles.length);

    const result = await this.components.workflowProcessor.processWorkflowFiles(workflowFiles);
    this.components.fileManager.cleanup();

    const endTime = new Date();
    const duration = endTime.getTime() - startTime.getTime();

    this.components.reportGenerator.generateSummary(
      result.totalScripts,
      result.validScripts,
      result.invalidScripts,
      result.fixesApplied
    );

    return {
      success: result.invalidScripts === 0,
      scripts: result.extractedScripts,
      results: result.validationResults,
      summary: {
        totalScripts: result.totalScripts,
        validScripts: result.validScripts,
        invalidScripts: result.invalidScripts,
        fixesApplied: result.fixesApplied,
      },
      metadata: {
        startTime,
        endTime,
        duration,
        workflowFilesProcessed: workflowFiles.length,
      },
    };
  }

  private createEmptyResult(startTime: Date): ProcessResult {
    return {
      success: false,
      scripts: [],
      results: [],
      summary: {
        totalScripts: 0,
        validScripts: 0,
        invalidScripts: 0,
        fixesApplied: 0,
      },
      metadata: {
        startTime,
        endTime: new Date(),
        duration: 0,
        workflowFilesProcessed: 0,
      },
    };
  }

  findWorkflowFiles() {
    return this.components.fileManager.findWorkflowFiles();
  }

  cleanup(): void {
    this.components.fileManager.cleanup();
  }
}

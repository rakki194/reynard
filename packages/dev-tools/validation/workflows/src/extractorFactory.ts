/**
 * 🐺 Extractor Factory Module
 * Factory for creating and configuring WorkflowShellExtractor instances
 */

import type { ExtractorOptions } from "./types.js";
import { ReynardLogger } from "reynard-dev-tools-catalyst";
import { ScriptExtractor } from "./scriptExtractor.js";
import { ScriptValidator } from "./scriptValidator.js";
import { ScriptFixer } from "./scriptFixer.js";
import { WorkflowFileManager } from "./workflowFileManager.js";
import { ReportGenerator } from "./reportGenerator.js";
import { WorkflowProcessor } from "./workflowProcessor.js";

export class ExtractorFactory {
  static createComponents(options: ExtractorOptions = {}) {
    const workflowDir = options.workflowDir || ".github/workflows";
    const tempDir = options.tempDir || "/tmp/workflow_shell_extraction";
    const shellcheckRc = options.shellcheckRc || ".shellcheckrc";
    const verbose = options.verbose || false;
    const fixMode = options.fixMode || false;
    const includePatterns = options.includePatterns || ["*.yml", "*.yaml"];
    const excludePatterns = options.excludePatterns || ["*.test.yml", "*.test.yaml"];

    const logger = new ReynardLogger({ verbose });
    const scriptExtractor = new ScriptExtractor(logger);
    const scriptValidator = new ScriptValidator(logger, tempDir, shellcheckRc);
    const scriptFixer = new ScriptFixer(logger, fixMode);
    const fileManager = new WorkflowFileManager(workflowDir, tempDir, includePatterns, excludePatterns, logger);
    const reportGenerator = new ReportGenerator(logger);
    const workflowProcessor = new WorkflowProcessor(logger, scriptExtractor, scriptValidator, scriptFixer);

    return {
      logger,
      scriptExtractor,
      scriptValidator,
      scriptFixer,
      fileManager,
      reportGenerator,
      workflowProcessor,
    };
  }
}

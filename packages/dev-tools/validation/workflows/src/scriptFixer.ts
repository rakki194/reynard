/**
 * 🐺 Script Fixer Module
 * Handles generation and application of fixes for shell script issues
 */

import fs from "fs";
import type { WorkflowScript, ValidationResult, ScriptFix, FixApplicationResult } from "./types.js";
import type { Logger } from "./types.js";
import { FixGenerator } from "./fixGenerator.js";

export class ScriptFixer {
  constructor(
    private logger: Logger,
    private fixMode: boolean
  ) {}

  /**
   * Generate fixes for shell script issues
   */
  generateFixes(script: WorkflowScript, validationResult: ValidationResult): ScriptFix[] {
    if (validationResult.valid) {
      return [];
    }

    const fixes: ScriptFix[] = [];
    const issues = validationResult.issues.join("\n");
    const lines = issues.split("\n");

    for (const line of lines) {
      const lineFixes = FixGenerator.generateFixesForLine(line);
      fixes.push(...lineFixes);
    }

    return fixes;
  }

  /**
   * Apply fixes to workflow file
   */
  applyFixes(workflowPath: string, fixes: ScriptFix[]): FixApplicationResult {
    if (!this.fixMode || fixes.length === 0) {
      return {
        applied: false,
        count: 0,
        fixes: [],
        filePath: workflowPath,
      };
    }

    this.logger.log(`🔧 Applying ${fixes.length} fixes to ${workflowPath}`, "yellow");

    let content = fs.readFileSync(workflowPath, "utf8");
    let modified = false;
    const appliedFixes: ScriptFix[] = [];

    // Create backup
    const backupPath = `${workflowPath}.backup.${Date.now()}`;
    fs.writeFileSync(backupPath, content);

    for (const fix of fixes) {
      if (this.canApplyFix(fix)) {
        const newContent = content.replace(fix.pattern, fix.replacement);
        if (newContent !== content) {
          content = newContent;
          modified = true;
          appliedFixes.push(fix);
          this.logger.log(`    ✅ Applied: ${fix.description}`, "green");
        }
      }
    }

    if (modified) {
      fs.writeFileSync(workflowPath, content);
      this.logger.log(`    💾 Saved fixes to ${workflowPath}`, "green");
    } else {
      // Remove backup if no changes were made
      fs.unlinkSync(backupPath);
    }

    const result: FixApplicationResult = {
      applied: modified,
      count: appliedFixes.length,
      fixes: appliedFixes,
      filePath: workflowPath,
    };

    if (modified) {
      result.backupPath = backupPath;
    }

    return result;
  }

  private canApplyFix(fix: ScriptFix): boolean {
    return fix.type === "replace" && fix.safe === true;
  }
}

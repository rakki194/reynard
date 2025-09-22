/**
 * 🐺 Script Extractor Module
 * Handles extraction of shell scripts from GitHub Actions workflow files
 */

import fs from "fs";
import type { WorkflowScript } from "./types.js";
import type { ReynardLogger } from "reynard-dev-tools-catalyst";

export class ScriptExtractor {
  constructor(private logger: ReynardLogger) {}

  /**
   * Extract shell scripts from a workflow file
   */
  extractShellScripts(workflowPath: string): WorkflowScript[] {
    this.logger.log(`🔍 Extracting shell scripts from: ${workflowPath}`, "blue");

    const content = fs.readFileSync(workflowPath, "utf8");
    const lines = content.split("\n");
    const scripts: WorkflowScript[] = [];

    let inScript = false;
    let scriptStartLine = 0;
    let scriptContent: string[] = [];
    let scriptName: string | undefined = undefined;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;

      // Detect start of multi-line shell script
      if (this.isScriptStart(line)) {
        inScript = true;
        scriptStartLine = i + 1;
        scriptContent = [];
        scriptName = `line_${i + 1}`;
        this.logger.log(`  📄 Found multi-line script at line ${i + 1}`, "cyan");
        continue;
      }

      // Collect script content
      if (inScript) {
        const cleanLine = this.cleanScriptLine(line);
        scriptContent.push(cleanLine);
      }

      // Detect end of multi-line script
      if (inScript && this.isScriptEnd(line)) {
        inScript = false;
        const script = this.createScript(workflowPath, scriptName, scriptStartLine, i, scriptContent);
        if (script) {
          scripts.push(script);
          this.logger.log(`    ✅ Extracted ${scriptContent.length} lines`, "green");
        }
        scriptContent = [];
      }
    }

    // Handle script that goes to end of file
    if (inScript && scriptContent.length > 0) {
      const script = this.createScript(workflowPath, scriptName, scriptStartLine, lines.length, scriptContent);
      if (script) {
        scripts.push(script);
        this.logger.log(`    ✅ Extracted ${scriptContent.length} lines (end of file)`, "green");
      }
    }

    return scripts;
  }

  private isScriptStart(line: string): boolean {
    return line.match(/^\s*run:\s*\|/) !== null;
  }

  private isScriptEnd(line: string): boolean {
    return line.match(/^\s*[^-\s]/) !== null && line.match(/^\s*\|/) === null;
  }

  private cleanScriptLine(line: string): string {
    return line.replace(/^\s*\|\s*/, "");
  }

  private createScript(
    workflowPath: string,
    name: string | undefined,
    startLine: number,
    endLine: number,
    content: string[]
  ): WorkflowScript | null {
    if (content.length === 0) {
      return null;
    }

    return {
      workflow: workflowPath,
      name: name || "unnamed_script",
      startLine,
      endLine,
      content: content.join("\n"),
      type: "multiline",
    };
  }
}

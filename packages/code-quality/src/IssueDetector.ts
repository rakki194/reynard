/**
 * 🐺 Reynard Issue Detector
 *
 * *snarls with predatory focus* Detects quality issues using existing
 * tools with wolf-like relentless determination.
 */

import { exec } from "child_process";
import { promisify } from "util";
import { IssueSeverity, IssueType, QualityIssue } from "./types";

const execAsync = promisify(exec);

export class IssueDetector {
  /**
   * 🐺 Detect quality issues using existing tools
   */
  async detectIssues(files: string[]): Promise<QualityIssue[]> {
    const issues: QualityIssue[] = [];

    // Run existing linting tools
    const lintingResults = await this.runLintingTools(files);
    issues.push(...lintingResults);

    // Run security analysis
    const securityResults = await this.runSecurityAnalysis(files);
    issues.push(...securityResults);

    return issues;
  }

  private async runLintingTools(files: string[]): Promise<QualityIssue[]> {
    const issues: QualityIssue[] = [];

    try {
      // Run ESLint for TypeScript/JavaScript
      const tsFiles = files.filter(
        f => f.endsWith(".ts") || f.endsWith(".tsx") || f.endsWith(".js") || f.endsWith(".jsx")
      );
      if (tsFiles.length > 0) {
        const eslintResult = await this.runESLint(tsFiles);
        issues.push(...eslintResult);
      }

      // Run Python linting
      const pyFiles = files.filter(f => f.endsWith(".py"));
      if (pyFiles.length > 0) {
        const pythonResult = await this.runPythonLinting(pyFiles);
        issues.push(...pythonResult);
      }
    } catch (error) {
      console.warn("⚠️ Linting tools failed:", error);
    }

    return issues;
  }

  private async runESLint(files: string[]): Promise<QualityIssue[]> {
    try {
      const { stdout } = await execAsync(`pnpm lint --format json ${files.join(" ")}`);
      const results = JSON.parse(stdout);

      const issues: QualityIssue[] = [];
      for (const result of results) {
        for (const message of result.messages) {
          issues.push({
            id: `${result.filePath}:${message.line}:${message.column}`,
            type: this.mapESLintSeverityToType(message.severity),
            severity: this.mapESLintSeverityToSeverity(message.severity),
            message: message.message,
            file: result.filePath,
            line: message.line,
            column: message.column,
            rule: message.ruleId || "unknown",
            effort: this.estimateEffort(message.severity),
            tags: ["eslint"],
            createdAt: new Date(),
          });
        }
      }
      return issues;
    } catch {
      return [];
    }
  }

  private async runPythonLinting(files: string[]): Promise<QualityIssue[]> {
    try {
      const { stdout } = await execAsync(
        `python -m flake8 --format=%(path)s:%(row)d:%(col)d: %(code)s %(text)s ${files.join(" ")}`
      );
      const lines = stdout.split("\n").filter(line => line.trim());

      const issues: QualityIssue[] = [];
      for (const line of lines) {
        const match = line.match(/^(.+):(\d+):(\d+): ([A-Z]\d+) (.+)$/);
        if (match) {
          const [, file, lineNum, col, code, message] = match;
          issues.push({
            id: `${file}:${lineNum}:${col}`,
            type: "CODE_SMELL",
            severity: this.mapFlake8Severity(code),
            message,
            file,
            line: parseInt(lineNum),
            column: parseInt(col),
            rule: code,
            effort: this.estimateEffort(this.mapFlake8Severity(code)),
            tags: ["flake8", "python"],
            createdAt: new Date(),
          });
        }
      }
      return issues;
    } catch {
      return [];
    }
  }

  private async runSecurityAnalysis(_files: string[]): Promise<QualityIssue[]> {
    // This would integrate with your existing Fenrir security tools
    const issues: QualityIssue[] = [];

    // Placeholder for security analysis integration
    // In a real implementation, this would call your Fenrir tools

    return issues;
  }

  private mapESLintSeverityToType(severity: number): IssueType {
    switch (severity) {
      case 2:
        return "BUG";
      case 1:
        return "CODE_SMELL";
      default:
        return "CODE_SMELL";
    }
  }

  private mapESLintSeverityToSeverity(severity: number): IssueSeverity {
    switch (severity) {
      case 2:
        return "MAJOR";
      case 1:
        return "MINOR";
      default:
        return "INFO";
    }
  }

  private mapFlake8Severity(code: string): "BLOCKER" | "CRITICAL" | "MAJOR" | "MINOR" | "INFO" {
    if (code.startsWith("E")) return "MAJOR";
    if (code.startsWith("W")) return "MINOR";
    if (code.startsWith("F")) return "CRITICAL";
    return "INFO";
  }

  private estimateEffort(severity: string | number): number {
    if (typeof severity === "number") {
      return severity * 30; // minutes
    }

    switch (severity) {
      case "BLOCKER":
      case "CRITICAL":
        return 120;
      case "MAJOR":
        return 60;
      case "MINOR":
        return 30;
      default:
        return 15;
    }
  }
}

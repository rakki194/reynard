/**
 * Automated Impact Analysis - Code Change Detection and Impact Assessment
 *
 * This module provides comprehensive analysis of code changes and their
 * impact on architectural decisions and system compliance.
 */

import { readFile, readdir, stat, watch } from "fs/promises";
import { join, relative } from "path";
import { createHash } from "crypto";
import { ADRDocument } from "./types";

export interface CodeChange {
  id: string;
  filePath: string;
  changeType: "added" | "modified" | "deleted" | "renamed";
  timestamp: string;
  hash: string;
  size: number;
  linesAdded: number;
  linesDeleted: number;
  linesModified: number;
  content?: string;
  metadata: {
    author?: string;
    commit?: string;
    branch?: string;
    message?: string;
  };
}

export interface ImpactAssessment {
  changeId: string;
  affectedADRs: string[];
  impactLevel: "low" | "medium" | "high" | "critical";
  impactAreas: string[];
  complianceViolations: ComplianceViolation[];
  recommendations: string[];
  estimatedEffort: number; // hours
  riskScore: number; // 0-1
}

export interface ComplianceViolation {
  type: "architectural" | "security" | "performance" | "maintainability";
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  location: string;
  rule: string;
  suggestion: string;
}

export interface DependencyImpact {
  sourceFile: string;
  affectedFiles: string[];
  impactChain: string[][];
  breakingChanges: string[];
  migrationRequired: boolean;
  estimatedMigrationEffort: number;
}

export class ImpactAnalyzer {
  private readonly codebasePath: string;
  private readonly adrPath: string;
  private readonly changeHistory: Map<string, CodeChange> = new Map();
  private readonly fileHashes: Map<string, string> = new Map();
  private readonly adrCache: Map<string, ADRDocument> = new Map();
  private watchers: Map<string, any> = new Map();

  constructor(codebasePath: string, adrPath: string) {
    this.codebasePath = codebasePath;
    this.adrPath = adrPath;
  }

  /**
   * Initialize the impact analyzer
   */
  async initialize(): Promise<void> {
    console.log("🦦 Initializing Impact Analyzer...");

    await this.scanCodebase();
    await this.loadADRs();
    await this.establishBaseline();

    console.log("✅ Impact Analyzer initialized");
  }

  /**
   * Start monitoring code changes
   */
  async startMonitoring(): Promise<void> {
    console.log("🦦 Starting code change monitoring...");

    try {
      const files = await this.getAllFiles();

      for (const file of files) {
        await this.watchFile(file);
      }

      console.log(`✅ Monitoring ${files.length} files for changes`);
    } catch (error) {
      console.error("Failed to start monitoring:", error);
    }
  }

  /**
   * Stop monitoring code changes
   */
  async stopMonitoring(): Promise<void> {
    console.log("🦦 Stopping code change monitoring...");

    for (const [filePath, watcher] of this.watchers) {
      watcher.close();
    }

    this.watchers.clear();
    console.log("✅ Monitoring stopped");
  }

  /**
   * Analyze impact of a specific change
   */
  async analyzeChangeImpact(change: CodeChange): Promise<ImpactAssessment> {
    console.log(`🦦 Analyzing impact of change: ${change.filePath}`);

    const affectedADRs = await this.findAffectedADRs(change);
    const impactAreas = await this.identifyImpactAreas(change);
    const complianceViolations = await this.checkComplianceViolations(change);
    const recommendations = await this.generateRecommendations(change, complianceViolations);

    const impactLevel = this.calculateImpactLevel(affectedADRs, complianceViolations);
    const estimatedEffort = this.estimateEffort(change, complianceViolations);
    const riskScore = this.calculateRiskScore(change, complianceViolations);

    return {
      changeId: change.id,
      affectedADRs,
      impactLevel,
      impactAreas,
      complianceViolations,
      recommendations,
      estimatedEffort,
      riskScore,
    };
  }

  /**
   * Analyze dependency impact of changes
   */
  async analyzeDependencyImpact(changes: CodeChange[]): Promise<DependencyImpact[]> {
    console.log(`🦦 Analyzing dependency impact for ${changes.length} changes`);

    const impacts: DependencyImpact[] = [];

    for (const change of changes) {
      const affectedFiles = await this.findAffectedFiles(change);
      const impactChain = await this.buildImpactChain(change, affectedFiles);
      const breakingChanges = await this.identifyBreakingChanges(change);
      const migrationRequired = breakingChanges.length > 0;
      const estimatedMigrationEffort = this.estimateMigrationEffort(breakingChanges);

      impacts.push({
        sourceFile: change.filePath,
        affectedFiles,
        impactChain,
        breakingChanges,
        migrationRequired,
        estimatedMigrationEffort,
      });
    }

    return impacts;
  }

  /**
   * Get change history for a file
   */
  getChangeHistory(filePath: string): CodeChange[] {
    return Array.from(this.changeHistory.values())
      .filter(change => change.filePath === filePath)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Get all changes in a time range
   */
  getChangesInRange(startDate: Date, endDate: Date): CodeChange[] {
    return Array.from(this.changeHistory.values())
      .filter(change => {
        const changeDate = new Date(change.timestamp);
        return changeDate >= startDate && changeDate <= endDate;
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Generate impact report
   */
  generateImpactReport(changes: CodeChange[], assessments: ImpactAssessment[]): string {
    let report = "# Impact Analysis Report\n\n";
    report += `**Generated**: ${new Date().toISOString()}\n`;
    report += `**Changes Analyzed**: ${changes.length}\n\n`;

    // Summary
    report += "## Summary\n\n";
    const criticalChanges = assessments.filter(a => a.impactLevel === "critical").length;
    const highImpactChanges = assessments.filter(a => a.impactLevel === "high").length;
    const totalViolations = assessments.reduce((sum, a) => sum + a.complianceViolations.length, 0);
    const totalEffort = assessments.reduce((sum, a) => sum + a.estimatedEffort, 0);

    report += `- **Critical Changes**: ${criticalChanges}\n`;
    report += `- **High Impact Changes**: ${highImpactChanges}\n`;
    report += `- **Total Compliance Violations**: ${totalViolations}\n`;
    report += `- **Estimated Total Effort**: ${totalEffort.toFixed(1)} hours\n\n`;

    // Detailed analysis
    report += "## Detailed Analysis\n\n";

    for (let i = 0; i < changes.length; i++) {
      const change = changes[i];
      const assessment = assessments[i];

      report += `### ${change.filePath}\n\n`;
      report += `**Change Type**: ${change.changeType}\n`;
      report += `**Impact Level**: ${assessment.impactLevel.toUpperCase()}\n`;
      report += `**Risk Score**: ${(assessment.riskScore * 100).toFixed(1)}%\n`;
      report += `**Estimated Effort**: ${assessment.estimatedEffort.toFixed(1)} hours\n\n`;

      if (assessment.affectedADRs.length > 0) {
        report += `**Affected ADRs**:\n`;
        for (const adrId of assessment.affectedADRs) {
          report += `- ${adrId}\n`;
        }
        report += "\n";
      }

      if (assessment.complianceViolations.length > 0) {
        report += `**Compliance Violations**:\n`;
        for (const violation of assessment.complianceViolations) {
          report += `- **[${violation.severity.toUpperCase()}]** ${violation.description}\n`;
          report += `  - Location: ${violation.location}\n`;
          report += `  - Suggestion: ${violation.suggestion}\n`;
        }
        report += "\n";
      }

      if (assessment.recommendations.length > 0) {
        report += `**Recommendations**:\n`;
        for (const recommendation of assessment.recommendations) {
          report += `- ${recommendation}\n`;
        }
        report += "\n";
      }
    }

    return report;
  }

  // Private methods
  private async scanCodebase(): Promise<void> {
    const files = await this.getAllFiles();

    for (const file of files) {
      try {
        const content = await readFile(file, "utf-8");
        const hash = this.calculateHash(content);
        this.fileHashes.set(file, hash);
      } catch (error) {
        console.warn(`Could not read file ${file}:`, error);
      }
    }
  }

  private async loadADRs(): Promise<void> {
    try {
      const files = await readdir(this.adrPath);
      const adrFiles = files.filter(file => file.endsWith(".md") && file.match(/^\d{3}-/));

      for (const file of adrFiles) {
        const filePath = join(this.adrPath, file);
        const adr = await this.parseADR(filePath);
        if (adr) {
          this.adrCache.set(adr.id, adr);
        }
      }
    } catch (error) {
      console.error("Failed to load ADRs:", error);
    }
  }

  private async establishBaseline(): Promise<void> {
    // Create baseline change records for all existing files
    const files = await this.getAllFiles();

    for (const file of files) {
      try {
        const stats = await stat(file);
        const content = await readFile(file, "utf-8");
        const hash = this.calculateHash(content);

        const change: CodeChange = {
          id: this.generateChangeId(),
          filePath: file,
          changeType: "added",
          timestamp: stats.birthtime.toISOString(),
          hash,
          size: stats.size,
          linesAdded: content.split("\n").length,
          linesDeleted: 0,
          linesModified: 0,
          content,
          metadata: {
            author: "system",
            message: "Baseline file",
          },
        };

        this.changeHistory.set(change.id, change);
      } catch (error) {
        console.warn(`Could not establish baseline for ${file}:`, error);
      }
    }
  }

  private async watchFile(filePath: string): Promise<void> {
    try {
      const watcher = watch(filePath);
      
      watcher.on('change', async (eventType) => {
        if (eventType === "change") {
          await this.handleFileChange(filePath);
        }
      });

      this.watchers.set(filePath, watcher);
    } catch (error) {
      console.warn(`Could not watch file ${filePath}:`, error);
    }
  }

  private async handleFileChange(filePath: string): Promise<void> {
    try {
      const oldHash = this.fileHashes.get(filePath);
      const content = await readFile(filePath, "utf-8");
      const newHash = this.calculateHash(content);

      if (oldHash !== newHash) {
        const stats = await stat(filePath);
        const lines = content.split("\n");

        const change: CodeChange = {
          id: this.generateChangeId(),
          filePath,
          changeType: "modified",
          timestamp: new Date().toISOString(),
          hash: newHash,
          size: stats.size,
          linesAdded: lines.length,
          linesDeleted: 0, // Would need diff analysis for accurate counts
          linesModified: lines.length,
          content,
          metadata: {
            author: "unknown",
            message: "File modified",
          },
        };

        this.changeHistory.set(change.id, change);
        this.fileHashes.set(filePath, newHash);

        // Analyze impact
        const impact = await this.analyzeChangeImpact(change);
        console.log(`📊 Impact analysis for ${filePath}: ${impact.impactLevel} (${impact.riskScore.toFixed(2)})`);
      }
    } catch (error) {
      console.error(`Failed to handle file change for ${filePath}:`, error);
    }
  }

  private async getAllFiles(): Promise<string[]> {
    const files: string[] = [];

    const scanDirectory = async (dir: string): Promise<void> => {
      try {
        const entries = await readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = join(dir, entry.name);

          if (entry.isDirectory()) {
            if (!["node_modules", ".git", "dist", "build"].includes(entry.name)) {
              await scanDirectory(fullPath);
            }
          } else if (entry.isFile()) {
            const ext = fullPath.split(".").pop();
            if (["ts", "tsx", "js", "jsx", "py", "go", "rs", "java"].includes(ext || "")) {
              files.push(fullPath);
            }
          }
        }
      } catch (error) {
        console.warn(`Could not scan directory ${dir}:`, error);
      }
    };

    await scanDirectory(this.codebasePath);
    return files;
  }

  private async findAffectedADRs(change: CodeChange): Promise<string[]> {
    const affectedADRs: string[] = [];

    // Analyze file path and content for ADR relevance
    const filePath = change.filePath.toLowerCase();
    const content = change.content?.toLowerCase() || "";

    for (const [adrId, adr] of this.adrCache) {
      // Check if file path matches ADR scope
      if (this.isFileRelevantToADR(filePath, adr)) {
        affectedADRs.push(adrId);
        continue;
      }

      // Check if content changes affect ADR
      if (this.isContentRelevantToADR(content, adr)) {
        affectedADRs.push(adrId);
      }
    }

    return affectedADRs;
  }

  private async identifyImpactAreas(change: CodeChange): Promise<string[]> {
    const impactAreas: string[] = [];
    const filePath = change.filePath.toLowerCase();
    const content = change.content?.toLowerCase() || "";

    // Security impact
    if (
      filePath.includes("auth") ||
      filePath.includes("security") ||
      content.includes("password") ||
      content.includes("token") ||
      content.includes("secret")
    ) {
      impactAreas.push("security");
    }

    // Performance impact
    if (
      filePath.includes("performance") ||
      filePath.includes("optimization") ||
      content.includes("cache") ||
      content.includes("async") ||
      content.includes("performance")
    ) {
      impactAreas.push("performance");
    }

    // Scalability impact
    if (
      filePath.includes("scaling") ||
      filePath.includes("load") ||
      content.includes("cluster") ||
      content.includes("distributed") ||
      content.includes("scaling")
    ) {
      impactAreas.push("scalability");
    }

    // Integration impact
    if (
      filePath.includes("api") ||
      filePath.includes("integration") ||
      content.includes("endpoint") ||
      content.includes("service") ||
      content.includes("integration")
    ) {
      impactAreas.push("integration");
    }

    // Maintainability impact
    if (
      filePath.includes("test") ||
      filePath.includes("util") ||
      content.includes("refactor") ||
      content.includes("cleanup") ||
      content.includes("maintain")
    ) {
      impactAreas.push("maintainability");
    }

    return impactAreas;
  }

  private async checkComplianceViolations(change: CodeChange): Promise<ComplianceViolation[]> {
    const violations: ComplianceViolation[] = [];
    const content = change.content || "";
    const lines = content.split("\n");

    // Check for large files (maintainability)
    if (lines.length > 200) {
      violations.push({
        type: "maintainability",
        severity: "medium",
        description: `File exceeds recommended length (${lines.length} lines)`,
        location: change.filePath,
        rule: "max-file-length",
        suggestion: "Consider splitting this file into smaller modules",
      });
    }

    // Check for long functions (maintainability)
    const longFunctions = this.findLongFunctions(content);
    for (const func of longFunctions) {
      violations.push({
        type: "maintainability",
        severity: "low",
        description: `Function exceeds recommended length (${func.lines} lines)`,
        location: `${change.filePath}:${func.line}`,
        rule: "max-function-length",
        suggestion: "Consider breaking this function into smaller functions",
      });
    }

    // Check for security issues
    const securityIssues = this.findSecurityIssues(content);
    for (const issue of securityIssues) {
      violations.push({
        type: "security",
        severity: issue.severity,
        description: issue.description,
        location: `${change.filePath}:${issue.line}`,
        rule: issue.rule,
        suggestion: issue.suggestion,
      });
    }

    // Check for performance issues
    const performanceIssues = this.findPerformanceIssues(content);
    for (const issue of performanceIssues) {
      violations.push({
        type: "performance",
        severity: issue.severity,
        description: issue.description,
        location: `${change.filePath}:${issue.line}`,
        rule: issue.rule,
        suggestion: issue.suggestion,
      });
    }

    return violations;
  }

  private async generateRecommendations(change: CodeChange, violations: ComplianceViolation[]): Promise<string[]> {
    const recommendations: string[] = [];

    // Generate recommendations based on violations
    for (const violation of violations) {
      recommendations.push(violation.suggestion);
    }

    // Generate recommendations based on change type
    if (change.changeType === "added") {
      recommendations.push("Consider adding tests for the new functionality");
      recommendations.push("Update documentation if this is a public API");
    } else if (change.changeType === "modified") {
      recommendations.push("Review existing tests to ensure they still pass");
      recommendations.push("Consider if this change affects other components");
    } else if (change.changeType === "deleted") {
      recommendations.push("Verify that no other code depends on the deleted functionality");
      recommendations.push("Update or remove related tests");
    }

    // Generate recommendations based on impact areas
    const impactAreas = await this.identifyImpactAreas(change);
    for (const area of impactAreas) {
      switch (area) {
        case "security":
          recommendations.push("Consider security review for this change");
          break;
        case "performance":
          recommendations.push("Consider performance testing for this change");
          break;
        case "scalability":
          recommendations.push("Consider load testing for this change");
          break;
        case "integration":
          recommendations.push("Consider integration testing for this change");
          break;
      }
    }

    return [...new Set(recommendations)]; // Remove duplicates
  }

  private calculateImpactLevel(
    affectedADRs: string[],
    violations: ComplianceViolation[]
  ): "low" | "medium" | "high" | "critical" {
    if (violations.some(v => v.severity === "critical")) {
      return "critical";
    }

    if (affectedADRs.length > 3 || violations.some(v => v.severity === "high")) {
      return "high";
    }

    if (affectedADRs.length > 1 || violations.some(v => v.severity === "medium")) {
      return "medium";
    }

    return "low";
  }

  private estimateEffort(change: CodeChange, violations: ComplianceViolation[]): number {
    let effort = 0;

    // Base effort based on change size
    effort += Math.max(0.5, change.linesAdded / 50);

    // Additional effort for violations
    for (const violation of violations) {
      switch (violation.severity) {
        case "critical":
          effort += 4;
          break;
        case "high":
          effort += 2;
          break;
        case "medium":
          effort += 1;
          break;
        case "low":
          effort += 0.5;
          break;
      }
    }

    return effort;
  }

  private calculateRiskScore(change: CodeChange, violations: ComplianceViolation[]): number {
    let risk = 0;

    // Base risk based on change size
    risk += Math.min(0.3, change.linesAdded / 1000);

    // Additional risk for violations
    for (const violation of violations) {
      switch (violation.severity) {
        case "critical":
          risk += 0.4;
          break;
        case "high":
          risk += 0.3;
          break;
        case "medium":
          risk += 0.2;
          break;
        case "low":
          risk += 0.1;
          break;
      }
    }

    return Math.min(1, risk);
  }

  private async findAffectedFiles(change: CodeChange): Promise<string[]> {
    // Simplified implementation - would need proper dependency analysis
    const affectedFiles: string[] = [];

    // Check for imports/exports that might affect other files
    const content = change.content || "";
    const importMatches = content.match(/import.*from\s+['"]([^'"]+)['"]/g);

    if (importMatches) {
      for (const match of importMatches) {
        const importPath = match.match(/['"]([^'"]+)['"]/)?.[1];
        if (importPath && importPath.startsWith(".")) {
          // This is a relative import, might affect other files
          affectedFiles.push(importPath);
        }
      }
    }

    return affectedFiles;
  }

  private async buildImpactChain(change: CodeChange, affectedFiles: string[]): Promise<string[][]> {
    // Simplified implementation - would build actual dependency chains
    return affectedFiles.map(file => [change.filePath, file]);
  }

  private async identifyBreakingChanges(change: CodeChange): Promise<string[]> {
    const breakingChanges: string[] = [];
    const content = change.content || "";

    // Check for common breaking change patterns
    if (content.includes("export") && content.includes("interface")) {
      breakingChanges.push("Interface changes may break consumers");
    }

    if (content.includes("function") && content.includes("async")) {
      breakingChanges.push("Async function changes may affect callers");
    }

    if (content.includes("class") && content.includes("extends")) {
      breakingChanges.push("Class inheritance changes may break subclasses");
    }

    return breakingChanges;
  }

  private estimateMigrationEffort(breakingChanges: string[]): number {
    return breakingChanges.length * 2; // 2 hours per breaking change
  }

  private isFileRelevantToADR(filePath: string, adr: ADRDocument): boolean {
    // Simplified implementation - would use more sophisticated matching
    const adrContent = (adr.context + " " + adr.decision).toLowerCase();
    const fileName = filePath.split("/").pop()?.toLowerCase() || "";

    return adrContent.includes(fileName) || filePath.includes(adr.id);
  }

  private isContentRelevantToADR(content: string, adr: ADRDocument): boolean {
    // Simplified implementation - would use more sophisticated analysis
    const adrContent = (adr.context + " " + adr.decision).toLowerCase();
    const keywords = adrContent.split(" ").filter(word => word.length > 4);

    return keywords.some(keyword => content.includes(keyword));
  }

  private findLongFunctions(content: string): Array<{ line: number; lines: number }> {
    const functions: Array<{ line: number; lines: number }> = [];
    const lines = content.split("\n");

    let inFunction = false;
    let functionStart = 0;
    let braceCount = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.includes("function") || line.includes("=>") || line.includes("class")) {
        inFunction = true;
        functionStart = i;
        braceCount = 0;
      }

      if (inFunction) {
        braceCount += (line.match(/\{/g) || []).length;
        braceCount -= (line.match(/\}/g) || []).length;

        if (braceCount === 0 && line.includes("}")) {
          const functionLines = i - functionStart + 1;
          if (functionLines > 50) {
            functions.push({ line: functionStart + 1, lines: functionLines });
          }
          inFunction = false;
        }
      }
    }

    return functions;
  }

  private findSecurityIssues(content: string): Array<{
    line: number;
    severity: "low" | "medium" | "high" | "critical";
    description: string;
    rule: string;
    suggestion: string;
  }> {
    const issues: Array<{
      line: number;
      severity: "low" | "medium" | "high" | "critical";
      description: string;
      rule: string;
      suggestion: string;
    }> = [];

    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check for hardcoded secrets
      if (line.includes("password") && line.includes("=") && !line.includes("process.env")) {
        issues.push({
          line: i + 1,
          severity: "critical",
          description: "Hardcoded password detected",
          rule: "no-hardcoded-secrets",
          suggestion: "Use environment variables or secure configuration",
        });
      }

      // Check for SQL injection risks
      if (line.includes("query") && line.includes("+") && !line.includes("prepared")) {
        issues.push({
          line: i + 1,
          severity: "high",
          description: "Potential SQL injection risk",
          rule: "no-sql-injection",
          suggestion: "Use parameterized queries or prepared statements",
        });
      }

      // Check for XSS risks
      if (line.includes("innerHTML") && line.includes("+")) {
        issues.push({
          line: i + 1,
          severity: "medium",
          description: "Potential XSS risk with innerHTML",
          rule: "no-xss",
          suggestion: "Use textContent or sanitize HTML content",
        });
      }
    }

    return issues;
  }

  private findPerformanceIssues(content: string): Array<{
    line: number;
    severity: "low" | "medium" | "high" | "critical";
    description: string;
    rule: string;
    suggestion: string;
  }> {
    const issues: Array<{
      line: number;
      severity: "low" | "medium" | "high" | "critical";
      description: string;
      rule: string;
      suggestion: string;
    }> = [];

    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check for synchronous file operations
      if (line.includes("readFileSync") || line.includes("writeFileSync")) {
        issues.push({
          line: i + 1,
          severity: "medium",
          description: "Synchronous file operation detected",
          rule: "no-sync-io",
          suggestion: "Use asynchronous file operations",
        });
      }

      // Check for blocking operations
      if (line.includes("while") && line.includes("true")) {
        issues.push({
          line: i + 1,
          severity: "high",
          description: "Infinite loop detected",
          rule: "no-infinite-loops",
          suggestion: "Add proper exit conditions",
        });
      }
    }

    return issues;
  }

  private async parseADR(filePath: string): Promise<ADRDocument | null> {
    try {
      const content = await readFile(filePath, "utf-8");
      const lines = content.split("\n");

      const adr: Partial<ADRDocument> = {};

      // Extract basic information
      const titleMatch = content.match(/^# ADR-(\d+): (.+)$/m);
      if (titleMatch) {
        adr.id = titleMatch[1];
        adr.title = titleMatch[2];
      }

      // Extract status
      const statusMatch = content.match(/\*\*(.*?)\*\*/);
      if (statusMatch) {
        adr.status = statusMatch[1].toLowerCase() as any;
      }

      return adr as ADRDocument;
    } catch (error) {
      console.error(`Failed to parse ADR ${filePath}:`, error);
      return null;
    }
  }

  private calculateHash(content: string): string {
    return createHash("sha256").update(content).digest("hex");
  }

  private generateChangeId(): string {
    return `change-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

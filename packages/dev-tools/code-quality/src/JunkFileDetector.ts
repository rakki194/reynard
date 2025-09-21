/**
 * Junk File Detector
 *
 * Advanced detection and analysis system for identifying Git-tracked development
 * artifacts and temporary files that shouldn't be tracked in version control.
 * Provides intelligent categorization, severity assessment, and comprehensive
 * reporting for maintaining clean repository standards.
 *
 * Core Capabilities:
 * - Python artifact detection (pyc, pyo, __pycache__, virtual environments)
 * - TypeScript/JavaScript artifact detection (source maps, build outputs, dependencies)
 * - Reynard-specific artifact detection (generated files, temporary data, cache files)
 * - Intelligent categorization with severity levels (critical, high, medium, low)
 * - Comprehensive reporting with actionable recommendations
 * - Integration with quality gates and CI/CD pipeline systems
 */

import { execSync } from "child_process";

export interface JunkFileResult {
  file: string;
  category: "python" | "typescript" | "reynard" | "general";
  reason: string;
  severity: "low" | "medium" | "high" | "critical";
}

export interface JunkFileAnalysis {
  totalFiles: number;
  pythonArtifacts: number;
  typescriptArtifacts: number;
  reynardArtifacts: number;
  generalArtifacts: number;
  criticalIssues: number;
  highIssues: number;
  mediumIssues: number;
  lowIssues: number;
  files: JunkFileResult[];
  recommendations: string[];
  qualityScore: number; // 0-100, higher is better
}

export class JunkFileDetector {
  private readonly projectRoot: string;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
  }

  /**
   * Run comprehensive junk file detection
   */
  async detectJunkFiles(): Promise<JunkFileAnalysis> {
    console.log("🔍 Scanning for potential junk files tracked by Git...");

    const pythonJunk = await this.detectPythonArtifacts();
    const typescriptJunk = await this.detectTypeScriptArtifacts();
    const reynardJunk = await this.detectReynardArtifacts();
    const generalJunk = await this.detectGeneralArtifacts();

    const allFiles = [...pythonJunk, ...typescriptJunk, ...reynardJunk, ...generalJunk];

    return this.analyzeResults(allFiles);
  }

  /**
   * Detect Python development artifacts
   */
  private async detectPythonArtifacts(): Promise<JunkFileResult[]> {
    const results: JunkFileResult[] = [];

    try {
      // Python bytecode files
      const pycFiles = this.runGitCommand('git ls-files | grep -E "\\.(pyc|pyo)$"');
      pycFiles.forEach(file => {
        results.push({
          file,
          category: "python",
          reason: "Python bytecode file",
          severity: "high"
        });
      });

      // Python cache directories
      const cacheDirs = this.runGitCommand('git ls-files | grep -E "__pycache__/"');
      cacheDirs.forEach(file => {
        results.push({
          file,
          category: "python",
          reason: "Python cache directory",
          severity: "high"
        });
      });

      // Python build artifacts
      const buildArtifacts = this.runGitCommand('git ls-files | grep -E "\\.(pyd|so)$|\\.egg-info/"');
      buildArtifacts.forEach(file => {
        results.push({
          file,
          category: "python",
          reason: "Python build artifact",
          severity: "medium"
        });
      });

      // Virtual environments (only if clearly temporary)
      const venvFiles = this.runGitCommand('git ls-files | grep -E "(venv|\\.venv|env|\\.env)/"');
      venvFiles.forEach(file => {
        results.push({
          file,
          category: "python",
          reason: "Virtual environment file",
          severity: "critical"
        });
      });

      // Python testing artifacts
      const testArtifacts = this.runGitCommand('git ls-files | grep -E "(\\.pytest_cache|\\.coverage|htmlcov|\\.tox)/"');
      testArtifacts.forEach(file => {
        results.push({
          file,
          category: "python",
          reason: "Python testing artifact",
          severity: "medium"
        });
      });

      // IDE temporary files
      const ideFiles = this.runGitCommand('git ls-files | grep -E "(\\.swp|\\.swo|\\.ropeproject|\\.mypy_cache)/"');
      ideFiles.forEach(file => {
        results.push({
          file,
          category: "python",
          reason: "IDE temporary file",
          severity: "low"
        });
      });

    } catch (error) {
      console.warn("⚠️ Error detecting Python artifacts:", error);
    }

    return results;
  }

  /**
   * Detect TypeScript/JavaScript development artifacts
   */
  private async detectTypeScriptArtifacts(): Promise<JunkFileResult[]> {
    const results: JunkFileResult[] = [];

    try {
      // Source maps
      const sourceMaps = this.runGitCommand('git ls-files | grep -E "\\.js\\.map$|\\.d\\.ts\\.map$"');
      sourceMaps.forEach(file => {
        results.push({
          file,
          category: "typescript",
          reason: "Source map file",
          severity: "medium"
        });
      });

      // Build directories (excluding legitimate ones)
      const buildDirs = this.runGitCommand('git ls-files | grep -E "(dist|build|out)/" | grep -v -E "(test-dist|examples/|packages/)"');
      buildDirs.forEach(file => {
        results.push({
          file,
          category: "typescript",
          reason: "Build directory",
          severity: "high"
        });
      });

      // Package manager files
      const packageFiles = this.runGitCommand('git ls-files | grep -E "node_modules/|package-lock\\.json|yarn\\.lock"');
      packageFiles.forEach(file => {
        results.push({
          file,
          category: "typescript",
          reason: "Package manager file",
          severity: "critical"
        });
      });

      // Package manager cache
      const packageCache = this.runGitCommand('git ls-files | grep -E "(\\.npm|\\.yarn|\\.pnpm)/"');
      packageCache.forEach(file => {
        results.push({
          file,
          category: "typescript",
          reason: "Package manager cache",
          severity: "high"
        });
      });

      // Build cache files
      const buildCache = this.runGitCommand('git ls-files | grep -E "\\.tsbuildinfo$|\\.eslintcache|\\.stylelintcache"');
      buildCache.forEach(file => {
        results.push({
          file,
          category: "typescript",
          reason: "Build cache file",
          severity: "medium"
        });
      });

      // Coverage directories
      const coverageDirs = this.runGitCommand('git ls-files | grep -E "(coverage|\\.nyc_output)/"');
      coverageDirs.forEach(file => {
        results.push({
          file,
          category: "typescript",
          reason: "Coverage directory",
          severity: "medium"
        });
      });

      // Build tool cache
      const toolCache = this.runGitCommand('git ls-files | grep -E "(\\.vite|\\.rollup\\.cache|\\.turbo)/"');
      toolCache.forEach(file => {
        results.push({
          file,
          category: "typescript",
          reason: "Build tool cache",
          severity: "medium"
        });
      });

      // Bundled files
      const bundledFiles = this.runGitCommand('git ls-files | grep -E "\\.(bundle|chunk|vendor)\\.js$"');
      bundledFiles.forEach(file => {
        results.push({
          file,
          category: "typescript",
          reason: "Bundled JavaScript file",
          severity: "high"
        });
      });

    } catch (error) {
      console.warn("⚠️ Error detecting TypeScript artifacts:", error);
    }

    return results;
  }

  /**
   * Detect Reynard-specific artifacts
   */
  private async detectReynardArtifacts(): Promise<JunkFileResult[]> {
    const results: JunkFileResult[] = [];

    try {
      // Generated files
      const generatedFiles = this.runGitCommand('git ls-files | grep -E "\\.generated\\.|\\.auto\\.|(temp|tmp|\\.temp)/"');
      generatedFiles.forEach(file => {
        results.push({
          file,
          category: "reynard",
          reason: "Generated or temporary file",
          severity: "medium"
        });
      });

      // Backup files
      const backupFiles = this.runGitCommand('git ls-files | grep -E "\\.(backup|bak|orig)$"');
      backupFiles.forEach(file => {
        results.push({
          file,
          category: "reynard",
          reason: "Backup file",
          severity: "low"
        });
      });

      // MCP temporary files
      const mcpFiles = this.runGitCommand('git ls-files | grep -E "\\.mcp\\.log$|(\\.mcp-cache|mcp-temp)/"');
      mcpFiles.forEach(file => {
        results.push({
          file,
          category: "reynard",
          reason: "MCP temporary file",
          severity: "medium"
        });
      });

      // ECS simulation files
      const ecsFiles = this.runGitCommand('git ls-files | grep -E "\\.sim\\.log$|(\\.ecs-cache|simulation-temp)/"');
      ecsFiles.forEach(file => {
        results.push({
          file,
          category: "reynard",
          reason: "ECS simulation temporary file",
          severity: "medium"
        });
      });

      // Agent cache files
      const agentFiles = this.runGitCommand('git ls-files | grep -E "agent-names-.*\\.json$|(\\.agent-cache|agent-temp)/"');
      agentFiles.forEach(file => {
        results.push({
          file,
          category: "reynard",
          reason: "Agent cache file",
          severity: "medium"
        });
      });

      // Agent log files
      const agentLogs = this.runGitCommand('git ls-files | grep -E "\\.agent\\.log$"');
      agentLogs.forEach(file => {
        results.push({
          file,
          category: "reynard",
          reason: "Agent log file",
          severity: "low"
        });
      });

    } catch (error) {
      console.warn("⚠️ Error detecting Reynard artifacts:", error);
    }

    return results;
  }

  /**
   * Detect general junk files
   */
  private async detectGeneralArtifacts(): Promise<JunkFileResult[]> {
    const results: JunkFileResult[] = [];

    try {
      // Log and temporary files
      const logFiles = this.runGitCommand('git ls-files | grep -E "\\.(log|tmp|temp)$|\\.DS_Store|Thumbs\\.db"');
      logFiles.forEach(file => {
        results.push({
          file,
          category: "general",
          reason: "Log or temporary file",
          severity: "low"
        });
      });

    } catch (error) {
      console.warn("⚠️ Error detecting general artifacts:", error);
    }

    return results;
  }

  /**
   * Run a git command and return the output as an array of lines
   */
  private runGitCommand(command: string): string[] {
    try {
      const output = execSync(command, { 
        cwd: this.projectRoot,
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
      });
      return output.trim().split('\n').filter(line => line.trim().length > 0);
    } catch (error) {
      // Command failed or no matches found
      return [];
    }
  }

  /**
   * Analyze the detection results and generate summary
   */
  private analyzeResults(files: JunkFileResult[]): JunkFileAnalysis {
    const pythonArtifacts = files.filter(f => f.category === "python").length;
    const typescriptArtifacts = files.filter(f => f.category === "typescript").length;
    const reynardArtifacts = files.filter(f => f.category === "reynard").length;
    const generalArtifacts = files.filter(f => f.category === "general").length;

    const criticalIssues = files.filter(f => f.severity === "critical").length;
    const highIssues = files.filter(f => f.severity === "high").length;
    const mediumIssues = files.filter(f => f.severity === "medium").length;
    const lowIssues = files.filter(f => f.severity === "low").length;

    // Calculate quality score (0-100, higher is better)
    const totalIssues = files.length;
    const qualityScore = totalIssues === 0 ? 100 : Math.max(0, 100 - (criticalIssues * 20 + highIssues * 10 + mediumIssues * 5 + lowIssues * 2));

    const recommendations = this.generateRecommendations(files);

    return {
      totalFiles: files.length,
      pythonArtifacts,
      typescriptArtifacts,
      reynardArtifacts,
      generalArtifacts,
      criticalIssues,
      highIssues,
      mediumIssues,
      lowIssues,
      files,
      recommendations,
      qualityScore: Math.round(qualityScore)
    };
  }

  /**
   * Generate recommendations based on detected issues
   */
  private generateRecommendations(files: JunkFileResult[]): string[] {
    const recommendations: string[] = [];

    if (files.length === 0) {
      recommendations.push("✅ No junk files detected! Repository is clean.");
      return recommendations;
    }

    recommendations.push("🔧 Recommended actions:");

    const criticalFiles = files.filter(f => f.severity === "critical");
    if (criticalFiles.length > 0) {
      recommendations.push(`1. Remove ${criticalFiles.length} critical files from Git tracking using 'git rm --cached <file>'`);
    }

    const highFiles = files.filter(f => f.severity === "high");
    if (highFiles.length > 0) {
      recommendations.push(`2. Review and remove ${highFiles.length} high-priority files from Git tracking`);
    }

    const mediumFiles = files.filter(f => f.severity === "medium");
    if (mediumFiles.length > 0) {
      recommendations.push(`3. Consider removing ${mediumFiles.length} medium-priority files from Git tracking`);
    }

    recommendations.push("4. Add appropriate patterns to .gitignore to prevent future tracking");
    recommendations.push("5. Commit the removal and .gitignore updates");
    recommendations.push("6. Re-run this detection after cleanup");

    return recommendations;
  }

  /**
   * Generate a detailed report
   */
  generateReport(analysis: JunkFileAnalysis): string {
    let report = "🔍 Git-Tracked Junk File Detection Report\n";
    report += "=" .repeat(50) + "\n\n";

    report += "📊 Summary:\n";
    report += `   🐍 Python artifacts: ${analysis.pythonArtifacts} files\n`;
    report += `   📦 TypeScript/JS artifacts: ${analysis.typescriptArtifacts} files\n`;
    report += `   🦊 Reynard-specific artifacts: ${analysis.reynardArtifacts} files\n`;
    report += `   📋 General artifacts: ${analysis.generalArtifacts} files\n`;
    report += `   📋 Total tracked junk files: ${analysis.totalFiles} files\n\n`;

    report += "⚠️ Severity Breakdown:\n";
    report += `   🔴 Critical: ${analysis.criticalIssues} files\n`;
    report += `   🟠 High: ${analysis.highIssues} files\n`;
    report += `   🟡 Medium: ${analysis.mediumIssues} files\n`;
    report += `   🟢 Low: ${analysis.lowIssues} files\n\n`;

    report += `📈 Quality Score: ${analysis.qualityScore}/100\n\n`;

    if (analysis.files.length > 0) {
      report += "📁 Detected Files:\n";
      analysis.files.forEach(file => {
        const severityEmoji = {
          critical: "🔴",
          high: "🟠",
          medium: "🟡",
          low: "🟢"
        }[file.severity];
        
        report += `   ${severityEmoji} ${file.file} (${file.category}: ${file.reason})\n`;
      });
      report += "\n";
    }

    report += "💡 Recommendations:\n";
    analysis.recommendations.forEach(rec => {
      report += `   ${rec}\n`;
    });

    return report;
  }
}

/**
 * Coverage Integration Utilities
 * 
 * Provides utilities for integrating E2E code coverage with Vitest
 * and generating comprehensive coverage reports across the entire ecosystem.
 */

import { promises as fs } from "fs";
import { join, resolve } from "path";
import { spawn } from "child_process";

export interface CoverageData {
  lines: { total: number; covered: number; percentage: number };
  functions: { total: number; covered: number; percentage: number };
  branches: { total: number; covered: number; percentage: number };
  statements: { total: number; covered: number; percentage: number };
}

export interface CoverageReport {
  type: "unit" | "e2e" | "combined";
  timestamp: string;
  summary: CoverageData;
  files: Array<{
    path: string;
    coverage: CoverageData;
  }>;
}

/**
 * Coverage Integration Manager
 */
export class CoverageIntegration {
  private readonly workspaceRoot: string;
  private readonly coverageDir: string;
  private readonly e2eCoverageDir: string;
  private readonly vitestCoverageDir: string;

  constructor(workspaceRoot?: string) {
    this.workspaceRoot = workspaceRoot || resolve(process.cwd(), "..");
    this.coverageDir = join(this.workspaceRoot, "coverage");
    this.e2eCoverageDir = join(this.coverageDir, "e2e");
    this.vitestCoverageDir = join(this.coverageDir, "vitest");
  }

  /**
   * Initialize coverage directories and configuration
   */
  async initialize(): Promise<void> {
    await fs.mkdir(this.coverageDir, { recursive: true });
    await fs.mkdir(this.e2eCoverageDir, { recursive: true });
    await fs.mkdir(this.vitestCoverageDir, { recursive: true });

    // Create coverage integration config
    const config = {
      enabled: true,
      providers: ["vitest", "playwright"],
      outputDir: this.coverageDir,
      reportFormats: ["html", "lcov", "json", "text"],
      thresholds: {
        global: {
          lines: 80,
          functions: 80,
          branches: 80,
          statements: 80,
        },
        e2e: {
          lines: 70,
          functions: 70,
          branches: 70,
          statements: 70,
        },
      },
    };

    await fs.writeFile(
      join(this.coverageDir, "coverage-config.json"),
      JSON.stringify(config, null, 2)
    );
  }

  /**
   * Collect coverage from browser execution
   */
  async collectBrowserCoverage(page: any): Promise<void> {
    try {
      // Collect JavaScript coverage
      const jsCoverage = await page.coverage.stopJSCoverage();
      
      // Save coverage data
      const coverageFile = join(
        this.e2eCoverageDir,
        `js-coverage-${Date.now()}.json`
      );
      
      await fs.writeFile(
        coverageFile,
        JSON.stringify(jsCoverage, null, 2)
      );

      // Collect CSS coverage if available
      try {
        const cssCoverage = await page.coverage.stopCSSCoverage();
        const cssCoverageFile = join(
          this.e2eCoverageDir,
          `css-coverage-${Date.now()}.json`
        );
        
        await fs.writeFile(
          cssCoverageFile,
          JSON.stringify(cssCoverage, null, 2)
        );
      } catch (error) {
        // CSS coverage might not be available
        console.log("CSS coverage not available:", error.message);
      }
    } catch (error) {
      console.error("Error collecting browser coverage:", error);
    }
  }

  /**
   * Merge E2E coverage with Vitest coverage
   */
  async mergeCoverageReports(): Promise<CoverageReport> {
    const reports: CoverageReport[] = [];

    // Load Vitest coverage
    try {
      const vitestReport = await this.loadVitestCoverage();
      if (vitestReport) {
        reports.push(vitestReport);
      }
    } catch (error) {
      console.log("No Vitest coverage found:", error.message);
    }

    // Load E2E coverage
    try {
      const e2eReport = await this.loadE2ECoverage();
      if (e2eReport) {
        reports.push(e2eReport);
      }
    } catch (error) {
      console.log("No E2E coverage found:", error.message);
    }

    // Merge reports
    const mergedReport = this.mergeReports(reports);

    // Save merged report
    await fs.writeFile(
      join(this.coverageDir, "merged-coverage.json"),
      JSON.stringify(mergedReport, null, 2)
    );

    return mergedReport;
  }

  /**
   * Generate comprehensive coverage report
   */
  async generateComprehensiveReport(): Promise<void> {
    const mergedReport = await this.mergeCoverageReports();

    // Generate HTML report
    await this.generateHTMLReport(mergedReport);

    // Generate text summary
    await this.generateTextSummary(mergedReport);

    // Generate LCOV report for external tools
    await this.generateLCOVReport(mergedReport);
  }

  /**
   * Run Vitest coverage for comparison
   */
  async runVitestCoverage(): Promise<void> {
    return new Promise((resolve, reject) => {
      const vitestProcess = spawn(
        "npx",
        ["vitest", "run", "--coverage", "--reporter=json"],
        {
          cwd: this.workspaceRoot,
          stdio: ["inherit", "pipe", "pipe"],
        }
      );

      let output = "";
      vitestProcess.stdout.on("data", (data) => {
        output += data.toString();
      });

      vitestProcess.on("close", (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Vitest coverage failed with code ${code}`));
        }
      });
    });
  }

  /**
   * Load Vitest coverage data
   */
  private async loadVitestCoverage(): Promise<CoverageReport | null> {
    try {
      const vitestCoverageFile = join(this.vitestCoverageDir, "coverage-summary.json");
      const data = await fs.readFile(vitestCoverageFile, "utf-8");
      const coverage = JSON.parse(data);

      return {
        type: "unit",
        timestamp: new Date().toISOString(),
        summary: this.extractCoverageData(coverage.total || coverage),
        files: Object.entries(coverage)
          .filter(([key]) => key !== "total")
          .map(([path, fileCoverage]: [string, any]) => ({
            path,
            coverage: this.extractCoverageData(fileCoverage),
          })),
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Load E2E coverage data
   */
  private async loadE2ECoverage(): Promise<CoverageReport | null> {
    try {
      const e2eCoverageFiles = await fs.readdir(this.e2eCoverageDir);
      const jsCoverageFiles = e2eCoverageFiles.filter((file) =>
        file.startsWith("js-coverage-")
      );

      if (jsCoverageFiles.length === 0) {
        return null;
      }

      // Process E2E coverage files
      const coverageData = await this.processE2ECoverageFiles(jsCoverageFiles);

      return {
        type: "e2e",
        timestamp: new Date().toISOString(),
        summary: coverageData.summary,
        files: coverageData.files,
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Process E2E coverage files
   */
  private async processE2ECoverageFiles(files: string[]): Promise<{
    summary: CoverageData;
    files: Array<{ path: string; coverage: CoverageData }>;
  }> {
    const summary: CoverageData = {
      lines: { total: 0, covered: 0, percentage: 0 },
      functions: { total: 0, covered: 0, percentage: 0 },
      branches: { total: 0, covered: 0, percentage: 0 },
      statements: { total: 0, covered: 0, percentage: 0 },
    };

    const filesCoverage: Array<{ path: string; coverage: CoverageData }> = [];

    for (const file of files) {
      try {
        const filePath = join(this.e2eCoverageDir, file);
        const data = await fs.readFile(filePath, "utf-8");
        const coverage = JSON.parse(data);

        // Process coverage data (this would need to be implemented based on actual format)
        // For now, return placeholder data
      } catch (error) {
        console.error(`Error processing coverage file ${file}:`, error);
      }
    }

    return { summary, files: filesCoverage };
  }

  /**
   * Merge multiple coverage reports
   */
  private mergeReports(reports: CoverageReport[]): CoverageReport {
    if (reports.length === 0) {
      return {
        type: "combined",
        timestamp: new Date().toISOString(),
        summary: {
          lines: { total: 0, covered: 0, percentage: 0 },
          functions: { total: 0, covered: 0, percentage: 0 },
          branches: { total: 0, covered: 0, percentage: 0 },
          statements: { total: 0, covered: 0, percentage: 0 },
        },
        files: [],
      };
    }

    if (reports.length === 1) {
      return { ...reports[0], type: "combined" };
    }

    // Merge multiple reports
    const mergedSummary: CoverageData = {
      lines: { total: 0, covered: 0, percentage: 0 },
      functions: { total: 0, covered: 0, percentage: 0 },
      branches: { total: 0, covered: 0, percentage: 0 },
      statements: { total: 0, covered: 0, percentage: 0 },
    };

    const allFiles: Array<{ path: string; coverage: CoverageData }> = [];

    for (const report of reports) {
      mergedSummary.lines.total += report.summary.lines.total;
      mergedSummary.lines.covered += report.summary.lines.covered;
      mergedSummary.functions.total += report.summary.functions.total;
      mergedSummary.functions.covered += report.summary.functions.covered;
      mergedSummary.branches.total += report.summary.branches.total;
      mergedSummary.branches.covered += report.summary.branches.covered;
      mergedSummary.statements.total += report.summary.statements.total;
      mergedSummary.statements.covered += report.summary.statements.covered;

      allFiles.push(...report.files);
    }

    // Calculate percentages
    mergedSummary.lines.percentage = this.calculatePercentage(
      mergedSummary.lines.covered,
      mergedSummary.lines.total
    );
    mergedSummary.functions.percentage = this.calculatePercentage(
      mergedSummary.functions.covered,
      mergedSummary.functions.total
    );
    mergedSummary.branches.percentage = this.calculatePercentage(
      mergedSummary.branches.covered,
      mergedSummary.branches.total
    );
    mergedSummary.statements.percentage = this.calculatePercentage(
      mergedSummary.statements.covered,
      mergedSummary.statements.total
    );

    return {
      type: "combined",
      timestamp: new Date().toISOString(),
      summary: mergedSummary,
      files: allFiles,
    };
  }

  /**
   * Extract coverage data from various formats
   */
  private extractCoverageData(data: any): CoverageData {
    return {
      lines: {
        total: data.lines?.total || 0,
        covered: data.lines?.covered || 0,
        percentage: data.lines?.pct || 0,
      },
      functions: {
        total: data.functions?.total || 0,
        covered: data.functions?.covered || 0,
        percentage: data.functions?.pct || 0,
      },
      branches: {
        total: data.branches?.total || 0,
        covered: data.branches?.covered || 0,
        percentage: data.branches?.pct || 0,
      },
      statements: {
        total: data.statements?.total || 0,
        covered: data.statements?.covered || 0,
        percentage: data.statements?.pct || 0,
      },
    };
  }

  /**
   * Calculate percentage safely
   */
  private calculatePercentage(covered: number, total: number): number {
    return total > 0 ? Math.round((covered / total) * 100 * 100) / 100 : 0;
  }

  /**
   * Generate HTML report
   */
  private async generateHTMLReport(report: CoverageReport): Promise<void> {
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Reynard Comprehensive Code Coverage Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 30px 0; }
        .metric { background: #f9f9f9; padding: 20px; border-radius: 8px; text-align: center; border: 1px solid #e0e0e0; }
        .metric-value { font-size: 28px; font-weight: bold; color: #2196F3; }
        .metric-label { color: #666; margin-top: 8px; font-size: 14px; }
        .good { color: #4CAF50; }
        .warning { color: #FF9800; }
        .poor { color: #F44336; }
        .files-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .files-table th, .files-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        .files-table th { background: #f5f5f5; font-weight: bold; }
        .percentage { font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🦊 Reynard Comprehensive Code Coverage</h1>
            <p>Report Type: ${report.type.toUpperCase()}</p>
            <p>Generated: ${new Date(report.timestamp).toLocaleString()}</p>
        </div>
        
        <div class="metrics">
            <div class="metric">
                <div class="metric-value ${this.getCoverageClass(report.summary.lines.percentage)}">${report.summary.lines.percentage}%</div>
                <div class="metric-label">Lines (${report.summary.lines.covered}/${report.summary.lines.total})</div>
            </div>
            <div class="metric">
                <div class="metric-value ${this.getCoverageClass(report.summary.functions.percentage)}">${report.summary.functions.percentage}%</div>
                <div class="metric-label">Functions (${report.summary.functions.covered}/${report.summary.functions.total})</div>
            </div>
            <div class="metric">
                <div class="metric-value ${this.getCoverageClass(report.summary.branches.percentage)}">${report.summary.branches.percentage}%</div>
                <div class="metric-label">Branches (${report.summary.branches.covered}/${report.summary.branches.total})</div>
            </div>
            <div class="metric">
                <div class="metric-value ${this.getCoverageClass(report.summary.statements.percentage)}">${report.summary.statements.percentage}%</div>
                <div class="metric-label">Statements (${report.summary.statements.covered}/${report.summary.statements.total})</div>
            </div>
        </div>
        
        <h2>Files Coverage (${report.files.length} files)</h2>
        <table class="files-table">
            <thead>
                <tr>
                    <th>File</th>
                    <th>Lines</th>
                    <th>Functions</th>
                    <th>Branches</th>
                    <th>Statements</th>
                </tr>
            </thead>
            <tbody>
                ${report.files.map(file => `
                    <tr>
                        <td>${file.path}</td>
                        <td class="percentage ${this.getCoverageClass(file.coverage.lines.percentage)}">${file.coverage.lines.percentage}%</td>
                        <td class="percentage ${this.getCoverageClass(file.coverage.functions.percentage)}">${file.coverage.functions.percentage}%</td>
                        <td class="percentage ${this.getCoverageClass(file.coverage.branches.percentage)}">${file.coverage.branches.percentage}%</td>
                        <td class="percentage ${this.getCoverageClass(file.coverage.statements.percentage)}">${file.coverage.statements.percentage}%</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
</body>
</html>`;

    await fs.writeFile(join(this.coverageDir, "comprehensive-report.html"), html);
  }

  /**
   * Generate text summary
   */
  private async generateTextSummary(report: CoverageReport): Promise<void> {
    const summary = `
🦊 Reynard Comprehensive Code Coverage Summary
==============================================

Report Type: ${report.type.toUpperCase()}
Generated: ${new Date(report.timestamp).toLocaleString()}

Overall Coverage:
  Lines:      ${report.summary.lines.percentage}% (${report.summary.lines.covered}/${report.summary.lines.total})
  Functions:  ${report.summary.functions.percentage}% (${report.summary.functions.covered}/${report.summary.functions.total})
  Branches:   ${report.summary.branches.percentage}% (${report.summary.branches.covered}/${report.summary.branches.total})
  Statements: ${report.summary.statements.percentage}% (${report.summary.statements.covered}/${report.summary.statements.total})

Files Analyzed: ${report.files.length}

Coverage Status:
  ${report.summary.lines.percentage >= 80 ? '✅' : report.summary.lines.percentage >= 60 ? '⚠️' : '❌'} Lines Coverage: ${this.getCoverageStatus(report.summary.lines.percentage)}
  ${report.summary.functions.percentage >= 80 ? '✅' : report.summary.functions.percentage >= 60 ? '⚠️' : '❌'} Functions Coverage: ${this.getCoverageStatus(report.summary.functions.percentage)}
  ${report.summary.branches.percentage >= 80 ? '✅' : report.summary.branches.percentage >= 60 ? '⚠️' : '❌'} Branches Coverage: ${this.getCoverageStatus(report.summary.branches.percentage)}
  ${report.summary.statements.percentage >= 80 ? '✅' : report.summary.statements.percentage >= 60 ? '⚠️' : '❌'} Statements Coverage: ${this.getCoverageStatus(report.summary.statements.percentage)}
`;

    await fs.writeFile(join(this.coverageDir, "coverage-summary.txt"), summary);
  }

  /**
   * Generate LCOV report for external tools
   */
  private async generateLCOVReport(report: CoverageReport): Promise<void> {
    // LCOV format implementation would go here
    const lcov = `# Reynard Coverage Report\n# Generated: ${report.timestamp}\n`;
    await fs.writeFile(join(this.coverageDir, "lcov.info"), lcov);
  }

  /**
   * Get CSS class for coverage percentage
   */
  private getCoverageClass(percentage: number): string {
    if (percentage >= 80) return "good";
    if (percentage >= 60) return "warning";
    return "poor";
  }

  /**
   * Get coverage status description
   */
  private getCoverageStatus(percentage: number): string {
    if (percentage >= 80) return "Good";
    if (percentage >= 60) return "Needs Improvement";
    return "Poor";
  }
}

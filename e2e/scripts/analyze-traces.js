#!/usr/bin/env node

/**
 * 🦦 TRACE ANALYSIS SCRIPT
 *
 * *splashes with trace analysis excitement* Command-line tool for
 * analyzing Playwright traces and generating performance reports.
 */

const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const { promisify } = require("util");

const execAsync = promisify(exec);

class TraceAnalyzerCLI {
  constructor() {
    this.tracesDir = "./results/traces";
    this.reportsDir = "./results/reports";
  }

  async analyzeTraces() {
    console.log("🦦 Starting trace analysis...");

    // Ensure directories exist
    this.ensureDirectories();

    // Find all trace files
    const traceFiles = this.findTraceFiles();

    if (traceFiles.length === 0) {
      console.log("❌ No trace files found in", this.tracesDir);
      return;
    }

    console.log(`📊 Found ${traceFiles.length} trace files`);

    // Analyze each trace
    const analyses = [];
    for (const traceFile of traceFiles) {
      console.log(`🔍 Analyzing ${path.basename(traceFile)}...`);
      const analysis = await this.analyzeTrace(traceFile);
      analyses.push(analysis);
    }

    // Generate comprehensive report
    await this.generateComprehensiveReport(analyses);

    console.log("✅ Trace analysis completed");
  }

  ensureDirectories() {
    [this.tracesDir, this.reportsDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 Created directory: ${dir}`);
      }
    });
  }

  findTraceFiles() {
    if (!fs.existsSync(this.tracesDir)) {
      return [];
    }

    return fs
      .readdirSync(this.tracesDir)
      .filter(file => file.endsWith(".zip"))
      .map(file => path.join(this.tracesDir, file));
  }

  async analyzeTrace(traceFile) {
    try {
      // Extract trace information using Playwright CLI
      const { stdout } = await execAsync(`npx playwright show-trace --list "${traceFile}"`);

      // Parse trace information
      const traceInfo = this.parseTraceInfo(stdout);

      return {
        file: path.basename(traceFile),
        path: traceFile,
        ...traceInfo,
        analyzedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error(`❌ Failed to analyze ${traceFile}:`, error.message);
      return {
        file: path.basename(traceFile),
        path: traceFile,
        error: error.message,
        analyzedAt: new Date().toISOString(),
      };
    }
  }

  parseTraceInfo(stdout) {
    // This is a simplified parser - in a real implementation,
    // you would parse the actual trace data
    const lines = stdout.split("\n");

    return {
      actions: lines.filter(line => line.includes("action")).length,
      networkRequests: lines.filter(line => line.includes("request")).length,
      consoleLogs: lines.filter(line => line.includes("console")).length,
      errors: lines.filter(line => line.includes("error")).length,
      screenshots: lines.filter(line => line.includes("screenshot")).length,
    };
  }

  async generateComprehensiveReport(analyses) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const reportPath = path.join(this.reportsDir, `trace-analysis-${timestamp}.md`);

    const report = this.generateReportContent(analyses);

    fs.writeFileSync(reportPath, report);
    console.log(`📊 Comprehensive report saved: ${reportPath}`);

    // Also save as JSON for programmatic access
    const jsonPath = path.join(this.reportsDir, `trace-analysis-${timestamp}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(analyses, null, 2));
    console.log(`📊 JSON report saved: ${jsonPath}`);
  }

  generateReportContent(analyses) {
    const totalTraces = analyses.length;
    const successfulAnalyses = analyses.filter(a => !a.error);
    const failedAnalyses = analyses.filter(a => a.error);

    return `
# 🦦 Trace Analysis Report

Generated: ${new Date().toISOString()}

## Summary
- **Total Traces**: ${totalTraces}
- **Successfully Analyzed**: ${successfulAnalyses.length}
- **Failed Analyses**: ${failedAnalyses.length}

## Trace Details

${analyses
  .map(
    analysis => `
### ${analysis.file}
- **Path**: ${analysis.path}
- **Analyzed At**: ${analysis.analyzedAt}
${
  analysis.error
    ? `- **Error**: ${analysis.error}`
    : `- **Actions**: ${analysis.actions}
- **Network Requests**: ${analysis.networkRequests}
- **Console Logs**: ${analysis.consoleLogs}
- **Errors**: ${analysis.errors}
- **Screenshots**: ${analysis.screenshots}`
}
`
  )
  .join("")}

## Recommendations

${this.generateRecommendations(analyses)}

## Next Steps

1. Review failed analyses and fix any issues
2. Use Playwright trace viewer for detailed inspection: \`npx playwright show-trace <trace-file>\`
3. Set up automated trace analysis in CI/CD pipeline
4. Create performance baselines for comparison
5. Implement trace comparison tools for regression detection
`;
  }

  generateRecommendations(analyses) {
    const recommendations = [];

    const failedCount = analyses.filter(a => a.error).length;
    if (failedCount > 0) {
      recommendations.push(`- Fix ${failedCount} failed trace analyses`);
    }

    const highErrorCount = analyses.filter(a => !a.error && a.errors > 5).length;
    if (highErrorCount > 0) {
      recommendations.push(`- Investigate ${highErrorCount} traces with high error counts`);
    }

    const highNetworkCount = analyses.filter(a => !a.error && a.networkRequests > 100).length;
    if (highNetworkCount > 0) {
      recommendations.push(`- Optimize ${highNetworkCount} traces with excessive network requests`);
    }

    if (recommendations.length === 0) {
      recommendations.push("- All traces analyzed successfully");
      recommendations.push("- Consider setting up automated trace analysis");
    }

    return recommendations.join("\n");
  }
}

// CLI execution
if (require.main === module) {
  const analyzer = new TraceAnalyzerCLI();
  analyzer.analyzeTraces().catch(console.error);
}

module.exports = TraceAnalyzerCLI;

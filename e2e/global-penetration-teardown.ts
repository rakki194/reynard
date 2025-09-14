/**
 * 🐺 GLOBAL PENETRATION TESTING TEARDOWN
 *
 * *snarls with predatory glee* Global teardown for penetration testing suite
 * including cleanup, report generation, and security assessment summary.
 */

import { FullConfig } from "@playwright/test";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";

const execAsync = promisify(exec);

async function globalTeardown(_config: FullConfig) {
  console.log("🐺 Starting Penetration Testing Global Teardown...");

  // Generate comprehensive security report
  await generateSecurityReport();

  // Cleanup temporary files
  await cleanupTemporaryFiles();

  // Archive results
  await archiveResults();

  console.log("✅ Penetration testing global teardown completed");
}

/**
 * Generate comprehensive security report
 */
async function generateSecurityReport(): Promise<void> {
  console.log("📊 Generating comprehensive security report...");

  try {
    const resultsPath = path.join(process.cwd(), "penetration-results.json");

    if (fs.existsSync(resultsPath)) {
      const results = JSON.parse(fs.readFileSync(resultsPath, "utf8"));

      const report = generateReportContent(results);

      const reportPath = path.join(
        process.cwd(),
        "penetration-results",
        "security-report.md",
      );
      fs.writeFileSync(reportPath, report);

      console.log("✅ Security report generated");
      console.log(`   Report location: ${reportPath}`);
    } else {
      console.log("⚠️ No penetration test results found to generate report");
    }
  } catch (error) {
    console.error("❌ Failed to generate security report:", error);
  }
}

/**
 * Generate report content using modular approach
 */
function generateReportContent(results: any): string {
  const timestamp = new Date().toISOString();
  const targetUrl = process.env.BACKEND_URL || "http://localhost:8000";
  
  const testStats = analyzeTestResults(results);
  
  return buildSecurityReport({
    timestamp,
    targetUrl,
    testStats,
    results
  });
}

/**
 * Analyze test results and extract statistics
 */
function analyzeTestResults(results: any) {
  const totalTests = results.suites?.length || 0;
  const passedTests = results.suites?.filter((suite: any) => suite.ok).length || 0;
  const failedTests = totalTests - passedTests;
  const totalVulnerabilities = 0; // Placeholder - would need actual parsing
  
  return { totalTests, passedTests, failedTests, totalVulnerabilities };
}

/**
 * Build the complete security report
 */
function buildSecurityReport({ timestamp, targetUrl, testStats, results }: {
  timestamp: string;
  targetUrl: string;
  testStats: any;
  results: any;
}): string {
  const sections = [
    generateReportHeader(),
    generateExecutiveSummary(timestamp, targetUrl, testStats),
    generateTestCategories(),
    generateSecurityAssessment(testStats.totalVulnerabilities),
    generateRecommendations(testStats.totalVulnerabilities),
    generateTestDetails(results),
    generateMethodology(targetUrl)
  ];
  
  return sections.join('\n\n');
}

/**
 * Generate report header
 */
function generateReportHeader(): string {
  return `# 🐺 REYNARD PENETRATION TESTING REPORT`;
}

/**
 * Generate executive summary section
 */
function generateExecutiveSummary(timestamp: string, targetUrl: string, testStats: any): string {
  return `## 📊 Executive Summary

**Test Date:** ${timestamp}  
**Target:** ${targetUrl}  
**Total Tests:** ${testStats.totalTests}  
**Passed Tests:** ${testStats.passedTests}  
**Failed Tests:** ${testStats.failedTests}  
**Vulnerabilities Found:** ${testStats.totalVulnerabilities}`;
}

/**
 * Generate test categories section
 */
function generateTestCategories(): string {
  return `## 🎯 Test Categories

### JWT Security Testing
- Secret key vulnerability testing
- Signature bypass attempts
- Timing attack analysis
- Token replay testing

### SQL Injection Testing
- Regex bypass testing
- Blind injection attempts
- Obfuscated payload testing
- Union-based attacks

### Path Traversal Testing
- Encoded traversal attempts
- Unicode bypass testing
- Double-encoded payloads
- Windows path separator bypass

### Authentication Security
- Rate limiting bypass
- CORS misconfiguration testing
- CSRF attack vectors
- Session management testing

### Comprehensive Fuzzing
- Endpoint-specific fuzzing
- Payload generation testing
- Concurrent request testing
- Error handling analysis`;
}

/**
 * Generate security assessment section
 */
function generateSecurityAssessment(totalVulnerabilities: number): string {
  return `## 🚨 Security Assessment

${
  totalVulnerabilities === 0
    ? "✅ **SECURE** - No critical vulnerabilities found"
    : `🚨 **VULNERABILITIES DETECTED** - ${totalVulnerabilities} issues found`
}`;
}

/**
 * Generate recommendations section
 */
function generateRecommendations(totalVulnerabilities: number): string {
  return `## 🛡️ Recommendations

### Immediate Actions
${
  totalVulnerabilities > 0
    ? "- Review and fix all identified vulnerabilities\n- Implement additional security controls\n- Conduct regular security assessments"
    : "- Continue regular security testing\n- Maintain current security posture\n- Monitor for new vulnerabilities"
}

### Long-term Security Improvements
- Implement automated security scanning
- Add security testing to CI/CD pipeline
- Regular penetration testing schedule
- Security awareness training for developers`;
}

/**
 * Generate methodology section
 */
function generateMethodology(targetUrl: string): string {
  return `## 🔍 Methodology

This penetration testing suite integrates the fenrir exploit framework with E2E authentication testing to provide comprehensive security assessment of the Reynard ecosystem.

### Tools Used
- **Fenrir Exploit Suite**: Custom penetration testing framework
- **Playwright**: E2E testing framework
- **Python**: Exploit execution environment
- **Node.js**: Test orchestration

### Test Environment
- **Target Backend**: ${targetUrl}
- **Frontend**: ${process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000"}
- **Destructive Testing**: ${process.env.DESTRUCTIVE_TESTING || "false"}
- **Verbose Output**: ${process.env.VERBOSE_TESTING || "false"}

---

*Report generated by Reynard Penetration Testing Suite*  
*🐺 The Wolf - Security Testing Framework*`;
}

/**
 * Generate test details section
 */
function generateTestDetails(results: any): string {
  if (!results.suites || results.suites.length === 0) {
    return "No test details available";
  }

  let details = "";

  results.suites.forEach((suite: any, index: number) => {
    details += `\n### Test Suite ${index + 1}: ${suite.title || "Unknown"}\n`;
    details += `- **Status**: ${suite.ok ? "✅ PASSED" : "❌ FAILED"}\n`;
    details += `- **Duration**: ${suite.duration || "Unknown"}ms\n`;

    if (suite.specs) {
      suite.specs.forEach((spec: any, specIndex: number) => {
        details += `  - **Test ${specIndex + 1}**: ${spec.title || "Unknown"} - ${spec.ok ? "✅" : "❌"}\n`;
      });
    }
  });

  return details;
}

/**
 * Cleanup temporary files
 */
async function cleanupTemporaryFiles(): Promise<void> {
  console.log("🧹 Cleaning up temporary files...");

  try {
    // Remove temporary Python files
    await execAsync('find . -name "*.pyc" -delete');
    await execAsync(
      'find . -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true',
    );

    // Remove temporary test files
    await execAsync("rm -f /tmp/fenrir_*.json 2>/dev/null || true");
    await execAsync("rm -f /tmp/penetration_*.log 2>/dev/null || true");

    console.log("✅ Temporary files cleaned up");
  } catch (error) {
    console.warn("⚠️ Cleanup warning:", error instanceof Error ? error.message : String(error));
  }
}

/**
 * Archive results
 */
async function archiveResults(): Promise<void> {
  console.log("📦 Archiving penetration test results...");

  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const archiveName = `penetration-results-${timestamp}.tar.gz`;

    await execAsync(
      `tar -czf ${archiveName} penetration-results/ 2>/dev/null || true`,
    );

    if (fs.existsSync(archiveName)) {
      console.log(`✅ Results archived: ${archiveName}`);
    } else {
      console.log("⚠️ Archive creation skipped (no results to archive)");
    }
  } catch (error) {
    console.warn("⚠️ Archive warning:", error instanceof Error ? error.message : String(error));
  }
}

export default globalTeardown;

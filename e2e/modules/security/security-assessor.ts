/**
 * 🐺 SECURITY ASSESSOR
 *
 * *snarls with predatory intelligence* Handles comprehensive security
 * assessments and generates detailed reports.
 */

import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import type { SecurityAssessment } from "./penetration-types";

const execAsync = promisify(exec);

/**
 * Security Assessor Class
 */
export class SecurityAssessor {
  private fenrirPath: string;
  private config: {
    backendUrl: string;
    verbose: boolean;
    destructive: boolean;
    timeout: number;
  };

  constructor(config: {
    backendUrl: string;
    verbose: boolean;
    destructive: boolean;
    timeout: number;
  }) {
    this.config = config;
    this.fenrirPath = path.join(process.cwd(), "..", "fenrir");
  }

  /**
   * Run complete security assessment
   */
  async runCompleteSecurityAssessment(): Promise<SecurityAssessment> {
    try {
      const pythonPath =
        process.env.PYTHON_PATH ||
        "bash -c 'source ~/venv/bin/activate && python3'";
      const command = `${pythonPath} run_all_exploits.py --url ${this.config.backendUrl} ${this.config.verbose ? "--verbose" : ""} ${this.config.destructive ? "--destructive" : ""}`;

      const { stdout, stderr } = await execAsync(command, {
        timeout: this.config.timeout * 2,
        cwd: this.fenrirPath,
      });

      if (stderr && !stderr.includes("Warning")) {
        console.warn(`⚠️ Security assessment warning: ${stderr}`);
      }

      return this.parseAssessmentResults(stdout);
    } catch (error) {
      console.error(`❌ Security assessment failed:`, error);

      return {
        totalVulnerabilities: 0,
        exploitsRun: 0,
        securityRating: "ASSESSMENT_FAILED",
        criticalIssues: 0,
        highIssues: 0,
        mediumIssues: 0,
        lowIssues: 0,
        recommendations: ["Fix security assessment infrastructure"],
      };
    }
  }

  /**
   * Parse assessment results from output
   */
  private parseAssessmentResults(stdout: string): SecurityAssessment {
    // Parse results from output
    const vulnerabilityMatch = stdout.match(
      /Total Vulnerabilities Found: (\d+)/,
    );
    const totalVulnerabilities = vulnerabilityMatch
      ? parseInt(vulnerabilityMatch[1])
      : 0;

    const exploitsMatch = stdout.match(/Total Exploits Executed: (\d+)/);
    const exploitsRun = exploitsMatch ? parseInt(exploitsMatch[1]) : 0;

    // Categorize vulnerabilities by severity
    const criticalMatch = stdout.match(/🔴 CRITICAL.*?(\d+)/g);
    const highMatch = stdout.match(/🟠 HIGH.*?(\d+)/g);
    const mediumMatch = stdout.match(/🟡 MEDIUM.*?(\d+)/g);
    const lowMatch = stdout.match(/🟢 LOW.*?(\d+)/g);

    const criticalIssues = criticalMatch ? criticalMatch.length : 0;
    const highIssues = highMatch ? highMatch.length : 0;
    const mediumIssues = mediumMatch ? mediumMatch.length : 0;
    const lowIssues = lowMatch ? lowMatch.length : 0;

    return {
      totalVulnerabilities,
      exploitsRun,
      securityRating: this.determineSecurityRating(totalVulnerabilities),
      criticalIssues,
      highIssues,
      mediumIssues,
      lowIssues,
      recommendations: this.generateSecurityRecommendations(totalVulnerabilities),
    };
  }

  /**
   * Determine overall security rating
   */
  private determineSecurityRating(count: number): string {
    if (count >= 5) return "CRITICAL - Multiple vulnerabilities found";
    if (count >= 3) return "HIGH RISK - Significant vulnerabilities found";
    if (count >= 1) return "MEDIUM RISK - Some vulnerabilities found";
    return "SECURE - No vulnerabilities found";
  }

  /**
   * Generate security recommendations
   */
  private generateSecurityRecommendations(
    vulnerabilityCount: number,
  ): string[] {
    const recommendations = [
      "🔐 Authentication & Authorization:",
      "  • Use persistent, secure JWT secret keys",
      "  • Implement proper token rotation",
      "  • Add rate limiting to authentication endpoints",
      "  • Use strong password policies",
      "",
      "🛡️ Input Validation & Sanitization:",
      "  • Use parameterized queries exclusively",
      "  • Implement comprehensive input validation",
      "  • Add multiple layers of validation",
      "  • Use allowlists instead of blocklists",
      "",
      "📁 File Security:",
      "  • Implement proper path validation",
      "  • Use secure file upload handling",
      "  • Add file type validation",
      "  • Implement file size limits",
      "",
      "🔒 Error Handling:",
      "  • Sanitize all error messages",
      "  • Implement structured logging",
      "  • Add proper exception handling",
      "  • Prevent information disclosure",
      "",
      "🌐 Network Security:",
      "  • Configure proper CORS policies",
      "  • Use HTTPS in production",
      "  • Implement security headers",
      "  • Add request validation",
    ];

    if (vulnerabilityCount > 0) {
      recommendations.unshift("🚨 IMMEDIATE ACTION REQUIRED:");
      recommendations.unshift(
        "  • Review and fix all identified vulnerabilities",
      );
      recommendations.unshift("  • Implement additional security controls");
      recommendations.unshift("  • Conduct regular security assessments");
    }

    return recommendations;
  }

  /**
   * Generate security report
   */
  async generateSecurityReport(backendUrl: string): Promise<string> {
    const assessment = await this.runCompleteSecurityAssessment();

    const report = `
🐺 REYNARD SECURITY ASSESSMENT REPORT
=====================================

📊 OVERALL ASSESSMENT
- Total Vulnerabilities Found: ${assessment.totalVulnerabilities}
- Exploits Executed: ${assessment.exploitsRun}
- Security Rating: ${assessment.securityRating}

🚨 VULNERABILITY BREAKDOWN
- Critical Issues: ${assessment.criticalIssues}
- High Issues: ${assessment.highIssues}
- Medium Issues: ${assessment.mediumIssues}
- Low Issues: ${assessment.lowIssues}

🛡️ SECURITY RECOMMENDATIONS
${assessment.recommendations.map((rec) => `- ${rec}`).join("\n")}

Generated: ${new Date().toISOString()}
Target: ${backendUrl}
`;

    return report;
  }
}

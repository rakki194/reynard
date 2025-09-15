/**
 * 🦊 Enhanced Security Analysis Engine
 *
 * *red fur gleams with intelligence* Advanced security analysis engine that integrates
 * with Fenrir's comprehensive security testing arsenal for deep vulnerability detection.
 */

import { exec } from "child_process";
import { EventEmitter } from "events";
import { promisify } from "util";
// import { join } from "path"; // Unused for now

const execAsync = promisify(exec);

export interface SecurityVulnerability {
  id: string;
  type:
    | "SQL_INJECTION"
    | "XSS"
    | "PATH_TRAVERSAL"
    | "COMMAND_INJECTION"
    | "AUTHENTICATION_BYPASS"
    | "INFORMATION_DISCLOSURE"
    | "CSRF"
    | "SSRF"
    | "DESERIALIZATION"
    | "OTHER";
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";
  title: string;
  description: string;
  file: string;
  line: number;
  column?: number;
  cwe?: string;
  owasp?: string;
  remediation: string;
  references: string[];
  confidence: number;
  tool: string;
  exploitCode?: string;
  testCase?: string;
}

export interface SecurityHotspot {
  id: string;
  type:
    | "AUTHENTICATION"
    | "AUTHORIZATION"
    | "INPUT_VALIDATION"
    | "CRYPTOGRAPHY"
    | "SESSION_MANAGEMENT"
    | "ERROR_HANDLING"
    | "LOGGING"
    | "OTHER";
  severity: "HIGH" | "MEDIUM" | "LOW";
  title: string;
  description: string;
  file: string;
  line: number;
  recommendation: string;
  confidence: number;
  tool: string;
}

export interface SecurityAnalysisResult {
  vulnerabilities: SecurityVulnerability[];
  hotspots: SecurityHotspot[];
  summary: {
    totalVulnerabilities: number;
    criticalVulnerabilities: number;
    highVulnerabilities: number;
    mediumVulnerabilities: number;
    lowVulnerabilities: number;
    totalHotspots: number;
    securityRating: "A" | "B" | "C" | "D" | "E";
    riskScore: number;
  };
  tools: {
    fenrir: boolean;
    bandit: boolean;
    eslintSecurity: boolean;
    customExploits: boolean;
  };
  analysisTime: number;
  coverage: {
    filesAnalyzed: number;
    totalFiles: number;
    coveragePercentage: number;
  };
}

/**
 * 🦊 Enhanced Security Analysis Engine
 *
 * *snarls with predatory intelligence* Integrates with Fenrir's comprehensive
 * security testing arsenal for deep vulnerability detection.
 */
export class EnhancedSecurityEngine extends EventEmitter {
  private readonly projectRoot: string;
  private readonly fenrirPath: string;
  private readonly enabledTools: Set<string>;

  constructor(
    projectRoot: string,
    fenrirPath: string = "./fenrir",
    enabledTools: string[] = ["fenrir", "bandit", "eslint-security", "custom-exploits"]
  ) {
    super();
    this.projectRoot = projectRoot;
    this.fenrirPath = fenrirPath;
    this.enabledTools = new Set(enabledTools);
  }

  /**
   * 🦊 Run comprehensive security analysis
   */
  async runSecurityAnalysis(files: string[]): Promise<SecurityAnalysisResult> {
    const startTime = Date.now();

    try {
      console.log("🐺 Starting enhanced security analysis...");

      const vulnerabilities: SecurityVulnerability[] = [];
      const hotspots: SecurityHotspot[] = [];
      const tools = {
        fenrir: false,
        bandit: false,
        eslintSecurity: false,
        customExploits: false,
      };

      // Run Fenrir comprehensive security testing
      if (this.enabledTools.has("fenrir")) {
        try {
          const fenrirResults = await this.runFenrirAnalysis();
          vulnerabilities.push(...fenrirResults.vulnerabilities);
          hotspots.push(...fenrirResults.hotspots);
          tools.fenrir = true;
        } catch (error) {
          console.warn("Fenrir analysis failed:", error);
        }
      }

      // Run Bandit for Python security
      if (this.enabledTools.has("bandit")) {
        try {
          const banditResults = await this.runBanditAnalysis(files);
          vulnerabilities.push(...banditResults);
          tools.bandit = true;
        } catch (error) {
          console.warn("Bandit analysis failed:", error);
        }
      }

      // Run ESLint Security for JavaScript/TypeScript
      if (this.enabledTools.has("eslint-security")) {
        try {
          const eslintResults = await this.runESLintSecurityAnalysis(files);
          vulnerabilities.push(...eslintResults);
          tools.eslintSecurity = true;
        } catch (error) {
          console.warn("ESLint security analysis failed:", error);
        }
      }

      // Run custom exploit analysis
      if (this.enabledTools.has("custom-exploits")) {
        try {
          const customResults = await this.runCustomExploitAnalysis(files);
          vulnerabilities.push(...customResults);
          tools.customExploits = true;
        } catch (error) {
          console.warn("Custom exploit analysis failed:", error);
        }
      }

      const summary = this.calculateSecuritySummary(vulnerabilities, hotspots);
      const coverage = this.calculateCoverage(files, vulnerabilities, hotspots);

      const result: SecurityAnalysisResult = {
        vulnerabilities,
        hotspots,
        summary,
        tools,
        analysisTime: Date.now() - startTime,
        coverage,
      };

      this.emit("analysisComplete", result);
      return result;
    } catch (error) {
      this.emit("analysisError", error);
      throw error;
    }
  }

  /**
   * 🦊 Run Fenrir comprehensive security analysis
   */
  private async runFenrirAnalysis(): Promise<{
    vulnerabilities: SecurityVulnerability[];
    hotspots: SecurityHotspot[];
  }> {
    const vulnerabilities: SecurityVulnerability[] = [];
    const hotspots: SecurityHotspot[] = [];

    try {
      // Run Fenrir's comprehensive fuzzing
      const { stdout: fuzzingOutput } = await execAsync(
        `python -m fenrir.fuzzing.comprehensive_fuzzer --target http://localhost:8000 --output-format json`,
        { cwd: this.fenrirPath, timeout: 300000 } // 5 minute timeout
      );

      // Parse Fenrir fuzzing results
      const fuzzingResults = this.parseFenrirFuzzingOutput(fuzzingOutput);
      vulnerabilities.push(...fuzzingResults);

      // Run Fenrir's LLM exploitation tests
      const { stdout: llmOutput } = await execAsync(
        `python -m fenrir.run_llm_exploits --target http://localhost:8000 --test-type comprehensive --output-format json`,
        { cwd: this.fenrirPath, timeout: 180000 } // 3 minute timeout
      );

      // Parse LLM exploitation results
      const llmResults = this.parseFenrirLLMOutput(llmOutput);
      vulnerabilities.push(...llmResults);

      // Run specific exploit modules
      const exploitModules = [
        "jwt_exploits.secret_key_attack",
        "cors_exploits.cors_misconfiguration",
        "rate_limiting.rate_limit_bypass",
      ];

      for (const module of exploitModules) {
        try {
          const { stdout: exploitOutput } = await execAsync(
            `python -m fenrir.${module} --target http://localhost:8000 --output-format json`,
            { cwd: this.fenrirPath, timeout: 60000 }
          );

          const exploitResults = this.parseFenrirExploitOutput(exploitOutput, module);
          vulnerabilities.push(...exploitResults);
        } catch (error) {
          console.warn(`Fenrir module ${module} failed:`, error);
        }
      }
    } catch (error) {
      console.error("Fenrir analysis error:", error);
    }

    return { vulnerabilities, hotspots };
  }

  /**
   * 🦊 Parse Fenrir fuzzing output
   */
  private parseFenrirFuzzingOutput(output: string): SecurityVulnerability[] {
    const vulnerabilities: SecurityVulnerability[] = [];

    try {
      const lines = output.split("\n");
      for (const line of lines) {
        if (line.includes("VULNERABILITY") || line.includes("EXPLOIT")) {
          const parts = line.split("|");
          if (parts.length >= 4) {
            vulnerabilities.push({
              id: `fenrir-fuzzing-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              type: this.mapFenrirTypeToVulnerabilityType(parts[1]),
              severity: this.mapFenrirSeverityToSeverity(parts[2]),
              title: `Fenrir Fuzzing: ${parts[1]}`,
              description: parts[3] || "Vulnerability detected by Fenrir fuzzing",
              file: "API Endpoint",
              line: 0,
              remediation: "Review and fix the identified vulnerability",
              references: ["https://github.com/your-org/fenrir"],
              confidence: 0.8,
              tool: "fenrir-fuzzing",
              exploitCode: parts[4] || undefined,
            });
          }
        }
      }
    } catch (error) {
      console.error("Error parsing Fenrir fuzzing output:", error);
    }

    return vulnerabilities;
  }

  /**
   * 🦊 Parse Fenrir LLM exploitation output
   */
  private parseFenrirLLMOutput(output: string): SecurityVulnerability[] {
    const vulnerabilities: SecurityVulnerability[] = [];

    try {
      const lines = output.split("\n");
      for (const line of lines) {
        if (line.includes("LLM_EXPLOIT") || line.includes("PROMPT_INJECTION")) {
          const parts = line.split("|");
          if (parts.length >= 3) {
            vulnerabilities.push({
              id: `fenrir-llm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              type: "OTHER",
              severity: this.mapFenrirSeverityToSeverity(parts[1]),
              title: `LLM Exploitation: ${parts[0]}`,
              description: parts[2] || "LLM vulnerability detected by Fenrir",
              file: "LLM Service",
              line: 0,
              remediation: "Implement proper input validation and output filtering for LLM services",
              references: ["https://github.com/your-org/fenrir", "https://owasp.org/www-project-top-10/"],
              confidence: 0.9,
              tool: "fenrir-llm",
              exploitCode: parts[3] || undefined,
            });
          }
        }
      }
    } catch (error) {
      console.error("Error parsing Fenrir LLM output:", error);
    }

    return vulnerabilities;
  }

  /**
   * 🦊 Parse Fenrir exploit output
   */
  private parseFenrirExploitOutput(output: string, module: string): SecurityVulnerability[] {
    const vulnerabilities: SecurityVulnerability[] = [];

    try {
      const lines = output.split("\n");
      for (const line of lines) {
        if (line.includes("EXPLOIT") || line.includes("VULNERABILITY")) {
          const parts = line.split("|");
          if (parts.length >= 3) {
            vulnerabilities.push({
              id: `fenrir-${module}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              type: this.mapFenrirModuleToVulnerabilityType(module),
              severity: this.mapFenrirSeverityToSeverity(parts[1]),
              title: `Fenrir ${module}: ${parts[0]}`,
              description: parts[2] || `Vulnerability detected by Fenrir ${module}`,
              file: "API Endpoint",
              line: 0,
              remediation: this.getRemediationForModule(module),
              references: ["https://github.com/your-org/fenrir"],
              confidence: 0.85,
              tool: `fenrir-${module}`,
              exploitCode: parts[3] || undefined,
            });
          }
        }
      }
    } catch (error) {
      console.error(`Error parsing Fenrir ${module} output:`, error);
    }

    return vulnerabilities;
  }

  /**
   * 🦊 Run Bandit analysis for Python files
   */
  private async runBanditAnalysis(files: string[]): Promise<SecurityVulnerability[]> {
    const pythonFiles = files.filter(f => f.endsWith(".py"));
    if (pythonFiles.length === 0) return [];

    try {
      const { stdout } = await execAsync(`bandit -r ${pythonFiles.join(" ")} -f json`, { cwd: this.projectRoot });

      return this.parseBanditOutput(stdout);
    } catch (error) {
      // Bandit returns non-zero exit code when vulnerabilities are found
      if (error && typeof error === "object" && "stdout" in error) {
        return this.parseBanditOutput((error as any).stdout);
      }
      return [];
    }
  }

  /**
   * 🦊 Parse Bandit output
   */
  private parseBanditOutput(output: string): SecurityVulnerability[] {
    const vulnerabilities: SecurityVulnerability[] = [];

    try {
      const data = JSON.parse(output);
      for (const result of data.results || []) {
        vulnerabilities.push({
          id: `bandit-${result.test_id}-${Date.now()}`,
          type: "OTHER",
          severity: this.mapBanditSeverityToSeverity(result.issue_severity),
          title: result.issue_text,
          description: result.issue_description,
          file: result.filename,
          line: result.line_number,
          column: result.line_range?.[0],
          cwe: result.issue_cwe?.id,
          remediation: result.issue_confidence,
          references: [result.more_info],
          confidence: this.mapBanditConfidenceToConfidence(result.issue_confidence),
          tool: "bandit",
        });
      }
    } catch (error) {
      console.error("Error parsing Bandit output:", error);
    }

    return vulnerabilities;
  }

  /**
   * 🦊 Run ESLint Security analysis
   */
  private async runESLintSecurityAnalysis(files: string[]): Promise<SecurityVulnerability[]> {
    const jsFiles = files.filter(
      f => f.endsWith(".js") || f.endsWith(".ts") || f.endsWith(".jsx") || f.endsWith(".tsx")
    );
    if (jsFiles.length === 0) return [];

    try {
      const { stdout } = await execAsync(`npx eslint ${jsFiles.join(" ")} --plugin security --format json`, {
        cwd: this.projectRoot,
      });

      return this.parseESLintSecurityOutput(stdout);
    } catch (error) {
      // ESLint returns non-zero exit code when issues are found
      if (error && typeof error === "object" && "stdout" in error) {
        return this.parseESLintSecurityOutput((error as any).stdout);
      }
      return [];
    }
  }

  /**
   * 🦊 Parse ESLint Security output
   */
  private parseESLintSecurityOutput(output: string): SecurityVulnerability[] {
    const vulnerabilities: SecurityVulnerability[] = [];

    try {
      const data = JSON.parse(output);
      for (const file of data) {
        for (const message of file.messages || []) {
          if (message.ruleId?.includes("security")) {
            vulnerabilities.push({
              id: `eslint-security-${message.ruleId}-${Date.now()}`,
              type: this.mapESLintRuleToVulnerabilityType(message.ruleId),
              severity: this.mapESLintSeverityToSeverity(message.severity),
              title: message.message,
              description: message.message,
              file: file.filePath,
              line: message.line,
              column: message.column,
              remediation: "Review and fix the security issue",
              references: [`https://eslint.org/docs/rules/${message.ruleId}`],
              confidence: 0.7,
              tool: "eslint-security",
            });
          }
        }
      }
    } catch (error) {
      console.error("Error parsing ESLint Security output:", error);
    }

    return vulnerabilities;
  }

  /**
   * 🦊 Run custom exploit analysis
   */
  private async runCustomExploitAnalysis(files: string[]): Promise<SecurityVulnerability[]> {
    const vulnerabilities: SecurityVulnerability[] = [];

    // Custom pattern-based vulnerability detection
    for (const file of files) {
      try {
        const { stdout } = await execAsync(`grep -n -E "(eval|exec|system|shell_exec|passthru)" "${file}" || true`);
        if (stdout.trim()) {
          const lines = stdout.trim().split("\n");
          for (const line of lines) {
            const [lineNum, ...contentParts] = line.split(":");
            const content = contentParts.join(":");

            vulnerabilities.push({
              id: `custom-exploit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              type: "COMMAND_INJECTION",
              severity: "HIGH",
              title: "Potential Command Injection",
              description: `Dangerous function call detected: ${content.trim()}`,
              file,
              line: parseInt(lineNum),
              remediation: "Avoid using dangerous functions like eval, exec, system, etc. Use safer alternatives.",
              references: ["https://owasp.org/www-community/attacks/Code_Injection"],
              confidence: 0.6,
              tool: "custom-exploits",
            });
          }
        }
      } catch (error) {
        // Ignore grep errors (file not found, etc.)
      }
    }

    return vulnerabilities;
  }

  /**
   * 🦊 Calculate security summary
   */
  private calculateSecuritySummary(vulnerabilities: SecurityVulnerability[], hotspots: SecurityHotspot[]) {
    const critical = vulnerabilities.filter(v => v.severity === "CRITICAL").length;
    const high = vulnerabilities.filter(v => v.severity === "HIGH").length;
    const medium = vulnerabilities.filter(v => v.severity === "MEDIUM").length;
    const low = vulnerabilities.filter(v => v.severity === "LOW").length;

    const riskScore = critical * 10 + high * 5 + medium * 2 + low * 1;

    let securityRating: "A" | "B" | "C" | "D" | "E";
    if (critical > 0) securityRating = "E";
    else if (high > 2) securityRating = "D";
    else if (high > 0 || medium > 5) securityRating = "C";
    else if (medium > 0 || low > 10) securityRating = "B";
    else securityRating = "A";

    return {
      totalVulnerabilities: vulnerabilities.length,
      criticalVulnerabilities: critical,
      highVulnerabilities: high,
      mediumVulnerabilities: medium,
      lowVulnerabilities: low,
      totalHotspots: hotspots.length,
      securityRating,
      riskScore,
    };
  }

  /**
   * 🦊 Calculate coverage
   */
  private calculateCoverage(files: string[], vulnerabilities: SecurityVulnerability[], hotspots: SecurityHotspot[]) {
    const analyzedFiles = new Set([...vulnerabilities.map(v => v.file), ...hotspots.map(h => h.file)]);

    return {
      filesAnalyzed: analyzedFiles.size,
      totalFiles: files.length,
      coveragePercentage: files.length > 0 ? (analyzedFiles.size / files.length) * 100 : 0,
    };
  }

  // Helper methods for mapping values
  private mapFenrirTypeToVulnerabilityType(type: string): SecurityVulnerability["type"] {
    const mapping: Record<string, SecurityVulnerability["type"]> = {
      SQL_INJECTION: "SQL_INJECTION",
      XSS: "XSS",
      PATH_TRAVERSAL: "PATH_TRAVERSAL",
      COMMAND_INJECTION: "COMMAND_INJECTION",
      AUTH_BYPASS: "AUTHENTICATION_BYPASS",
      INFO_DISCLOSURE: "INFORMATION_DISCLOSURE",
    };
    return mapping[type] || "OTHER";
  }

  private mapFenrirSeverityToSeverity(severity: string): SecurityVulnerability["severity"] {
    const mapping: Record<string, SecurityVulnerability["severity"]> = {
      CRITICAL: "CRITICAL",
      HIGH: "HIGH",
      MEDIUM: "MEDIUM",
      LOW: "LOW",
      INFO: "INFO",
    };
    return mapping[severity] || "MEDIUM";
  }

  private mapFenrirModuleToVulnerabilityType(module: string): SecurityVulnerability["type"] {
    if (module.includes("jwt")) return "AUTHENTICATION_BYPASS";
    if (module.includes("cors")) return "CSRF";
    if (module.includes("rate_limiting")) return "OTHER";
    return "OTHER";
  }

  private getRemediationForModule(module: string): string {
    if (module.includes("jwt")) return "Use strong JWT secrets and proper validation";
    if (module.includes("cors")) return "Configure CORS policies properly";
    if (module.includes("rate_limiting")) return "Implement proper rate limiting";
    return "Review and fix the identified vulnerability";
  }

  private mapBanditSeverityToSeverity(severity: string): SecurityVulnerability["severity"] {
    const mapping: Record<string, SecurityVulnerability["severity"]> = {
      HIGH: "HIGH",
      MEDIUM: "MEDIUM",
      LOW: "LOW",
    };
    return mapping[severity] || "MEDIUM";
  }

  private mapBanditConfidenceToConfidence(confidence: string): number {
    const mapping: Record<string, number> = {
      HIGH: 0.9,
      MEDIUM: 0.7,
      LOW: 0.5,
    };
    return mapping[confidence] || 0.5;
  }

  private mapESLintRuleToVulnerabilityType(ruleId: string): SecurityVulnerability["type"] {
    if (ruleId.includes("xss")) return "XSS";
    if (ruleId.includes("injection")) return "SQL_INJECTION";
    if (ruleId.includes("path")) return "PATH_TRAVERSAL";
    return "OTHER";
  }

  private mapESLintSeverityToSeverity(severity: number): SecurityVulnerability["severity"] {
    if (severity === 2) return "HIGH";
    if (severity === 1) return "MEDIUM";
    return "LOW";
  }
}

/**
 * 🦊 Create enhanced security engine
 */
export function createEnhancedSecurityEngine(
  projectRoot: string,
  fenrirPath?: string,
  enabledTools?: string[]
): EnhancedSecurityEngine {
  return new EnhancedSecurityEngine(projectRoot, fenrirPath, enabledTools);
}

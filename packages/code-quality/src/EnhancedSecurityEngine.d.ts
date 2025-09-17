/**
 * 🦊 Enhanced Security Analysis Engine
 *
 * *red fur gleams with intelligence* Advanced security analysis engine that integrates
 * with Fenrir's comprehensive security testing arsenal for deep vulnerability detection.
 */
import { EventEmitter } from "events";
export interface SecurityVulnerability {
    id: string;
    type: "SQL_INJECTION" | "XSS" | "PATH_TRAVERSAL" | "COMMAND_INJECTION" | "AUTHENTICATION_BYPASS" | "INFORMATION_DISCLOSURE" | "CSRF" | "SSRF" | "DESERIALIZATION" | "OTHER";
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
    type: "AUTHENTICATION" | "AUTHORIZATION" | "INPUT_VALIDATION" | "CRYPTOGRAPHY" | "SESSION_MANAGEMENT" | "ERROR_HANDLING" | "LOGGING" | "OTHER";
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
export declare class EnhancedSecurityEngine extends EventEmitter {
    private readonly projectRoot;
    private readonly fenrirPath;
    private readonly enabledTools;
    constructor(projectRoot: string, fenrirPath?: string, enabledTools?: string[]);
    /**
     * 🦊 Run comprehensive security analysis
     */
    runSecurityAnalysis(files: string[]): Promise<SecurityAnalysisResult>;
    /**
     * 🦊 Run Fenrir comprehensive security analysis
     */
    private runFenrirAnalysis;
    /**
     * 🦊 Parse Fenrir fuzzing output
     */
    private parseFenrirFuzzingOutput;
    /**
     * 🦊 Parse Fenrir LLM exploitation output
     */
    private parseFenrirLLMOutput;
    /**
     * 🦊 Parse Fenrir exploit output
     */
    private parseFenrirExploitOutput;
    /**
     * 🦊 Run Bandit analysis for Python files
     */
    private runBanditAnalysis;
    /**
     * 🦊 Parse Bandit output
     */
    private parseBanditOutput;
    /**
     * 🦊 Run ESLint Security analysis
     */
    private runESLintSecurityAnalysis;
    /**
     * 🦊 Parse ESLint Security output
     */
    private parseESLintSecurityOutput;
    /**
     * 🦊 Run custom exploit analysis
     */
    private runCustomExploitAnalysis;
    /**
     * 🦊 Calculate security summary
     */
    private calculateSecuritySummary;
    /**
     * 🦊 Calculate coverage
     */
    private calculateCoverage;
    private mapFenrirTypeToVulnerabilityType;
    private mapFenrirSeverityToSeverity;
    private mapFenrirModuleToVulnerabilityType;
    private getRemediationForModule;
    private mapBanditSeverityToSeverity;
    private mapBanditConfidenceToConfidence;
    private mapESLintRuleToVulnerabilityType;
    private mapESLintSeverityToSeverity;
}
/**
 * 🦊 Create enhanced security engine
 */
export declare function createEnhancedSecurityEngine(projectRoot: string, fenrirPath?: string, enabledTools?: string[]): EnhancedSecurityEngine;

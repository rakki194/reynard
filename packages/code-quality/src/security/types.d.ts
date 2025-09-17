/**
 * 🐺 Security Analysis Types
 *
 * *snarls with predatory intelligence* Core type definitions for security
 * vulnerability detection and analysis.
 */
export interface SecurityVulnerability {
    id: string;
    type: "SQL_INJECTION" | "XSS" | "PATH_TRAVERSAL" | "COMMAND_INJECTION" | "AUTHENTICATION_BYPASS" | "INFORMATION_DISCLOSURE" | "CSRF" | "INSECURE_DESERIALIZATION" | "SECURITY_MISCONFIGURATION" | "OTHER";
    severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";
    title: string;
    description: string;
    file: string;
    line?: number;
    column?: number;
    cwe?: string;
    owasp?: string;
    remediation: string;
    confidence: "HIGH" | "MEDIUM" | "LOW";
    tool: string;
    createdAt: Date;
}
export interface SecurityHotspot {
    id: string;
    type: "AUTHENTICATION" | "AUTHORIZATION" | "CRYPTOGRAPHY" | "INPUT_VALIDATION" | "ERROR_HANDLING" | "LOGGING" | "SESSION_MANAGEMENT" | "OTHER";
    severity: "HIGH" | "MEDIUM" | "LOW";
    title: string;
    description: string;
    file: string;
    line?: number;
    column?: number;
    recommendation: string;
    tool: string;
    createdAt: Date;
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
        highHotspots: number;
        mediumHotspots: number;
        lowHotspots: number;
        securityRating: "A" | "B" | "C" | "D" | "E";
    };
    toolsUsed: string[];
    analysisDate: Date;
    duration: number;
}
export interface SecurityToolConfig {
    name: string;
    enabled: boolean;
    command: string;
    args: string[];
    outputParser: (output: string) => SecurityVulnerability[];
    supportedLanguages: string[];
}

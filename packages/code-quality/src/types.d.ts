/**
 * 🦊 Reynard Code Quality Types
 *
 * *red fur gleams with intelligence* Centralized type definitions
 * for the code quality analysis system.
 */
export interface CodeQualityMetrics {
    linesOfCode: number;
    linesOfComments: number;
    cyclomaticComplexity: number;
    cognitiveComplexity: number;
    maintainabilityIndex: number;
    codeSmells: number;
    bugs: number;
    vulnerabilities: number;
    securityHotspots: number;
    duplications: number;
    lineCoverage: number;
    branchCoverage: number;
    functionCoverage: number;
    technicalDebt: number;
    reliabilityRating: "A" | "B" | "C" | "D" | "E";
    securityRating: "A" | "B" | "C" | "D" | "E";
    maintainabilityRating: "A" | "B" | "C" | "D" | "E";
}
export type IssueType = "BUG" | "VULNERABILITY" | "CODE_SMELL" | "SECURITY_HOTSPOT";
export type IssueSeverity = "BLOCKER" | "CRITICAL" | "MAJOR" | "MINOR" | "INFO";
export interface QualityIssue {
    id: string;
    type: IssueType;
    severity: IssueSeverity;
    message: string;
    file: string;
    line: number;
    column?: number;
    rule: string;
    effort: number;
    tags: string[];
    createdAt: Date;
}
export interface QualityGate {
    id: string;
    name: string;
    conditions: QualityGateCondition[];
    enabled: boolean;
}
export type QualityGateOperator = "GT" | "LT" | "EQ" | "NE";
export interface QualityGateCondition {
    metric: keyof CodeQualityMetrics;
    operator: QualityGateOperator;
    threshold: number | string;
    errorThreshold?: number | string;
}
export interface AnalysisResult {
    projectKey: string;
    analysisDate: Date;
    metrics: CodeQualityMetrics;
    issues: QualityIssue[];
    qualityGateStatus: "PASSED" | "FAILED" | "WARN";
    qualityGateDetails: QualityGateResult[];
    languages: LanguageAnalysis[];
    files: FileAnalysis[];
}
export interface LanguageAnalysis {
    language: string;
    files: number;
    lines: number;
    issues: number;
    coverage: number;
}
export interface FileAnalysis {
    path: string;
    language: string;
    lines: number;
    issues: QualityIssue[];
    complexity: number;
    coverage: number;
}
export type QualityGateStatus = "PASSED" | "FAILED" | "WARN";
export interface QualityGateResult {
    condition: QualityGateCondition;
    status: QualityGateStatus;
    actualValue: number | string;
    threshold: number | string;
}

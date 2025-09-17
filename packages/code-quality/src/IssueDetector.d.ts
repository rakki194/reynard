/**
 * 🐺 Reynard Issue Detector
 *
 * *snarls with predatory focus* Detects quality issues using existing
 * tools with wolf-like relentless determination.
 */
import { QualityIssue } from "./types";
export declare class IssueDetector {
    /**
     * 🐺 Detect quality issues using existing tools
     */
    detectIssues(files: string[]): Promise<QualityIssue[]>;
    private runLintingTools;
    private runESLint;
    private runPythonLinting;
    private runSecurityAnalysis;
    private mapESLintSeverityToType;
    private mapESLintSeverityToSeverity;
    private mapFlake8Severity;
    private estimateEffort;
}

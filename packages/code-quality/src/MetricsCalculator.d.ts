/**
 * 🦊 Reynard Metrics Calculator
 *
 * *red fur gleams with precision* Calculates comprehensive code quality
 * metrics with fox-like analytical prowess.
 */
import { CodeQualityMetrics, LanguageAnalysis } from "./types";
export declare class MetricsCalculator {
    /**
     * 🦊 Calculate comprehensive metrics
     */
    calculateMetrics(_files: string[], languageAnalyses: LanguageAnalysis[]): Promise<CodeQualityMetrics>;
    /**
     * 🦊 Update metrics with issue data
     */
    updateMetricsWithIssues(metrics: CodeQualityMetrics, issues: Array<{
        type: string;
        severity: string;
        effort: number;
    }>): CodeQualityMetrics;
    /**
     * 🦊 Calculate maintainability rating
     */
    calculateMaintainabilityRating(metrics: CodeQualityMetrics): "A" | "B" | "C" | "D" | "E";
    /**
     * 🦊 Calculate reliability rating
     */
    calculateReliabilityRating(metrics: CodeQualityMetrics): "A" | "B" | "C" | "D" | "E";
    /**
     * 🦊 Calculate security rating
     */
    calculateSecurityRating(metrics: CodeQualityMetrics): "A" | "B" | "C" | "D" | "E";
}

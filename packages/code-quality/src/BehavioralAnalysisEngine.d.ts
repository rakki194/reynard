/**
 * 🦊 Behavioral Analysis Engine
 *
 * *red fur gleams with intelligence* Analyzes git history and code evolution patterns
 * to identify hotspots, technical debt accumulation, and behavioral insights.
 * Leverages Reynard's existing git tools and ADR system.
 */
import { EventEmitter } from "events";
export interface CodeHotspot {
    file: string;
    complexity: number;
    changeFrequency: number;
    lastModified: Date;
    contributors: string[];
    riskLevel: "low" | "medium" | "high" | "critical";
    technicalDebt: number;
    recommendations: string[];
}
export interface BehavioralInsight {
    type: "hotspot" | "debt" | "pattern" | "trend";
    severity: "info" | "warning" | "error" | "critical";
    title: string;
    description: string;
    evidence: string[];
    recommendations: string[];
    confidence: number;
    affectedFiles: string[];
}
export interface GitCommit {
    hash: string;
    author: string;
    date: Date;
    message: string;
    files: string[];
    linesAdded: number;
    linesDeleted: number;
}
export interface BehavioralAnalysisResult {
    hotspots: CodeHotspot[];
    insights: BehavioralInsight[];
    trends: {
        commitFrequency: number;
        averageCommitSize: number;
        topContributors: Array<{
            name: string;
            commits: number;
            lines: number;
        }>;
        fileStability: Array<{
            file: string;
            stability: number;
            changes: number;
        }>;
    };
    technicalDebt: {
        total: number;
        byFile: Array<{
            file: string;
            debt: number;
            reasons: string[];
        }>;
        byType: Array<{
            type: string;
            debt: number;
            count: number;
        }>;
    };
    analysisDate: Date;
    timeRange: {
        from: Date;
        to: Date;
    };
}
/**
 * 🦊 Behavioral Analysis Engine
 *
 * *whiskers twitch with anticipation* Analyzes code evolution patterns
 * to identify hotspots and technical debt accumulation.
 */
export declare class BehavioralAnalysisEngine extends EventEmitter {
    private readonly projectRoot;
    private readonly gitHistoryLimit;
    constructor(projectRoot: string, gitHistoryLimit?: number);
    /**
     * 🦊 Run comprehensive behavioral analysis
     */
    analyzeBehavior(timeRange?: {
        from: Date;
        to: Date;
    }): Promise<BehavioralAnalysisResult>;
    /**
     * 🦊 Get git history
     */
    private getGitHistory;
    /**
     * 🦊 Parse git log output
     */
    private parseGitLog;
    /**
     * 🦊 Analyze code hotspots
     */
    private analyzeHotspots;
    /**
     * 🦊 Calculate file complexity
     */
    private calculateFileComplexity;
    /**
     * 🦊 Calculate risk level
     */
    private calculateRiskLevel;
    /**
     * 🦊 Calculate technical debt
     */
    private calculateTechnicalDebt;
    /**
     * 🦊 Generate hotspot recommendations
     */
    private generateHotspotRecommendations;
    /**
     * 🦊 Generate behavioral insights
     */
    private generateInsights;
    /**
     * 🦊 Get frequent contributors
     */
    private getFrequentContributors;
    /**
     * 🦊 Calculate trends
     */
    private calculateTrends;
    /**
     * 🦊 Assess technical debt
     */
    private assessTechnicalDebt;
}
/**
 * 🦊 Create behavioral analysis engine
 */
export declare function createBehavioralAnalysisEngine(projectRoot: string, gitHistoryLimit?: number): BehavioralAnalysisEngine;

#!/usr/bin/env node
/**
 * 🦊 Analyze Command Handler
 *
 * *whiskers twitch with intelligence* Handles the main analyze command
 * for comprehensive code quality analysis.
 */
export interface AnalyzeOptions {
    project: string;
    output?: string;
    format: string;
    security: boolean;
    qualityGates: boolean;
    environment: string;
    ai?: boolean;
    behavioral?: boolean;
    enhancedSecurity?: boolean;
}
export declare function handleAnalyzeCommand(options: AnalyzeOptions): Promise<void>;

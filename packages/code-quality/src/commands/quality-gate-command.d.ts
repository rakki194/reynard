#!/usr/bin/env node
/**
 * 🦊 Quality Gate Command Handler
 *
 * *whiskers twitch with intelligence* Handles quality gate evaluation
 * for specific environments and metrics.
 */
export interface QualityGateOptions {
    project: string;
    environment: string;
    metrics?: string;
}
export declare function handleQualityGateCommand(options: QualityGateOptions): Promise<void>;

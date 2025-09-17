#!/usr/bin/env node
/**
 * 🦊 Security Command Handler
 *
 * *whiskers twitch with intelligence* Handles security analysis
 * with comprehensive vulnerability detection.
 */
export interface SecurityOptions {
    project: string;
    output?: string;
    format: string;
}
export declare function handleSecurityCommand(options: SecurityOptions): Promise<void>;

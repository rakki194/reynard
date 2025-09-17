#!/usr/bin/env node
/**
 * 🦊 Enhanced Command Handler
 *
 * *whiskers twitch with intelligence* Handles the enhanced analysis command
 * with AI, behavioral insights, and advanced security.
 */
export interface EnhancedOptions {
    project: string;
    environment: string;
    format: string;
    ai?: boolean;
    behavioral?: boolean;
    enhancedSecurity?: boolean;
}
export declare function handleEnhancedCommand(options: EnhancedOptions): Promise<void>;

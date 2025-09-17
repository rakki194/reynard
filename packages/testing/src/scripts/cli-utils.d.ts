/**
 * CLI Utilities
 * Shared utilities for CLI error handling and process management
 */
/**
 * Set up global error handlers for the CLI
 */
export declare const setupErrorHandlers: () => void;
/**
 * Create a standardized error handler for command actions
 */
export declare const createCommandErrorHandler: (commandName: string) => (error: unknown) => never;

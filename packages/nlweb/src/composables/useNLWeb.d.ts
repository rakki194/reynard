/**
 * NLWeb Composable
 *
 * React composable for integrating with the NLWeb assistant tooling and routing system.
 * Provides reactive state management and API integration.
 */
import { NLWebSuggestionResponse, NLWebHealthStatus, NLWebConfiguration, NLWebTool, NLWebContext } from "../types/index.js";
export interface UseNLWebOptions {
    /** Base URL for NLWeb API */
    baseUrl?: string;
    /** Default context for suggestions */
    defaultContext?: NLWebContext;
    /** Whether to enable health checks */
    enableHealthChecks?: boolean;
    /** Health check interval in milliseconds */
    healthCheckInterval?: number;
    /** Request timeout in milliseconds */
    requestTimeout?: number;
}
export interface UseNLWebReturn {
    suggestions: () => NLWebSuggestionResponse | null;
    health: () => NLWebHealthStatus | null;
    configuration: () => NLWebConfiguration | null;
    tools: () => NLWebTool[];
    loading: () => boolean;
    error: () => string | null;
    getSuggestions: (query: string, context?: Record<string, unknown>) => Promise<void>;
    getHealth: () => Promise<void>;
    getConfiguration: () => Promise<void>;
    getTools: () => Promise<void>;
    registerTool: (tool: NLWebTool) => Promise<void>;
    unregisterTool: (name: string) => Promise<void>;
    enableRollback: () => Promise<void>;
    disableRollback: () => Promise<void>;
    isHealthy: () => boolean;
    isAvailable: () => boolean;
    getPerformanceStats: () => unknown;
}
export declare function useNLWeb(options?: UseNLWebOptions): UseNLWebReturn;

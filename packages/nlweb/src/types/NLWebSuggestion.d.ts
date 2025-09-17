/**
 * NLWeb Suggestion Types
 *
 * Type definitions for NLWeb suggestions.
 */
import { NLWebTool } from "./NLWebTool.js";
export interface NLWebSuggestionRequest {
    /** User query to process */
    query: string;
    /** Context information */
    context: NLWebContext;
    /** Maximum number of suggestions to return */
    maxSuggestions: number;
    /** Request metadata */
    metadata?: {
        requestId?: string;
        timestamp?: number;
        source?: string;
    };
}
export interface NLWebSuggestionResponse {
    /** List of tool suggestions */
    suggestions: NLWebSuggestion[];
    /** Unique request identifier */
    requestId: string;
    /** Processing time in milliseconds */
    processingTime: number;
    /** Cache information */
    cacheInfo: {
        hit: boolean;
        key: string;
        age?: number;
    };
}
export interface NLWebSuggestion {
    /** Suggested tool */
    tool: NLWebTool;
    /** Relevance score (0-100) */
    score: number;
    /** Reasoning for the suggestion */
    reasoning: string;
    /** Suggested parameters */
    parameters: Record<string, unknown>;
    /** Parameter hints */
    parameterHints: Record<string, unknown>;
}
export interface NLWebContext {
    /** User preferences */
    userPreferences?: {
        preferredTools?: string[];
        preferredCategories?: string[];
        language?: string;
    };
    /** Application state */
    applicationState?: {
        currentCategory?: string;
        currentPage?: string;
        userRole?: string;
    };
    /** Session information */
    session?: {
        userId?: string;
        sessionId?: string;
        timestamp?: number;
    };
}

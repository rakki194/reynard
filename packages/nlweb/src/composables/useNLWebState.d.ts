/**
 * NLWeb State Management
 *
 * State management utilities for the NLWeb composable.
 */
import { NLWebSuggestionResponse, NLWebHealthStatus, NLWebConfiguration, NLWebTool } from "../types/index.js";
export interface NLWebState {
    suggestions: () => NLWebSuggestionResponse | null;
    setSuggestions: (value: NLWebSuggestionResponse | null) => void;
    health: () => NLWebHealthStatus | null;
    setHealth: (value: NLWebHealthStatus | null) => void;
    configuration: () => NLWebConfiguration | null;
    setConfiguration: (value: NLWebConfiguration | null) => void;
    tools: () => NLWebTool[];
    setTools: (value: NLWebTool[]) => void;
    loading: () => boolean;
    setLoading: (value: boolean) => void;
    error: () => string | null;
    setError: (value: string | null) => void;
}
/**
 * Create NLWeb state signals
 */
export declare function createNLWebState(): NLWebState;

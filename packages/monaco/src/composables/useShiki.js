/**
 * useShiki composable - Refactored
 *
 * Modular Shiki syntax highlighting with separated concerns:
 * - Core state management in useShiki.core
 * - Highlighting operations in useShiki.operations
 * - Main composable orchestrates the modules
 */
import { onMount, onCleanup } from "solid-js";
import { createShikiState } from "./useShiki.core";
import { createShikiOperations } from "./useShiki.operations";
export const useShiki = (options = {}) => {
    // Create core state
    const stateManager = createShikiState();
    // Create operations
    const operations = createShikiOperations(stateManager.state, stateManager.setHighlighter, stateManager.setError, stateManager.setLoading);
    // Initialize on mount
    onMount(() => {
        operations.initializeHighlighter(options);
    });
    // Cleanup on unmount
    onCleanup(() => {
        const currentState = stateManager.state();
        if (currentState.highlighter) {
            // Shiki doesn't require explicit cleanup, but we can clear references
            stateManager.setHighlighter(null);
        }
    });
    return {
        state: stateManager.state,
        highlightCode: operations.highlightCode,
        getAvailableThemes: operations.getAvailableThemes,
        getAvailableLanguages: operations.getAvailableLanguages,
        isLoading: () => stateManager.state().isLoading,
        error: () => stateManager.state().error,
    };
};

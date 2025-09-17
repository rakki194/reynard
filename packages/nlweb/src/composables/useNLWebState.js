/**
 * NLWeb State Management
 *
 * State management utilities for the NLWeb composable.
 */
import { createSignal } from "solid-js";
/**
 * Create NLWeb state signals
 */
export function createNLWebState() {
    const [suggestions, setSuggestions] = createSignal(null);
    const [health, setHealth] = createSignal(null);
    const [configuration, setConfiguration] = createSignal(null);
    const [tools, setTools] = createSignal([]);
    const [loading, setLoading] = createSignal(false);
    const [error, setError] = createSignal(null);
    return {
        suggestions,
        setSuggestions,
        health,
        setHealth,
        configuration,
        setConfiguration,
        tools,
        setTools,
        loading,
        setLoading,
        error,
        setError,
    };
}

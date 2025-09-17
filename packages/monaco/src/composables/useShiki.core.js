/**
 * Core Shiki State Management
 *
 * Handles the fundamental state for Shiki syntax highlighting
 */
import { createSignal } from "solid-js";
export function createShikiState() {
    const [state, setState] = createSignal({
        highlighter: null,
        isLoading: true,
        error: null,
        highlightedHtml: "",
    });
    const updateState = (updates) => {
        setState((prev) => ({ ...prev, ...updates }));
    };
    const setHighlighter = (highlighter) => {
        updateState({ highlighter, isLoading: false, error: null });
    };
    const setError = (error) => {
        updateState({ error, isLoading: false });
    };
    const setHighlightedHtml = (html) => {
        updateState({ highlightedHtml: html });
    };
    const setLoading = (loading) => {
        updateState({ isLoading: loading });
    };
    return {
        state,
        updateState,
        setHighlighter,
        setError,
        setHighlightedHtml,
        setLoading,
    };
}

/**
 * Core Monaco Shiki State Management
 *
 * Handles the fundamental state for Monaco-Shiki integration
 */
import { createSignal } from "solid-js";
export function createMonacoShikiState(options = {}) {
    const [state, setState] = createSignal({
        isShikiEnabled: options.enableShikiHighlighting !== false,
        currentTheme: options.theme || "github-dark",
        currentLang: options.lang || "javascript",
        shikiHighlightedContent: "",
        monacoTheme: "vs-dark",
    });
    const updateState = (updates) => {
        setState((prev) => ({ ...prev, ...updates }));
    };
    const setShikiEnabled = (enabled) => {
        updateState({ isShikiEnabled: enabled });
    };
    const setCurrentTheme = (theme) => {
        updateState({ currentTheme: theme });
    };
    const setCurrentLang = (lang) => {
        updateState({ currentLang: lang });
    };
    const setShikiContent = (content) => {
        updateState({ shikiHighlightedContent: content });
    };
    const setMonacoTheme = (theme) => {
        updateState({ monacoTheme: theme });
    };
    return {
        state,
        updateState,
        setShikiEnabled,
        setCurrentTheme,
        setCurrentLang,
        setShikiContent,
        setMonacoTheme,
    };
}

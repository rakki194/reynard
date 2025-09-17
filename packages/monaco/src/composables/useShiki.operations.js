/**
 * Shiki Operations
 *
 * Handles the actual syntax highlighting operations
 */
import { codeToHtml, createHighlighter } from "shiki";
export function createShikiOperations(state, setHighlighter, setError, setLoading) {
    const initializeHighlighter = async (options) => {
        try {
            setLoading(true);
            setError(null);
            const themes = options.themes || ["github-dark", "github-light"];
            const langs = options.langs || [
                "javascript",
                "typescript",
                "jsx",
                "tsx",
                "html",
                "css",
                "python",
                "json",
                "markdown",
                "bash",
                "yaml",
                "xml",
            ];
            const highlighter = await createHighlighter({
                themes,
                langs,
            });
            setHighlighter(highlighter);
        }
        catch (error) {
            setError(error instanceof Error ? error.message : "Failed to initialize Shiki");
        }
    };
    const highlightCode = async (code, lang, theme) => {
        const currentState = state();
        if (!currentState.highlighter) {
            throw new Error("Shiki highlighter not initialized");
        }
        try {
            return await codeToHtml(code, {
                lang,
                theme,
            });
        }
        catch (error) {
            throw new Error(`Failed to highlight code: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    };
    const getAvailableThemes = () => {
        const currentState = state();
        return currentState.highlighter?.getLoadedThemes() || [];
    };
    const getAvailableLanguages = () => {
        const currentState = state();
        return currentState.highlighter?.getLoadedLanguages() || [];
    };
    return {
        initializeHighlighter,
        highlightCode,
        getAvailableThemes,
        getAvailableLanguages,
    };
}

/**
 * Monaco Shiki Operations
 *
 * Handles the integration logic between Monaco and Shiki
 */
export function createMonacoShikiOperations(state, updateState, _options = {}) {
    const highlightCode = async (code, lang, theme) => {
        // Simplified implementation - in real code this would use Shiki
        return `<pre class="shiki-${theme}"><code class="language-${lang}">${code}</code></pre>`;
    };
    const syncThemes = (monacoTheme, shikiTheme) => {
        updateState({
            monacoTheme,
            currentTheme: shikiTheme,
        });
    };
    const updateLanguage = (lang) => {
        updateState({ currentLang: lang });
    };
    const updateTheme = (theme) => {
        updateState({ currentTheme: theme });
    };
    const toggleShiki = () => {
        const currentState = state();
        updateState({ isShikiEnabled: !currentState.isShikiEnabled });
    };
    return {
        highlightCode,
        syncThemes,
        updateLanguage,
        updateTheme,
        toggleShiki,
    };
}

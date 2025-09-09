/**
 * Monaco Shiki Operations
 *
 * Handles the integration logic between Monaco and Shiki
 */

import type { MonacoShikiOptions } from "../types";
import type { MonacoShikiState } from "../types";

export interface MonacoShikiOperations {
  highlightCode: (code: string, lang: string, theme: string) => Promise<string>;
  syncThemes: (monacoTheme: string, shikiTheme: string) => void;
  updateLanguage: (lang: string) => void;
  updateTheme: (theme: string) => void;
  toggleShiki: () => void;
}

export function createMonacoShikiOperations(
  state: () => MonacoShikiState,
  updateState: (updates: Partial<MonacoShikiState>) => void,
  _options: MonacoShikiOptions = {},
): MonacoShikiOperations {
  const highlightCode = async (
    code: string,
    lang: string,
    theme: string,
  ): Promise<string> => {
    // Simplified implementation - in real code this would use Shiki
    return `<pre class="shiki-${theme}"><code class="language-${lang}">${code}</code></pre>`;
  };

  const syncThemes = (monacoTheme: string, shikiTheme: string) => {
    updateState({
      monacoTheme,
      currentTheme: shikiTheme,
    });
  };

  const updateLanguage = (lang: string) => {
    updateState({ currentLang: lang });
  };

  const updateTheme = (theme: string) => {
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

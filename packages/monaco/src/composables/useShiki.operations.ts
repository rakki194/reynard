/**
 * Shiki Operations
 *
 * Handles the actual syntax highlighting operations
 */

import { codeToHtml, createHighlighter } from "shiki";
import type { ShikiOptions } from "../types";

export interface ShikiOperations {
  initializeHighlighter: (options: ShikiOptions) => Promise<void>;
  highlightCode: (code: string, lang: string, theme: string) => Promise<string>;
  getAvailableThemes: () => string[];
  getAvailableLanguages: () => string[];
}

export function createShikiOperations(
  state: () => any,
  setHighlighter: (highlighter: any) => void,
  setError: (error: string | null) => void,
  setLoading: (loading: boolean) => void
): ShikiOperations {
  const initializeHighlighter = async (options: ShikiOptions) => {
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
    } catch (error) {
      setError(error instanceof Error ? error.message : t("monaco.errors.failedToInitializeShiki"));
    }
  };

  const highlightCode = async (code: string, lang: string, theme: string): Promise<string> => {
    const { t } = useI18n();
    const currentState = state();
    
    if (!currentState.highlighter) {
      throw new Error(t("monaco.errors.shikiHighlighterNotInitialized"));
    }

    try {
      return await codeToHtml(code, {
        lang,
        theme,
      });
    } catch (error) {
      throw new Error(`${t("monaco.errors.failedToHighlightCode")}: ${error instanceof Error ? error.message : t("monaco.errors.unknownError")}`);
    }
  };

  const getAvailableThemes = (): string[] => {
    const currentState = state();
    return currentState.highlighter?.getLoadedThemes() || [];
  };

  const getAvailableLanguages = (): string[] => {
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

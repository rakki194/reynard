/**
 * useMonacoShiki composable - Refactored
 *
 * Modular Monaco-Shiki integration with separated concerns:
 * - Core state management in useMonacoShiki.core
 * - Integration operations in useMonacoShiki.operations
 * - Main composable orchestrates the modules
 */

import { onMount } from "solid-js";
// import { useShiki } from './useShiki'; // Currently unused but kept for future integration
import { createMonacoShikiState } from "./useMonacoShiki.core";
import { createMonacoShikiOperations } from "./useMonacoShiki.operations";
import type { MonacoShikiOptions } from "../types";

export interface UseMonacoShikiReturn {
  state: () => any;
  highlightCode: (
    code: string,
    lang?: string,
    theme?: string,
  ) => Promise<string>;
  syncThemes: (monacoTheme: string, shikiTheme: string) => void;
  updateLanguage: (lang: string) => void;
  updateTheme: (theme: string) => void;
  toggleShiki: () => void;
  isShikiEnabled: () => boolean;
  currentTheme: () => string;
  currentLang: () => string;
}

export const useMonacoShiki = (
  options: MonacoShikiOptions = {},
): UseMonacoShikiReturn => {
  // Create core state
  const stateManager = createMonacoShikiState(options);

  // Create operations
  const operations = createMonacoShikiOperations(
    stateManager.state,
    stateManager.updateState,
    options,
  );

  // Initialize Shiki (currently unused but kept for future integration)
  // const _shiki = useShiki({
  //   theme: options.theme || 'github-dark',
  //   lang: options.lang || 'javascript',
  //   themes: options.themes || ['github-dark', 'github-light'],
  //   langs: options.langs || [
  //     'javascript', 'typescript', 'jsx', 'tsx', 'html', 'css',
  //     'scss', 'sass', 'less', 'python', 'java', 'csharp',
  //     'cpp', 'c', 'rust', 'go', 'php', 'ruby', 'swift',
  //     'kotlin', 'dart', 'json', 'yaml', 'markdown'
  //   ],
  // });

  // Setup on mount
  onMount(() => {
    if ((options as any).autoSync !== false) {
      operations.syncThemes("vs-dark", options.theme || "github-dark");
    }
  });

  // Enhanced highlight function
  const highlightCode = async (
    code: string,
    lang?: string,
    theme?: string,
  ): Promise<string> => {
    const currentState = stateManager.state();
    const targetLang = lang || currentState.currentLang;
    const targetTheme = theme || currentState.currentTheme;

    if (currentState.isShikiEnabled) {
      return operations.highlightCode(code, targetLang, targetTheme);
    }

    return code;
  };

  return {
    state: stateManager.state,
    highlightCode,
    syncThemes: operations.syncThemes,
    updateLanguage: operations.updateLanguage,
    updateTheme: operations.updateTheme,
    toggleShiki: operations.toggleShiki,
    isShikiEnabled: () => stateManager.state().isShikiEnabled,
    currentTheme: () => stateManager.state().currentTheme,
    currentLang: () => stateManager.state().currentLang,
  };
};

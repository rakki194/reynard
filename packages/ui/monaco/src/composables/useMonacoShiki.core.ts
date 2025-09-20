/**
 * Core Monaco Shiki State Management
 *
 * Handles the fundamental state for Monaco-Shiki integration
 */

import { createSignal } from "solid-js";
import type { MonacoShikiOptions, MonacoShikiState } from "../types";

export function createMonacoShikiState(options: MonacoShikiOptions = {}) {
  const [state, setState] = createSignal<MonacoShikiState>({
    isShikiEnabled: options.enableShikiHighlighting !== false,
    currentTheme: options.theme || "github-dark",
    currentLang: options.lang || "javascript",
    shikiHighlightedContent: "",
    monacoTheme: "vs-dark",
  });

  const updateState = (updates: Partial<MonacoShikiState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const setShikiEnabled = (enabled: boolean) => {
    updateState({ isShikiEnabled: enabled });
  };

  const setCurrentTheme = (theme: string) => {
    updateState({ currentTheme: theme });
  };

  const setCurrentLang = (lang: string) => {
    updateState({ currentLang: lang });
  };

  const setShikiContent = (content: string) => {
    updateState({ shikiHighlightedContent: content });
  };

  const setMonacoTheme = (theme: string) => {
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

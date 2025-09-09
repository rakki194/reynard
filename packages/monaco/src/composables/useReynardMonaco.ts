/**
 * Monaco Editor integration with Reynard themes
 * Provides seamless theme synchronization between Reynard and Monaco Editor
 */

import { createSignal, createEffect } from "solid-js";
import { useMonacoShiki } from "./useMonacoShiki";
import {
  getMonacoThemeFromReynard,
  getShikiThemeFromReynard,
  isReynardThemeDark,
} from "../utils/themeMapping";
import { registerCustomMonacoTheme } from "../utils/customThemes";
// Define ThemeName locally to avoid dependency issues
type ThemeName =
  | "light"
  | "dark"
  | "gray"
  | "banana"
  | "strawberry"
  | "peanut"
  | "high-contrast-black"
  | "high-contrast-inverse";

export interface ReynardMonacoOptions {
  /** The current Reynard theme (can be a function for reactivity) */
  reynardTheme: ThemeName | (() => ThemeName);
  /** Language for syntax highlighting (can be a function for reactivity) */
  lang?: string | (() => string);
  /** Whether to enable Shiki syntax highlighting */
  enableShikiHighlighting?: boolean;
  /** Additional Monaco editor options */
  monacoOptions?: any;
}

export interface ReynardMonacoState {
  /** Current Monaco theme name */
  monacoTheme: string;
  /** Current Shiki theme name */
  shikiTheme: string;
  /** Whether the current theme is dark */
  isDark: boolean;
  /** Whether Shiki highlighting is enabled */
  isShikiEnabled: boolean;
}

/**
 * Hook for Monaco Editor with Reynard theme integration
 * Automatically syncs Monaco Editor theme with the current Reynard theme
 */
export const useReynardMonaco = (options: ReynardMonacoOptions) => {
  // Helper functions to get reactive values
  const getReynardTheme = (): ThemeName => {
    return typeof options.reynardTheme === "function"
      ? options.reynardTheme()
      : options.reynardTheme;
  };

  const getLang = (): string => {
    return typeof options.lang === "function"
      ? options.lang()
      : options.lang || "javascript";
  };

  const [state, setState] = createSignal<ReynardMonacoState>({
    monacoTheme: getMonacoThemeFromReynard(getReynardTheme()),
    shikiTheme: getShikiThemeFromReynard(getReynardTheme()),
    isDark: isReynardThemeDark(getReynardTheme()),
    isShikiEnabled: options.enableShikiHighlighting !== false,
  });

  // Initialize Monaco Shiki with Reynard theme
  const monacoShiki = useMonacoShiki({
    theme: getShikiThemeFromReynard(getReynardTheme()),
    lang: getLang(),
    enableShikiHighlighting: options.enableShikiHighlighting !== false,
  });

  // Register custom Monaco themes
  const registerThemes = (monaco: any) => {
    if (monaco && monaco.editor) {
      const reynardTheme = getReynardTheme();
      console.log(
        "Registering custom Monaco theme for Reynard theme:",
        reynardTheme,
      );
      registerCustomMonacoTheme(monaco, reynardTheme);

      // Also set the theme immediately after registration
      const themeName = `reynard-${reynardTheme}`;
      console.log("Setting Monaco theme to:", themeName);
      monaco.editor.setTheme(themeName);
    }
  };

  // Update state when Reynard theme changes
  createEffect(() => {
    const reynardTheme = getReynardTheme();
    const newMonacoTheme = getMonacoThemeFromReynard(reynardTheme);
    const newShikiTheme = getShikiThemeFromReynard(reynardTheme);
    const newIsDark = isReynardThemeDark(reynardTheme);

    setState({
      monacoTheme: newMonacoTheme,
      shikiTheme: newShikiTheme,
      isDark: newIsDark,
      isShikiEnabled: options.enableShikiHighlighting !== false,
    });

    // Update Monaco Shiki theme only if it's different
    if (monacoShiki.currentTheme() !== newShikiTheme) {
      monacoShiki.updateTheme(newShikiTheme);
    }
  });

  // Get Monaco editor options with Reynard theme
  const getMonacoOptions = (additionalOptions: any = {}) => {
    const baseOptions = {
      automaticLayout: true,
      minimap: {
        enabled: true,
        side: "right",
        size: "proportional",
        showSlider: "mouseover",
        renderCharacters: false,
        maxColumn: 120,
        scale: 1,
      },
      scrollBeyondLastLine: false,
      fontSize: 14,
      fontFamily: "var(--font-family-mono)",
      lineHeight: 20,
      lineNumbers: "on",
      roundedSelection: false,
      scrollbar: {
        vertical: "visible",
        horizontal: "visible",
        verticalScrollbarSize: 12,
        horizontalScrollbarSize: 12,
      },
      folding: true,
      wordWrap: "on",
      acceptSuggestionOnEnter: "on",
      tabCompletion: "on",
      parameterHints: {
        enabled: true,
      },
      autoIndent: "full",
      formatOnPaste: true,
      formatOnType: true,
      dragAndDrop: true,
      links: true,
      colorDecorators: true,
      fixedOverflowWidgets: true,
      overviewRulerBorder: false,
      overviewRulerLanes: 0,
      theme: state().monacoTheme,
    };

    return { ...baseOptions, ...options.monacoOptions, ...additionalOptions };
  };

  return {
    // State
    state,
    monacoTheme: () => state().monacoTheme,
    shikiTheme: () => state().shikiTheme,
    isDark: () => state().isDark,
    isShikiEnabled: () => state().isShikiEnabled,

    // Monaco Shiki integration
    monacoShiki,

    // Utilities
    getMonacoOptions,
    registerThemes,

    // Theme utilities
    getMonacoThemeFromReynard,
    getShikiThemeFromReynard,
    isReynardThemeDark,
  };
};

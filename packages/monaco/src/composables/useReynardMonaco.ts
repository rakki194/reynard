/**
 * Monaco Editor integration with Reynard themes
 * Provides seamless theme synchronization between Reynard and Monaco Editor
 */

import { createSignal, createEffect } from 'solid-js';
import { useMonacoShiki } from './useMonacoShiki';
import { 
  getMonacoThemeFromReynard, 
  getShikiThemeFromReynard,
  isReynardThemeDark
} from '../utils/themeMapping';
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
  /** The current Reynard theme */
  reynardTheme: ThemeName;
  /** Language for syntax highlighting */
  lang?: string;
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
  const [state, setState] = createSignal<ReynardMonacoState>({
    monacoTheme: getMonacoThemeFromReynard(options.reynardTheme),
    shikiTheme: getShikiThemeFromReynard(options.reynardTheme),
    isDark: isReynardThemeDark(options.reynardTheme),
    isShikiEnabled: options.enableShikiHighlighting !== false,
  });

  // Initialize Monaco Shiki with Reynard theme
  const monacoShiki = useMonacoShiki({
    theme: getShikiThemeFromReynard(options.reynardTheme),
    lang: options.lang || 'javascript',
    enableShikiHighlighting: options.enableShikiHighlighting !== false,
    reynardTheme: options.reynardTheme,
    useReynardTheme: true,
  });

  // Update state when Reynard theme changes
  createEffect(() => {
    const reynardTheme = options.reynardTheme;
    const newMonacoTheme = getMonacoThemeFromReynard(reynardTheme);
    const newShikiTheme = getShikiThemeFromReynard(reynardTheme);
    const newIsDark = isReynardThemeDark(reynardTheme);

    setState({
      monacoTheme: newMonacoTheme,
      shikiTheme: newShikiTheme,
      isDark: newIsDark,
      isShikiEnabled: options.enableShikiHighlighting !== false,
    });

    // Update Monaco Shiki theme
    monacoShiki.updateTheme(newShikiTheme);
  });

  // Get Monaco editor options with Reynard theme
  const getMonacoOptions = (additionalOptions: any = {}) => {
    const baseOptions = {
      automaticLayout: true,
      minimap: {
        enabled: true,
        side: 'right',
        size: 'proportional',
        showSlider: 'mouseover',
        renderCharacters: false,
        maxColumn: 120,
        scale: 1,
      },
      scrollBeyondLastLine: false,
      fontSize: 14,
      fontFamily: 'var(--font-family-mono)',
      lineNumbers: 'on',
      roundedSelection: false,
      scrollbar: {
        vertical: 'visible',
        horizontal: 'visible',
        verticalScrollbarSize: 12,
        horizontalScrollbarSize: 12,
      },
      folding: true,
      wordWrap: 'on',
      acceptSuggestionOnEnter: 'on',
      tabCompletion: 'on',
      parameterHints: {
        enabled: true,
      },
      autoIndent: 'full',
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
    
    // Theme utilities
    getMonacoThemeFromReynard,
    getShikiThemeFromReynard,
    isReynardThemeDark,
  };
};

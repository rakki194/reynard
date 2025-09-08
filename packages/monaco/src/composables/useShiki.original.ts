import { createSignal, onMount, onCleanup } from 'solid-js';
import { codeToHtml, createHighlighter } from 'shiki';
import type { ShikiOptions, ShikiState } from '../types';

export const useShiki = (options: ShikiOptions = {}) => {
  const [state, setState] = createSignal<ShikiState>({
    highlighter: null,
    isLoading: true,
    error: null,
    highlightedHtml: '',
  });

  // Initialize highlighter
  const initializeHighlighter = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Use only safe themes that are guaranteed to be available
      const themes = options.themes || ['github-dark', 'github-light'];
      const langs = options.langs || [
        'javascript',
        'typescript',
        'jsx',
        'tsx',
        'html',
        'css',
        'python',
        'json',
        'markdown',
        'bash',
        'shell',
        'toml',
        'yaml',
        'xml',
        'sql',
      ];

      const highlighter = await createHighlighter({
        themes,
        langs,
      });

      setState(prev => ({
        ...prev,
        highlighter,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Failed to initialize Shiki highlighter:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to initialize highlighter',
        isLoading: false,
      }));
    }
  };

  // Highlight code using the highlighter instance
  const highlightCode = (code: string, lang: string = 'javascript', theme: string = 'github-dark') => {
    const currentState = state();
    if (!currentState.highlighter) {
      console.warn('Shiki highlighter not initialized');
      return code;
    }

    try {
      const html = currentState.highlighter.codeToHtml(code, {
        lang: lang as any,
        theme: theme as any,
      });

      setState(prev => ({ ...prev, highlightedHtml: html }));
      return html;
    } catch (error) {
      console.error('Failed to highlight code:', error);
      return code;
    }
  };

  // Highlight code using the shorthand function (for one-off highlighting)
  const highlightCodeAsync = async (code: string, lang: string = 'javascript', theme: string = 'github-dark') => {
    try {
      const html = await codeToHtml(code, {
        lang: lang as any,
        theme: theme as any,
      });
      return html;
    } catch (error) {
      console.error('Failed to highlight code:', error);
      return code;
    }
  };

  // Load additional theme
  const loadTheme = async (theme: string) => {
    const currentState = state();
    if (!currentState.highlighter) {
      console.warn('Shiki highlighter not initialized');
      return false;
    }

    try {
      await currentState.highlighter.loadTheme(theme as any);
      return true;
    } catch (error) {
      console.error('Failed to load theme:', error);
      return false;
    }
  };

  // Load additional language
  const loadLanguage = async (lang: string) => {
    const currentState = state();
    if (!currentState.highlighter) {
      console.warn('Shiki highlighter not initialized');
      return false;
    }

    try {
      await currentState.highlighter.loadLanguage(lang as any);
      return true;
    } catch (error) {
      console.error('Failed to load language:', error);
      return false;
    }
  };

  // Get available themes
  const getAvailableThemes = () => {
    const currentState = state();
    if (!currentState.highlighter) return [];
    return currentState.highlighter.getLoadedThemes();
  };

  // Get available languages
  const getAvailableLanguages = () => {
    const currentState = state();
    if (!currentState.highlighter) return [];
    return currentState.highlighter.getLoadedLanguages();
  };

  // Initialize on mount
  onMount(() => {
    // Use setTimeout to avoid potential recursion issues
    setTimeout(() => {
      initializeHighlighter();
    }, 0);
  });

  // Cleanup
  onCleanup(() => {
    const currentState = state();
    if (currentState.highlighter) {
      // Shiki doesn't have explicit cleanup, but we can clear the reference
      setState(prev => ({ ...prev, highlighter: null }));
    }
  });

  return {
    // State
    isLoading: () => state().isLoading,
    error: () => state().error,
    highlightedHtml: () => state().highlightedHtml,

    // Methods
    highlightCode,
    highlightCodeAsync,
    loadTheme,
    loadLanguage,
    getAvailableThemes,
    getAvailableLanguages,

    // Highlighter instance (for advanced usage)
    highlighter: () => state().highlighter,
  };
};



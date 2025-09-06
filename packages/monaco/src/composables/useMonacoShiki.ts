import { createSignal, onMount } from 'solid-js';
import { useShiki } from './useShiki';
import type { MonacoShikiOptions, MonacoShikiState } from '../types';

export const useMonacoShiki = (options: MonacoShikiOptions = {}) => {
  const [state, setState] = createSignal<MonacoShikiState>({
    isShikiEnabled: options.enableShikiHighlighting !== false,
    currentTheme: options.theme || 'github-dark',
    currentLang: options.lang || 'javascript',
    shikiHighlightedContent: '',
    monacoTheme: 'vs-dark',
  });

  // Initialize Shiki
  const shiki = useShiki({
    theme: options.theme || 'github-dark',
    lang: options.lang || 'javascript',
    themes: options.themes || ['github-dark', 'github-light'],
    langs: options.langs || [
      'javascript',
      'typescript',
      'jsx',
      'tsx',
      'html',
      'css',
      'scss',
      'sass',
      'less',
      'python',
      'java',
      'cpp',
      'c',
      'csharp',
      'php',
      'ruby',
      'go',
      'rust',
      'swift',
      'kotlin',
      'scala',
      'r',
      'sql',
      'json',
      'xml',
      'yaml',
      'toml',
      'markdown',
      'bash',
      'shell',
      'powershell',
      'dockerfile',
    ],
  });

  // Map Shiki themes to Monaco themes
  const shikiToMonacoThemeMap: Record<string, string> = {
    'github-dark': 'vs-dark',
    'github-light': 'vs',
  };

  // Get Monaco theme from Shiki theme
  const getMonacoTheme = (shikiTheme: string): string => {
    return shikiToMonacoThemeMap[shikiTheme] || 'vs-dark';
  };

  // Update theme
  const updateTheme = (theme: string) => {
    setState(prev => ({
      ...prev,
      currentTheme: theme,
    }));
    updateMonacoTheme();
  };

  // Update language
  const updateLanguage = (lang: string) => {
    setState(prev => ({
      ...prev,
      currentLang: lang,
    }));
  };

  // Toggle Shiki highlighting
  const toggleShikiHighlighting = () => {
    setState(prev => ({
      ...prev,
      isShikiEnabled: !prev.isShikiEnabled,
    }));
  };

  // Enable/disable Shiki highlighting
  const setShikiHighlighting = (enabled: boolean) => {
    setState(prev => ({
      ...prev,
      isShikiEnabled: enabled,
    }));
  };

  // Highlight code with Shiki and return Monaco-compatible tokens
  const highlightCodeForMonaco = async (code: string, lang: string, theme: string) => {
    if (!state().isShikiEnabled) {
      return null;
    }

    try {
      const html = await shiki.highlightCodeAsync(code, lang, theme);

      // Parse the HTML to extract tokens
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const tokens: Array<{ text: string; scopes: string[] }> = [];

      // Extract tokens from the highlighted HTML
      const walker = document.createTreeWalker(doc.body, NodeFilter.SHOW_ELEMENT, null);

      let node: Node | null;
      while ((node = walker.nextNode())) {
        const element = node as Element;
        const text = element.textContent || '';
        const className = element.className || '';

        if (text && className) {
          // Convert Shiki classes to Monaco scopes
          const scopes = className.split(' ').map(cls => {
            // Map Shiki token types to Monaco scopes
            const scopeMap: Record<string, string> = {
              'hljs-keyword': 'keyword',
              'hljs-string': 'string',
              'hljs-comment': 'comment',
              'hljs-number': 'number',
              'hljs-literal': 'literal',
              'hljs-operator': 'operator',
              'hljs-punctuation': 'punctuation',
              'hljs-function': 'function',
              'hljs-class': 'class',
              'hljs-variable': 'variable',
              'hljs-constant': 'constant',
              'hljs-property': 'property',
              'hljs-parameter': 'parameter',
              'hljs-type': 'type',
              'hljs-namespace': 'namespace',
              'hljs-decorator': 'decorator',
              'hljs-meta': 'meta',
              'hljs-tag': 'tag',
              'hljs-attr': 'attribute',
              'hljs-built_in': 'builtin',
              'hljs-title': 'title',
              'hljs-section': 'section',
              'hljs-selector': 'selector',
              'hljs-rule': 'rule',
              'hljs-value': 'value',
              'hljs-symbol': 'symbol',
              'hljs-regexp': 'regexp',
              'hljs-attribute': 'attribute',
              'hljs-template-tag': 'template',
              'hljs-template-variable': 'template-variable',
              'hljs-addition': 'addition',
              'hljs-deletion': 'deletion',
            };

            return scopeMap[cls] || 'text';
          });

          tokens.push({ text, scopes });
        }
      }

      return tokens;
    } catch (error) {
      console.error('Failed to highlight code for Monaco:', error);
      return null;
    }
  };

  // Get Monaco editor options with Shiki integration
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

    return { ...baseOptions, ...additionalOptions };
  };

  // Create custom Monaco theme based on Shiki theme
  const createCustomMonacoTheme = async (shikiTheme: string) => {
    if (!state().isShikiEnabled) {
      return null;
    }

    try {
      // This would require more complex integration with Monaco's theming system
      // For now, we'll use the basic theme mapping
      return getMonacoTheme(shikiTheme);
    } catch (error) {
      console.error('Failed to create custom Monaco theme:', error);
      return null;
    }
  };

  // Update Monaco theme when Shiki theme changes
  const updateMonacoTheme = () => {
    const currentTheme = state().currentTheme;
    const monacoTheme = getMonacoTheme(currentTheme);

    setState(prev => ({
      ...prev,
      monacoTheme,
    }));
  };

  // Initialize Monaco theme
  onMount(() => {
    updateMonacoTheme();
  });

  return {
    // State
    isShikiEnabled: () => state().isShikiEnabled,
    currentTheme: () => state().currentTheme,
    currentLang: () => state().currentLang,
    monacoTheme: () => state().monacoTheme,
    shikiHighlightedContent: () => state().shikiHighlightedContent,

    // Shiki state
    shikiLoading: shiki.isLoading,
    shikiError: shiki.error,

    // Methods
    updateTheme,
    updateLanguage,
    toggleShikiHighlighting,
    setShikiHighlighting,
    highlightCodeForMonaco,
    getMonacoOptions,
    createCustomMonacoTheme,

    // Shiki methods
    highlightCode: shiki.highlightCode,
    highlightCodeAsync: shiki.highlightCodeAsync,
    loadTheme: shiki.loadTheme,
    loadLanguage: shiki.loadLanguage,
    getAvailableThemes: shiki.getAvailableThemes,
    getAvailableLanguages: shiki.getAvailableLanguages,

    // Highlighter instance
    highlighter: shiki.highlighter,
  };
};
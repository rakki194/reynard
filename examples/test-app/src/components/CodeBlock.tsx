import { Component, createEffect, createSignal, Show } from 'solid-js';
import { useShiki } from '@reynard/monaco';
import { useTheme } from '@reynard/core';
import './CodeBlock.css';

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
  explanation?: string;
  showLineNumbers?: boolean;
  maxHeight?: string;
}

export const CodeBlock: Component<CodeBlockProps> = (props) => {
  const { theme: currentTheme } = useTheme();
  const [highlightedHtml, setHighlightedHtml] = createSignal('');
  const [isLoading, setIsLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);

  // Initialize Shiki with theme-aware configuration
  const shiki = useShiki({
    themes: ['github-dark', 'github-light', 'nord', 'min-dark', 'min-light'],
    langs: [
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
    ],
  });

  // Map Reynard themes to Shiki themes
  const getShikiTheme = (reynardTheme: string): string => {
    const themeMap: Record<string, string> = {
      'light': 'github-light',
      'dark': 'github-dark',
      'gray': 'github-dark',
      'banana': 'github-light',
      'strawberry': 'github-dark',
      'peanut': 'github-dark',
      'nord': 'nord',
      'minimal': 'min-light',
      'minimal-dark': 'min-dark',
      'ocean': 'github-dark',
      'forest': 'github-dark',
      'sunset': 'github-dark',
      'cosmic': 'github-dark',
      'high-contrast-black': 'github-dark',
      'high-contrast-inverse': 'github-light',
    };
    return themeMap[reynardTheme] || 'github-light';
  };

  // Highlight code when props change
  createEffect(async () => {
    if (!shiki.highlighter()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const language = props.language || 'text';
      const shikiTheme = getShikiTheme(currentTheme());
      
      // Use the async function to avoid state updates that could cause recursion
      const html = await shiki.highlightCodeAsync(props.code, language, shikiTheme);
      setHighlightedHtml(html);
    } catch (err) {
      console.error('Failed to highlight code:', err);
      setError(err instanceof Error ? err.message : 'Failed to highlight code');
      setHighlightedHtml(props.code);
    } finally {
      setIsLoading(false);
    }
  });

  return (
    <div class="code-block-container">
      <Show when={props.title}>
        <h4 class="code-title">{props.title}</h4>
      </Show>
      
      <div class="code-block-wrapper">
        <Show when={isLoading()}>
          <div class="code-loading">
            <div class="loading-spinner"></div>
            <span>Highlighting code...</span>
          </div>
        </Show>
        
        <Show when={error()}>
          <div class="code-error">
            <span class="error-icon">⚠️</span>
            <span>Failed to highlight code: {error()}</span>
          </div>
        </Show>
        
        <div 
          class="code-block"
          classList={{
            'loading': isLoading(),
            'error': !!error(),
            'with-line-numbers': props.showLineNumbers !== false,
            'scrollable': !!props.maxHeight,
          }}
        >
          <Show when={!isLoading() && !error()}>
            <div 
              class="highlighted-code"
              innerHTML={highlightedHtml()}
            />
          </Show>
          
          <Show when={isLoading() || error()}>
            <pre class="fallback-code">
              <code class={`language-${props.language || 'text'}`}>
                {props.code}
              </code>
            </pre>
          </Show>
        </div>
      </div>
      
      <Show when={props.explanation}>
        <div class="code-explanation">
          {props.explanation}
        </div>
      </Show>
    </div>
  );
};

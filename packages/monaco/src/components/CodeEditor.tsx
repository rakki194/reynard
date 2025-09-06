import { Component, createSignal, createEffect, onMount, Show } from 'solid-js';
import { MonacoEditor } from '../solid-monaco/MonacoEditor';
import { useLanguageDetection } from '../composables/useLanguageDetection';
import { useMonacoShiki } from '../composables/useMonacoShiki';
import { getMonacoLanguageFromName, getDisplayNameFromLanguage } from '../utils/languageUtils';
import './CodeEditor.css';

interface CodeEditorProps {
  value?: string;
  language?: string;
  theme?: string;
  readOnly?: boolean;
  onChange?: (value: string | undefined) => void;
  onSave?: () => void;
  height?: string;
  width?: string;
  showLineNumbers?: boolean;
  showSearch?: boolean;
  className?: string;
}

export const CodeEditor: Component<CodeEditorProps> = props => {
  const languageDetection = useLanguageDetection();
  // Temporarily disable Shiki integration to fix highlighting issues
  const monacoShiki = useMonacoShiki({
    theme: props.theme === 'dark' || props.theme === 'gray' ? 'github-dark' : 'github-light',
    lang: (props.language as any) || 'javascript',
    enableShikiHighlighting: false,
  });

  const [isLoading, setIsLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);

  // Initialize Monaco editor
  onMount(async () => {
    try {
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to initialize Monaco editor:', error);
      setError(error instanceof Error ? error.message : 'Failed to initialize editor');
      setIsLoading(false);
    }
  });

  // Auto-detect natural language when content changes (if no language is explicitly set)
  createEffect(() => {
    const content = props.value;
    const language = props.language;

    if (content && !language && languageDetection.isNaturalLanguageDetectionAvailable()) {
      // Only detect if we have content and no explicit language
      languageDetection.detectNaturalLanguage(content);
    }
  });

  const getMonacoTheme = (): string => {
    return monacoShiki.monacoTheme();
  };

  const getMonacoLanguage = (language: string): string => {
    return getMonacoLanguageFromName(language);
  };

  const getLanguageName = (): string => {
    // If we have a detected natural language and no explicit language is set, use the detected one
    if (!props.language && languageDetection.detectedNaturalLanguage() !== 'unknown') {
      const detected = languageDetection.detectedNaturalLanguage();
      return detected.charAt(0).toUpperCase() + detected.slice(1);
    }

    return getDisplayNameFromLanguage(props.language || 'javascript');
  };

  return (
    <div class={`code-editor ${props.className || ''}`}>
      <div class="editor-container">
        <Show when={error()}>
          <div class="error-container">
            <div class="error-icon">
              <span>⚠️</span>
            </div>
            <h3>Editor Error</h3>
            <p>{error()}</p>
            <button onClick={() => window.location.reload()}>
              Reload Page
            </button>
          </div>
        </Show>

        <Show when={!error() && !isLoading()} fallback={<div class="loading">Loading...</div>}>
          <div
            class={`monaco-editor-container ${props.height ? 'monaco-editor-container--custom-height' : ''} ${props.width ? 'monaco-editor-container--custom-width' : ''}`}
            style={{
              '--editor-height': props.height || '400px',
              '--editor-width': props.width || '100%',
            } as any}
          >
            <MonacoEditor
              value={props.value || ''}
              language={getMonacoLanguage(props.language || 'javascript')}
              theme={getMonacoTheme()}
              onChange={props.onChange}
              options={monacoShiki.getMonacoOptions({
                lineNumbers: props.showLineNumbers !== false ? 'on' : 'off',
                readOnly: props.readOnly || false,
              })}
            />
          </div>
        </Show>
      </div>

      <div class="editor-status">
        <span class="status-item">
          Language: {getLanguageName()}
        </span>
        <Show
          when={
            languageDetection.isNaturalLanguageDetectionAvailable() &&
            !props.language &&
            languageDetection.detectedNaturalLanguage() !== 'unknown'
          }
        >
          <span class="status-item language-detection-indicator">
            <span class="detection-icon">🔍</span>
            Auto-detected
            <Show when={languageDetection.confidence() > 0}>
              <span class="confidence">({Math.round(languageDetection.confidence() * 100)}%)</span>
            </Show>
          </span>
        </Show>
        <span class="status-item">
          Theme: {props.theme || 'auto'}
        </span>
        <Show when={monacoShiki.isShikiEnabled()}>
          <span class="status-item shiki-indicator">
            <span class="shiki-icon">✨</span>
            Shiki Enhanced
          </span>
        </Show>
      </div>
    </div>
  );
};

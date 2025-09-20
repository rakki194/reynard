import { createSignal, createEffect, onMount, Show } from "solid-js";
import { MonacoEditor } from "../solid-monaco/MonacoEditor";
import { useLanguageDetection } from "../composables/useLanguageDetection";
import { useReynardMonaco } from "../composables/useReynardMonaco";
import { getMonacoLanguageFromName, getDisplayNameFromLanguage } from "../utils/languageUtils";
import "./CodeEditor.css";
export const CodeEditor = props => {
  const languageDetection = useLanguageDetection();
  // Use Reynard Monaco integration for proper theme support
  const reynardMonaco = useReynardMonaco({
    reynardTheme: () => props.theme || "light",
    lang: () => props.language || "javascript",
    enableShikiHighlighting: true,
  });
  const [isLoading, setIsLoading] = createSignal(true);
  const [error, setError] = createSignal(null);
  let editorContainerRef;
  // Initialize Monaco editor
  onMount(async () => {
    try {
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to initialize Monaco editor:", error);
      setError(error instanceof Error ? error.message : "Failed to initialize editor");
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
  // Height and width are now handled by the MonacoEditor component directly
  const getMonacoTheme = () => {
    return reynardMonaco.monacoTheme();
  };
  const getMonacoLanguage = language => {
    return getMonacoLanguageFromName(language);
  };
  const getLanguageName = () => {
    // If we have a detected natural language and no explicit language is set, use the detected one
    if (!props.language && languageDetection.detectedNaturalLanguage() !== "unknown") {
      const detected = languageDetection.detectedNaturalLanguage();
      return detected.charAt(0).toUpperCase() + detected.slice(1);
    }
    return getDisplayNameFromLanguage(props.language || "javascript");
  };
  return (
    <div class={`code-editor ${props.className || ""}`}>
      <div class="editor-container">
        <Show when={error()}>
          <div class="error-container">
            <div class="error-icon">
              <span>⚠️</span>
            </div>
            <h3>Editor Error</h3>
            <p>{error()}</p>
            <button onClick={() => window.location.reload()}>Reload Page</button>
          </div>
        </Show>

        <Show when={!error() && !isLoading()} fallback={<div class="loading">Loading...</div>}>
          <div
            ref={editorContainerRef}
            class={`monaco-editor-container ${props.height ? "monaco-editor-container--custom-height" : ""} ${props.width ? "monaco-editor-container--custom-width" : ""}`}
          >
            <MonacoEditor
              value={props.value || ""}
              language={getMonacoLanguage(props.language || "javascript")}
              theme={getMonacoTheme()}
              onChange={props.onChange}
              height={props.height}
              width={props.width}
              options={reynardMonaco.getMonacoOptions({
                lineNumbers: props.showLineNumbers !== false ? "on" : "off",
                readOnly: props.readOnly || false,
              })}
              onMount={(_, monaco) => {
                // Register custom themes when Monaco is available
                reynardMonaco.registerThemes(monaco);
              }}
            />
          </div>
        </Show>
      </div>

      <div class="editor-status">
        <span class="status-item">Language: {getLanguageName()}</span>
        <Show
          when={
            languageDetection.isNaturalLanguageDetectionAvailable() &&
            !props.language &&
            languageDetection.detectedNaturalLanguage() !== "unknown"
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
        <span class="status-item">Theme: {props.theme || "auto"}</span>
        <Show when={reynardMonaco.isShikiEnabled()}>
          <span class="status-item shiki-indicator">
            <span class="shiki-icon">✨</span>
            Shiki Enhanced
          </span>
        </Show>
      </div>
    </div>
  );
};

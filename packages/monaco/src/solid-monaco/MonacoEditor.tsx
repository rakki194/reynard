import { Component, createEffect, onMount, onCleanup, createSignal, type JSX } from "solid-js";
import loader from "@monaco-editor/loader";
import type * as monaco from "monaco-editor";
import { t } from "reynard-core";
import "./MonacoEditor.css";

export interface MonacoEditorProps {
  value?: string;
  language?: string;
  theme?: string;
  options?: monaco.editor.IStandaloneEditorConstructionOptions;
  onChange?: (value: string | undefined) => void;
  onMount?: (editor: monaco.editor.IStandaloneCodeEditor, monaco: typeof import("monaco-editor")) => void;
  onValidate?: (markers: monaco.editor.IMarker[]) => void;
  width?: string | number;
  height?: string | number;
  className?: string;
  style?: JSX.CSSProperties;
}

export const MonacoEditor: Component<MonacoEditorProps> = props => {
  const [containerRef, setContainerRef] = createSignal<HTMLDivElement>();
  const [editor, setEditor] = createSignal<monaco.editor.IStandaloneCodeEditor>();
  const [monaco, setMonaco] = createSignal<typeof import("monaco-editor")>();
  const [isLoading, setIsLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);

  // Initialize Monaco
  onMount(async () => {
    try {
      const monacoInstance = await loader.init();
      setMonaco(monacoInstance);
      setIsLoading(false);
    } catch (err) {
      console.error(t("monaco.failedToLoadMonacoEditor"), err);
      setError(err instanceof Error ? err.message : t("monaco.failedToLoadMonacoEditor"));
      setIsLoading(false);
    }
  });

  // Create editor when Monaco is loaded
  createEffect(() => {
    const container = containerRef();
    const monacoInstance = monaco();

    if (container && monacoInstance && !editor()) {
      try {
        const editorInstance = monacoInstance.editor.create(container, {
          value: props.value || "",
          language: props.language || "javascript",
          theme: props.theme || "vs",
          ...props.options,
        });

        setEditor(editorInstance);

        // Set up validation listener
        if (props.onValidate) {
          const model = editorInstance.getModel();
          if (model) {
            const markers = monacoInstance.editor.getModelMarkers({
              resource: model.uri,
            });
            props.onValidate?.(markers);
          }
        }

        // Call onMount callback
        props.onMount?.(editorInstance, monacoInstance);
      } catch (err) {
        console.error(t("monaco.failedToCreateMonacoEditor"), err);
        setError(err instanceof Error ? err.message : t("monaco.failedToCreateEditor"));
      }
    }
  });

  // Set up change listener
  createEffect(() => {
    const editorInstance = editor();
    const onChange = props.onChange;
    if (editorInstance && onChange) {
      const disposable = editorInstance.onDidChangeModelContent(() => {
        const value = editorInstance.getValue();
        onChange(value);
      });

      // Return cleanup function
      return () => disposable.dispose();
    }
  });

  // Update editor value when props change
  createEffect(() => {
    const editorInstance = editor();
    if (editorInstance && props.value !== undefined) {
      const currentValue = editorInstance.getValue();
      if (currentValue !== props.value) {
        editorInstance.setValue(props.value);
      }
    }
  });

  // Update language when props change
  createEffect(() => {
    const editorInstance = editor();
    const monacoInstance = monaco();
    if (editorInstance && monacoInstance && props.language) {
      const model = editorInstance.getModel();
      if (model) {
        monacoInstance.editor.setModelLanguage(model, props.language);
      }
    }
  });

  // Update theme when props change
  createEffect(() => {
    const monacoInstance = monaco();
    if (monacoInstance && props.theme) {
      monacoInstance.editor.setTheme(props.theme);
    }
  });

  // Update options when props change
  createEffect(() => {
    const editorInstance = editor();
    if (editorInstance && props.options) {
      editorInstance.updateOptions(props.options);
    }
  });

  // Cleanup
  onCleanup(() => {
    const editorInstance = editor();
    if (editorInstance) {
      editorInstance.dispose();
    }
  });

  return (
    <div
      ref={setContainerRef}
      class={`monaco-editor-wrapper ${props.height ? "monaco-editor-wrapper--custom-height" : ""} ${props.width ? "monaco-editor-wrapper--custom-width" : ""} ${props.className || ""}`}
      style={
        {
          "--editor-height": props.height || "400px",
          "--editor-width": props.width || "100%",
          height: props.height || "400px",
          width: props.width || "100%",
          "min-height": "200px",
          ...props.style,
        } as JSX.CSSProperties
      }
    >
      {isLoading() && <div class="monaco-editor-loading">Loading Monaco Editor...</div>}
      {error() && <div class="monaco-editor-error">Error: {error()}</div>}
    </div>
  );
};

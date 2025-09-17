/**
 * JSON Editor Component
 *
 * A generic JSON editor with syntax highlighting, validation, and Monaco integration.
 * Built for the Reynard caption system but can be used for any JSON editing needs.
 *
 * Features:
 * - Real-time JSON validation with Monaco
 * - Syntax highlighting for JSON format
 * - Error reporting and line numbers
 * - Keyboard shortcuts for formatting
 * - Integration with Reynard's Monaco package
 */

import { Component, createSignal, createMemo, createEffect } from "solid-js";
import { MonacoEditor } from "reynard-monaco";
import { EditorHeader, ErrorDetails } from "./JSONEditorComponents";

interface ValidationMarker {
  startLineNumber: number;
  message: string;
}

export interface JSONEditorProps {
  content: string;
  onChange: (content: string) => void;
  onValidationChange?: (isValid: boolean, markers: ValidationMarker[]) => void;
  title?: string;
  height?: string;
  width?: string;
  theme?: "light" | "dark";
  readOnly?: boolean;
  placeholder?: string;
}

// Format JSON with proper indentation
const formatJSON = (jsonContent: string): string => {
  try {
    const parsed = JSON.parse(jsonContent);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return jsonContent; // Return original if invalid
  }
};

// Monaco editor options for JSON
const getMonacoOptions = (readOnly: boolean) => ({
  fontSize: 14,
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  wordWrap: "on" as const,
  automaticLayout: true,
  lineNumbers: "on" as const,
  readOnly,
  // JSON-specific options
  formatOnPaste: true,
  formatOnType: true,
  suggest: {
    showKeywords: true,
    showSnippets: true,
  },
  // JSON configuration
  bracketPairColorization: {
    enabled: true,
  },
  guides: {
    bracketPairs: true,
    indentation: true,
  },
  // Error highlighting
  renderValidationDecorations: "on" as const,
});

// Event handlers for JSON Editor
const createJSONEditorHandlers = (
  content: () => string,
  setContent: (content: string) => void,
  setValidationMarkers: (markers: ValidationMarker[]) => void,
  props: JSONEditorProps
) => {
  const handleValidation = (markers: ValidationMarker[]) => {
    setValidationMarkers(markers);
    props.onValidationChange?.(markers.length === 0, markers);
  };

  const handleContentChange = (newContent: string | undefined) => {
    if (newContent !== undefined) {
      setContent(newContent);
      props.onChange(newContent);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      const formatted = formatJSON(content());
      setContent(formatted);
      props.onChange(formatted);
    }
  };

  const handleFormat = () => {
    const formatted = formatJSON(content());
    setContent(formatted);
    props.onChange(formatted);
  };

  return {
    handleValidation,
    handleContentChange,
    handleKeyDown,
    handleFormat,
  };
};

export const JSONEditor: Component<JSONEditorProps> = props => {
  const [content, setContent] = createSignal("");
  const [validationMarkers, setValidationMarkers] = createSignal<ValidationMarker[]>([]);

  // Computed values
  const isValid = createMemo(() => validationMarkers().length === 0);

  // Effects - Initialize and sync content with props
  createEffect(() => {
    setContent(props.content);
  });

  // Event handlers
  const { handleValidation, handleContentChange, handleFormat } = createJSONEditorHandlers(
    content,
    setContent,
    setValidationMarkers,
    props
  );

  return (
    <div class="json-editor">
      <EditorHeader
        title={props.title}
        isValid={isValid}
        validationMarkers={validationMarkers}
        onFormat={handleFormat}
      />

      <div class="editor-container">
        <MonacoEditor
          value={content()}
          language="json"
          onChange={handleContentChange}
          onValidate={handleValidation}
          options={getMonacoOptions(props.readOnly || false)}
          height={props.height || "400px"}
          width={props.width || "100%"}
          theme={props.theme || "light"}
        />
      </div>

      <ErrorDetails validationMarkers={validationMarkers} />
    </div>
  );
};

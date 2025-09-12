/**
 * TOML Editor Component
 *
 * A specialized editor for TOML format with syntax highlighting,
 * validation, and Monaco integration. Built for the Reynard caption system.
 *
 * Features:
 * - Real-time TOML validation
 * - Syntax highlighting for TOML format
 * - Error reporting and line numbers
 * - Keyboard shortcuts for formatting
 * - Integration with Reynard's Monaco package
 */

import {
  Component,
  createSignal,
  createMemo,
  onMount,
  Show,
  For,
} from "solid-js";
import { MonacoEditor } from "reynard-monaco";

interface ValidationMarker {
  startLineNumber: number;
  message: string;
}

export interface TOMLEditorProps {
  /** Initial TOML content */
  content: string;
  /** Callback when content changes */
  onChange: (content: string) => void;
  /** Callback when validation status changes */
  onValidationChange?: (isValid: boolean, errors: ValidationMarker[]) => void;
  /** Editor height */
  height?: string;
  /** Editor width */
  width?: string;
  /** Whether the editor is read-only */
  readOnly?: boolean;
  /** Custom theme */
  theme?:
    | "light"
    | "dark"
    | "gray"
    | "banana"
    | "strawberry"
    | "peanut"
    | "high-contrast-black"
    | "high-contrast-inverse";
  /** Additional CSS class */
  className?: string;
}

export const TOMLEditor: Component<TOMLEditorProps> = (props) => {
  const [content, setContent] = createSignal(props.content);
  const [validationMarkers, setValidationMarkers] = createSignal<
    ValidationMarker[]
  >([]);

  // Real-time validation using Monaco's built-in INI validation (TOML uses INI language)
  const isValid = createMemo(() => {
    const markers = validationMarkers();
    return markers.length === 0;
  });

  // Handle validation markers from Monaco
  const handleValidation = (markers: ValidationMarker[]) => {
    setValidationMarkers(markers);
    props.onValidationChange?.(markers.length === 0, markers);
  };

  // Handle content changes
  const handleContentChange = (newContent: string | undefined) => {
    if (newContent !== undefined) {
      setContent(newContent);
      props.onChange(newContent);
    }
  };

  // Basic TOML formatting (indentation and spacing)
  const formatTOML = (tomlContent: string): string => {
    const lines = tomlContent.split("\n");
    const formatted: string[] = [];
    let currentIndent = 0;

    for (const line of lines) {
      const trimmed = line.trim();

      // Skip empty lines
      if (!trimmed) {
        formatted.push("");
        continue;
      }

      // Handle section headers
      if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
        currentIndent = 0;
        formatted.push(trimmed);
        continue;
      }

      // Handle key-value pairs
      if (trimmed.includes("=")) {
        const [key, ...valueParts] = trimmed.split("=");
        const value = valueParts.join("=").trim();

        // Format key-value pair with proper spacing
        const formattedLine = `${key.trim()} = ${value}`;
        formatted.push("  ".repeat(currentIndent) + formattedLine);
        continue;
      }

      // Handle comments
      if (trimmed.startsWith("#")) {
        formatted.push("  ".repeat(currentIndent) + trimmed);
        continue;
      }

      // Default: preserve original indentation
      formatted.push(line);
    }

    return formatted.join("\n");
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: KeyboardEvent) => {
    // Shift+Enter for formatting
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      const formatted = formatTOML(content());
      setContent(formatted);
      props.onChange(formatted);
    }
  };

  // Update content when props change
  onMount(() => {
    if (props.content !== content()) {
      setContent(props.content);
    }
  });

  return (
    <div
      class={`toml-editor ${props.className || ""}`}
      onKeyDown={handleKeyDown}
    >
      <div class="editor-header">
        <div class="editor-info">
          <span class="editor-title">TOML Editor</span>
          <span
            class="validation-status"
            classList={{
              valid: isValid(),
              invalid: !isValid(),
            }}
          >
            {isValid()
              ? "Valid TOML"
              : `${validationMarkers().length} error${validationMarkers().length !== 1 ? "s" : ""}`}
          </span>
        </div>
        <div class="editor-actions">
          <button
            type="button"
            class="format-button"
            onClick={() => {
              const formatted = formatTOML(content());
              setContent(formatted);
              props.onChange(formatted);
            }}
            title="Format TOML (Shift+Enter)"
          >
            Format
          </button>
        </div>
      </div>

      <div class="editor-container">
        <MonacoEditor
          value={content()}
          language="ini" // Monaco uses 'ini' for TOML syntax highlighting
          onChange={handleContentChange}
          onValidate={handleValidation}
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: "on",
            automaticLayout: true,
            lineNumbers: "on",
            readOnly: props.readOnly || false,
            // TOML-specific options
            formatOnPaste: true,
            suggest: {
              showKeywords: true,
              showSnippets: true,
            },
            // TOML-specific configuration
            bracketPairColorization: {
              enabled: true,
            },
            guides: {
              bracketPairs: true,
              indentation: true,
            },
            // Error highlighting
            renderValidationDecorations: "on",
          }}
          height={props.height || "400px"}
          width={props.width || "100%"}
          theme={props.theme || "light"}
        />
      </div>

      {/* Error details */}
      <Show when={!isValid() && validationMarkers().length > 0}>
        <div class="error-details">
          <div class="error-header">Validation Errors:</div>
          <For each={validationMarkers()}>
            {(marker: ValidationMarker) => (
              <div class="error-item">
                <span class="error-line">Line {marker.startLineNumber}:</span>
                <span class="error-message">{marker.message}</span>
              </div>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
};

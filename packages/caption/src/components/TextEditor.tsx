/**
 * Text Editor Component for Reynard Caption System
 *
 * Provides Monaco editor integration for text file editing.
 */

import { Component, createSignal, Show } from "solid-js";
import { MonacoEditor } from "reynard-monaco";
import { TextFile } from "../types/TextTypes";
import { getFileExtension } from "../utils/textFileUtils";

export interface TextEditorProps {
  file: TextFile;
  onClose: () => void;
  onModify: (content: string) => void;
  editable?: boolean;
}

export const TextEditor: Component<TextEditorProps> = (props) => {
  const [content, setContent] = createSignal(props.file.content);
  const [isModified, setIsModified] = createSignal(false);

  const handleContentChange = (newContent: string | undefined) => {
    if (newContent !== undefined) {
      setContent(newContent);
      setIsModified(true);
      props.onModify(newContent);
    }
  };

  const handleSave = () => {
    // Content is already saved via onModify callback
    setIsModified(false);
  };

  const getLanguageFromExtension = (filename: string): string => {
    const extension = getFileExtension(filename);

    const languageMap: Record<string, string> = {
      ".js": "javascript",
      ".ts": "typescript",
      ".tsx": "typescript",
      ".jsx": "javascript",
      ".py": "python",
      ".java": "java",
      ".cpp": "cpp",
      ".c": "c",
      ".cs": "csharp",
      ".php": "php",
      ".rb": "ruby",
      ".go": "go",
      ".rs": "rust",
      ".swift": "swift",
      ".kt": "kotlin",
      ".scala": "scala",
      ".html": "html",
      ".css": "css",
      ".scss": "scss",
      ".sass": "sass",
      ".less": "less",
      ".json": "json",
      ".xml": "xml",
      ".yaml": "yaml",
      ".yml": "yaml",
      ".toml": "toml",
      ".md": "markdown",
      ".txt": "plaintext",
      ".log": "plaintext",
      ".sql": "sql",
      ".sh": "shell",
      ".bash": "shell",
      ".zsh": "shell",
      ".fish": "shell",
      ".ps1": "powershell",
      ".bat": "batch",
      ".dockerfile": "dockerfile",
    };

    return languageMap[extension] || "plaintext";
  };

  return (
    <div class="text-editor-modal">
      <div class="text-editor-content">
        <div class="text-editor-header">
          <div class="file-info">
            <h3>{props.file.name}</h3>
            <div class="file-details">
              {props.file.metadata.lineCount} lines •{" "}
              {props.file.metadata.wordCount} words •{" "}
              {props.file.metadata.characterCount} characters
            </div>
          </div>

          <div class="editor-actions">
            <Show when={isModified()}>
              <button onClick={handleSave} class="save-button">
                Save
              </button>
            </Show>
            <button onClick={props.onClose} class="close-button">
              ×
            </button>
          </div>
        </div>

        <div class="text-editor-container">
          <MonacoEditor
            value={content()}
            language={getLanguageFromExtension(props.file.name)}
            onChange={handleContentChange}
            options={{
              fontSize: 14,
              minimap: { enabled: true },
              scrollBeyondLastLine: false,
              wordWrap: "on",
              automaticLayout: true,
              lineNumbers: "on",
              readOnly: !props.editable,
              formatOnPaste: true,
              formatOnType: true,
              suggest: {
                showKeywords: true,
                showSnippets: true,
              },
              theme: "vs-dark",
            }}
            height="500px"
            width="100%"
          />
        </div>
      </div>
    </div>
  );
};

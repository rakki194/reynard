/**
 * File Content Display Component
 *
 * Displays file content with syntax highlighting and line numbers.
 */

import { Component, Show, For } from "solid-js";
import { getLanguageFromExtension } from "../utils/file-utils";

export interface FileContentDisplayProps {
  fileContent: string;
  fileName: string;
  showLineNumbers: boolean;
  wrapLines: boolean;
  fontSize: number;
}

export const FileContentDisplay: Component<FileContentDisplayProps> = (props) => {
  const getFileExtension = () => {
    return props.fileName.split(".").pop()?.toLowerCase() || "txt";
  };

  return (
    <div class="rag-file-content">
      <div
        class="file-content-editor"
        style={{
          "font-size": `${props.fontSize}px`,
          "white-space": props.wrapLines ? "pre-wrap" : "pre",
        }}
      >
        <Show when={props.showLineNumbers}>
          <div class="line-numbers">
            <For
              each={Array.from(
                { length: props.fileContent.split("\n").length },
                (_, i) => i + 1,
              )}
            >
              {(lineNumber) => <div class="line-number">{lineNumber}</div>}
            </For>
          </div>
        </Show>

        <div class="file-text">
          <pre
            class={`language-${getLanguageFromExtension(getFileExtension())}`}
          >
            {props.fileContent}
          </pre>
        </div>
      </div>
    </div>
  );
};

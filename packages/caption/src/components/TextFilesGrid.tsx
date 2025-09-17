/**
 * Text Files Grid Component for Reynard Caption System
 *
 * Displays the grid of text file cards.
 */

import { Component, For, Show } from "solid-js";
import { TextFile } from "../types/TextTypes";
import { TextFileCard } from "./TextFileCard";
import { TextEditor } from "./TextEditor";

export interface TextFilesGridProps {
  files: TextFile[];
  selectedFile: TextFile | null;
  onFileSelect: (file: TextFile) => void;
  onFileRemove: (fileId: string) => void;
  onFileModify: (fileId: string, content: string) => void;
  onCloseEditor: () => void;
  showMetadata?: boolean;
  editable?: boolean;
  class?: string;
}

export const TextFilesGrid: Component<TextFilesGridProps> = props => {
  return (
    <>
      {/* Text Files Grid */}
      <div class={`text-files-grid ${props.class || ""}`}>
        <For each={props.files}>
          {file => (
            <TextFileCard
              file={file}
              isSelected={props.selectedFile?.id === file.id}
              onSelect={() => props.onFileSelect(file)}
              onRemove={() => props.onFileRemove(file.id)}
              showMetadata={props.showMetadata}
            />
          )}
        </For>
      </div>

      {/* Selected Text Editor */}
      <Show when={props.selectedFile}>
        <TextEditor
          file={props.selectedFile!}
          onClose={props.onCloseEditor}
          onModify={content => props.onFileModify(props.selectedFile!.id, content)}
          editable={props.editable}
        />
      </Show>
    </>
  );
};

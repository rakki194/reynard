/**
 * Text Files Grid Component for Reynard Caption System
 *
 * Displays the grid of text file cards.
 */
import { For, Show } from "solid-js";
import { TextFileCard } from "./TextFileCard";
import { TextEditor } from "./TextEditor";
export const TextFilesGrid = props => {
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
          file={props.selectedFile}
          onClose={props.onCloseEditor}
          onModify={content => props.onFileModify(props.selectedFile.id, content)}
          editable={props.editable}
        />
      </Show>
    </>
  );
};

/**
 * Multi-Modal Grid Component
 *
 * Displays files in a grid layout with file cards.
 */
import { For } from "solid-js";
import { MultiModalFileCard } from "./MultiModalFileCard";
export const MultiModalGrid = props => {
    return (<div class="multi-modal-grid">
      <For each={props.files}>
        {file => (<MultiModalFileCard file={file} isSelected={props.selectedFile?.id === file.id} onSelect={() => props.onFileSelect(file)} onRemove={() => props.onFileRemove(file.id)} showMetadata={props.showMetadata}/>)}
      </For>
    </div>);
};

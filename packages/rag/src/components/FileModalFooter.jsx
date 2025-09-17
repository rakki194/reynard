/**
 * File Modal Footer Component
 *
 * Footer section with file metadata for the RAG file modal.
 */
import { Show } from "solid-js";
import { getLanguageFromExtension, getFileExtension } from "../utils/file-utils";
export const FileModalFooter = (props) => {
    return (<div class="rag-file-footer">
      <div class="file-metadata">
        <span>
          Language: {getLanguageFromExtension(getFileExtension(props.fileName))}
        </span>
        <span>Modality: {props.modality}</span>
        <Show when={props.chunkIndex !== undefined}>
          <span>Chunk: {(props.chunkIndex ?? 0) + 1}</span>
        </Show>
      </div>
    </div>);
};

/**
 * Chunk Navigation Component
 *
 * Navigation controls for browsing through file chunks.
 */
import { Show } from "solid-js";
import { Select } from "reynard-components-core";
export const ChunkNavigation = props => {
    return (<>
      {/* Chunk navigation */}
      <Show when={props.chunks.length > 1}>
        <div class="rag-file-chunk-nav">
          <label>Chunk:</label>
          <Select value={props.selectedChunk || 0} onChange={value => props.onChunkChange(Number(value))} options={props.chunks.map((_, index) => ({
            value: index,
            label: `Chunk ${index + 1}`,
        }))} size="small"/>
          <span class="chunk-info">{props.chunks.length} chunks total</span>
        </div>
      </Show>

      {/* Highlighted chunk text if available */}
      <Show when={props.chunkText && props.chunkIndex !== undefined}>
        <div class="rag-file-chunk-highlight">
          <h4>Highlighted Chunk {props.chunkIndex + 1}</h4>
          <div class="chunk-text">
            <pre>{props.chunkText}</pre>
          </div>
        </div>
      </Show>
    </>);
};

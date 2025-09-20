/**
 * Results List Component
 *
 * Displays the list of RAG search results
 * with metadata and similarity scores.
 */
import { For } from "solid-js";
import { Card } from "reynard-components-core";
export const ResultsList = props => {
  return (
    <div class="results-list">
      <For each={props.results}>
        {result => (
          <Card variant="elevated" padding="md" interactive onClick={() => props.onResultClick(result)}>
            <div class="result-item">
              <div class="result-header">
                <div class="result-badges">
                  <span class="rank-badge">#{result.rank}</span>
                  <span class="model-badge">{result.metadata.embedding_model || "unknown"}</span>
                  <span class="source-badge">{result.metadata.document_source || "Unknown source"}</span>
                </div>
                <span class="similarity-score">{(result.similarity_score * 100).toFixed(1)}%</span>
              </div>

              <p class="result-text">{result.text}</p>

              <div class="result-meta">
                <span>Chunk ID: {result.chunk_id}</span>
                <span>•</span>
                <span>{result.metadata.chunk_length || 0} chars</span>
              </div>
            </div>
          </Card>
        )}
      </For>
    </div>
  );
};

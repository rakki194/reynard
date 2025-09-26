/**
 * Search Settings Component
 *
 * Handles search configuration controls including embedding model,
 * max results, similarity threshold, and reranking options.
 */
import { Card, Select, Slider, Toggle } from "reynard-primitives";
const EMBEDDING_MODELS = [
  {
    value: "embeddinggemma:latest",
    label: "EmbeddingGemma (Latest)",
  },
  {
    value: "embeddinggemma:300m",
    label: "EmbeddingGemma (300M)",
  },
  {
    value: "mxbai-embed-large",
    label: "MXBAI Embed Large",
  },
  { value: "nomic-embed-text", label: "Nomic Embed Text" },
  { value: "all-minilm", label: "All-MiniLM" },
];
export function SearchSettings(props: any) {
  return (
    <Card variant="elevated" padding="lg">
      <h3>Search Settings</h3>

      <div class="settings-form">
        <div class="setting-group">
          <label>Embedding Model</label>
          <Select
            value={props.embeddingModel}
            onChange={e => props.onEmbeddingModelChange(e.target.value)}
            options={EMBEDDING_MODELS}
            fullWidth
          />
        </div>

        <div class="setting-group">
          <label>Max Results: {props.maxResults}</label>
          <Slider
            min={1}
            max={50}
            value={props.maxResults}
            onChange={(e: any) => props.onMaxResultsChange(parseInt(e.currentTarget.value))}
            class="range-slider"
            aria-label="Maximum number of search results"
          />
        </div>

        <div class="setting-group">
          <label>Similarity Threshold: {(props.similarityThreshold * 100).toFixed(0)}%</label>
          <Slider
            min={0.1}
            max={1.0}
            step={0.05}
            value={props.similarityThreshold}
            onChange={(e: any) => props.onSimilarityThresholdChange(parseFloat(e.currentTarget.value))}
            class="range-slider"
            aria-label="Similarity threshold for search results"
          />
        </div>

        <div class="setting-group">
          <label class="checkbox-label">
            <Toggle
              size="sm"
              checked={props.enableReranking}
              onChange={(e: any) => props.onEnableRerankingChange(e.currentTarget.checked)}
            />
            Enable Reranking
          </label>
        </div>
      </div>
    </Card>
  );
}

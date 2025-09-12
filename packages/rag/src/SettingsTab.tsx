/**
 * RAG Settings Tab Component
 *
 * Manages search settings and displays system statistics
 * for the RAG system configuration.
 */

import { Show } from "solid-js";
import { Button, Card, Select } from "reynard-components";
import type { RAGStats } from "./types";

export interface SettingsTabProps {
  embeddingModel: string;
  onEmbeddingModelChange: (model: string) => void;
  maxResults: number;
  onMaxResultsChange: (maxResults: number) => void;
  similarityThreshold: number;
  onSimilarityThresholdChange: (threshold: number) => void;
  enableReranking: boolean;
  onEnableRerankingChange: (enabled: boolean) => void;
  stats: RAGStats | null;
}

export function SettingsTab(props: SettingsTabProps) {
  return (
    <div class="settings-tab-content">
      <Card variant="elevated" padding="lg">
        <h3>Search Settings</h3>

        <div class="settings-form">
          <div class="setting-group">
            <label>Embedding Model</label>
            <Select
              value={props.embeddingModel}
              onChange={(e: Event) =>
                props.onEmbeddingModelChange(
                  (e.target as HTMLSelectElement).value,
                )
              }
              options={[
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
              ]}
              fullWidth
            />
          </div>

          <div class="setting-group">
            <label>Max Results: {props.maxResults}</label>
            <input
              type="range"
              min="1"
              max="50"
              value={props.maxResults}
              onInput={(e) =>
                props.onMaxResultsChange(parseInt(e.currentTarget.value))
              }
              class="range-slider"
              title="Maximum number of search results"
              aria-label="Maximum number of search results"
            />
          </div>

          <div class="setting-group">
            <label>
              Similarity Threshold:{" "}
              {(props.similarityThreshold * 100).toFixed(0)}%
            </label>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={props.similarityThreshold}
              onInput={(e) =>
                props.onSimilarityThresholdChange(
                  parseFloat(e.currentTarget.value),
                )
              }
              class="range-slider"
              title="Similarity threshold for search results"
              aria-label="Similarity threshold for search results"
            />
          </div>

          <div class="setting-group">
            <label class="checkbox-label">
              <input
                type="checkbox"
                checked={props.enableReranking}
                onChange={(e) =>
                  props.onEnableRerankingChange(e.currentTarget.checked)
                }
              />
              Enable Reranking
            </label>
          </div>
        </div>
      </Card>

      <Show when={props.stats}>
        <Card variant="elevated" padding="lg">
          <h3>System Statistics</h3>

          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-label">Total Documents</div>
              <div class="stat-value">{props.stats!.total_documents}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Total Chunks</div>
              <div class="stat-value">{props.stats!.total_chunks}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Embedding Coverage</div>
              <div class="stat-value">
                {(props.stats!.embedding_coverage * 100).toFixed(1)}%
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Default Model</div>
              <div class="stat-model">{props.stats!.default_model}</div>
            </div>
          </div>
        </Card>
      </Show>
    </div>
  );
}

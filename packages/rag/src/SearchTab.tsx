/**
 * RAG Search Tab Component
 *
 * Handles the search interface and results display
 * for RAG queries with EmbeddingGemma integration.
 */

import { Show, For } from "solid-js";
import { Button, Card, TextField } from "reynard-components";
import { getIcon as getIconFromRegistry } from "reynard-fluent-icons";
import type { RAGResult, RAGQueryResponse } from "./types";

// Helper function to get icon as JSX element
const getIcon = (name: string) => {
  const icon = getIconFromRegistry(name);
  if (icon) {
    return <div innerHTML={icon as unknown as string} />;
  }
  return null;
};

export interface SearchTabProps {
  query: string;
  onQueryChange: (query: string) => void;
  onSearch: () => void;
  onKeyPress: (e: KeyboardEvent) => void;
  isSearching: boolean;
  error: string | null;
  results: RAGResult[];
  queryResponse: RAGQueryResponse | null;
  onResultClick: (result: RAGResult) => void;
}

export function SearchTab(props: SearchTabProps) {
  const hasResults = () => props.results.length > 0;

  return (
    <div class="search-tab-content">
      <Card variant="elevated" padding="lg">
        <div class="search-form">
          <div class="search-input-group">
            <TextField
              value={props.query}
              onInput={(e: Event) =>
                props.onQueryChange((e.target as HTMLInputElement).value)
              }
              onKeyPress={props.onKeyPress}
              placeholder="Ask a question or search for information..."
              fullWidth
              disabled={props.isSearching}
            />
            <Button
              onClick={props.onSearch}
              disabled={props.isSearching || !props.query.trim()}
              leftIcon={getIcon("search")}
              loading={props.isSearching}
            >
              Search
            </Button>
          </div>

          <Show when={props.error}>
            <div class="error-message">{props.error}</div>
          </Show>

          <Show when={props.queryResponse}>
            <div class="query-stats">
              <div class="stat-item">
                <div class="stat-icon">{getIcon("refresh")}</div>
                <span>
                  Query: {props.queryResponse!.query_time.toFixed(2)}ms
                </span>
              </div>
              <div class="stat-item">
                <div class="stat-icon">{getIcon("server")}</div>
                <span>
                  Embedding: {props.queryResponse!.embedding_time.toFixed(2)}ms
                </span>
              </div>
              <div class="stat-item">
                <div class="stat-icon">{getIcon("refresh")}</div>
                <span>
                  Search: {props.queryResponse!.search_time.toFixed(2)}ms
                </span>
              </div>
              <div class="stat-item">
                <div class="stat-icon">{getIcon("server")}</div>
                <span>{props.queryResponse!.total_results} results</span>
              </div>
            </div>
          </Show>
        </div>
      </Card>

      <Show when={hasResults()}>
        <div class="results-list">
          <For each={props.results}>
            {(result) => (
              <Card
                variant="elevated"
                padding="md"
                interactive
                onClick={() => props.onResultClick(result)}
              >
                <div class="result-item">
                  <div class="result-header">
                    <div class="result-badges">
                      <span class="rank-badge">#{result.rank}</span>
                      <span class="model-badge">
                        {result.metadata.embedding_model || "unknown"}
                      </span>
                      <span class="source-badge">
                        {result.metadata.document_source || "Unknown source"}
                      </span>
                    </div>
                    <span class="similarity-score">
                      {(result.similarity_score * 100).toFixed(1)}%
                    </span>
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
      </Show>
    </div>
  );
}

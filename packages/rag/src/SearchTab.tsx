/**
 * RAG Search Tab Component
 *
 * Handles the search interface and results display
 * for RAG queries with EmbeddingGemma integration.
 */

import { Show } from "solid-js";
import { Card } from "reynard-components";
import { SearchForm } from "./components/SearchForm";
import { QueryStats } from "./components/QueryStats";
import { ResultsList } from "./components/ResultsList";
import type { RAGResult, RAGQueryResponse } from "./types";

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
        <SearchForm
          query={props.query}
          onQueryChange={props.onQueryChange}
          onSearch={props.onSearch}
          onKeyPress={props.onKeyPress}
          isSearching={props.isSearching}
          error={props.error}
        />

        <Show when={props.queryResponse}>
          <QueryStats queryResponse={props.queryResponse!} />
        </Show>
      </Card>

      <Show when={hasResults()}>
        <ResultsList results={props.results} onResultClick={props.onResultClick} />
      </Show>
    </div>
  );
}

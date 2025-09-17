/**
 * Search History List Component
 *
 * List section with items and empty state.
 */

import { Component, For, Show } from "solid-js";
import type { SearchHistoryItem, RAGModality } from "../types";
import { SearchHistoryItem as HistoryItem } from "./SearchHistoryItem";
import { SearchHistoryEmpty } from "./SearchHistoryEmpty";

export interface SearchHistoryListProps {
  filteredHistory: SearchHistoryItem[];
  searchQuery: string;
  selectedModality: RAGModality | "all";
  onSearchAgain: (query: string, modality: RAGModality) => void;
  onRemoveItem: (id: string) => void;
}

export const SearchHistoryList: Component<SearchHistoryListProps> = props => {
  return (
    <div class="history-list">
      <Show
        when={props.filteredHistory.length > 0}
        fallback={<SearchHistoryEmpty hasFilters={props.searchQuery !== "" || props.selectedModality !== "all"} />}
      >
        <For each={props.filteredHistory}>
          {item => <HistoryItem item={item} onSearchAgain={props.onSearchAgain} onRemoveItem={props.onRemoveItem} />}
        </For>
      </Show>
    </div>
  );
};

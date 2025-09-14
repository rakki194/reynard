/**
 * Search History Empty State Component
 *
 * Empty state display when no search history is found.
 */

import { Component, Show } from "solid-js";
import { getIcon } from "../utils/searchHistoryUtils";

export interface SearchHistoryEmptyProps {
  hasFilters: boolean;
}

export const SearchHistoryEmpty: Component<SearchHistoryEmptyProps> = (props) => {
  return (
    <div class="history-empty">
      <div class="empty-icon">{getIcon("history")}</div>
      <p>No search history found</p>
      <Show when={props.hasFilters}>
        <p>Try adjusting your filters</p>
      </Show>
    </div>
  );
};

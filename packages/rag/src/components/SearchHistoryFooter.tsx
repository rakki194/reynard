/**
 * Search History Footer Component
 *
 * Footer section with statistics and limits.
 */

import { Component, Show } from "solid-js";
import type { SearchHistoryItem } from "../types";

export interface SearchHistoryFooterProps {
  filteredCount: number;
  totalCount: number;
  maxItems?: number;
}

export const SearchHistoryFooter: Component<SearchHistoryFooterProps> = props => {
  return (
    <div class="history-footer">
      <div class="history-stats">
        Showing {props.filteredCount} of {props.totalCount} items
      </div>

      <Show when={props.maxItems && props.totalCount > props.maxItems}>
        <div class="history-limit">Limited to {props.maxItems} most recent items</div>
      </Show>
    </div>
  );
};

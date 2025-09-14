/**
 * Search History Header Component
 *
 * Header section with title and clear action.
 */

import { Component } from "solid-js";
import { Button } from "reynard-components";
import { getIcon } from "../utils/searchHistoryUtils";

export interface SearchHistoryHeaderProps {
  onClearHistory: () => void;
}

export const SearchHistoryHeader: Component<SearchHistoryHeaderProps> = (props) => {
  return (
    <div class="history-header">
      <h3>Search History</h3>
      <div class="history-actions">
        <Button
          variant="secondary"
          size="sm"
          onClick={props.onClearHistory}
          leftIcon={getIcon("delete")}
        >
          Clear All
        </Button>
      </div>
    </div>
  );
};

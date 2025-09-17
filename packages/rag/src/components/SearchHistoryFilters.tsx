/**
 * Search History Filters Component
 *
 * Filter and sort controls for search history.
 */

import { Component } from "solid-js";
import { Button, TextField, Select } from "reynard-components";
import type { RAGModality } from "../types";
import { getIcon } from "../utils/searchHistoryUtils";

export interface SearchHistoryFiltersProps {
  searchQuery: string;
  selectedModality: RAGModality | "all";
  sortBy: "timestamp" | "resultCount" | "topScore";
  sortOrder: "asc" | "desc";
  onSearchQueryChange: (value: string) => void;
  onModalityChange: (value: RAGModality | "all") => void;
  onSortByChange: (value: "timestamp" | "resultCount" | "topScore") => void;
  onSortOrderChange: (value: "asc" | "desc") => void;
}

export const SearchHistoryFilters: Component<SearchHistoryFiltersProps> = props => {
  return (
    <div class="history-filters">
      <TextField
        placeholder="Search history..."
        value={props.searchQuery}
        onChange={props.onSearchQueryChange}
        leftIcon={getIcon("search")}
        size="sm"
      />

      <Select
        value={props.selectedModality}
        onChange={props.onModalityChange}
        options={[
          { value: "all", label: "All Types" },
          { value: "docs", label: "Documents" },
          { value: "images", label: "Images" },
          { value: "code", label: "Code" },
          { value: "captions", label: "Captions" },
        ]}
        size="sm"
      />

      <Select
        value={props.sortBy}
        onChange={props.onSortByChange}
        options={[
          { value: "timestamp", label: "Date" },
          { value: "resultCount", label: "Results" },
          { value: "topScore", label: "Score" },
        ]}
        size="sm"
      />

      <Button
        variant="ghost"
        size="sm"
        onClick={() => props.onSortOrderChange(props.sortOrder === "asc" ? "desc" : "asc")}
        leftIcon={getIcon(props.sortOrder === "asc" ? "arrow-up" : "arrow-down")}
      >
        {props.sortOrder === "asc" ? "Ascending" : "Descending"}
      </Button>
    </div>
  );
};

/**
 * Search Section Component
 * Provides search and filtering controls
 */

import { Component, For } from "solid-js";
import { iconCategories } from "reynard-fluent-icons";

interface SearchSectionProps {
  searchQuery: () => string;
  setSearchQuery: (query: string) => void;
  selectedCategory: () => string;
  setSelectedCategory: (category: string) => void;
  resultCount: number;
}

export const SearchSection: Component<SearchSectionProps> = (props) => {
  const categoryOptions = [
    { value: "all", label: "All Categories" },
    ...Object.entries(iconCategories).map(([key, category]) => ({
      value: key,
      label: category.name
    }))
  ];

  return (
    <div class="search-section">
      <div class="search-controls">
        <input
          type="text"
          class="search-input"
          placeholder="Search icons by name, description, or keywords..."
          value={props.searchQuery()}
          onInput={(e) => props.setSearchQuery(e.currentTarget.value)}
        />
        <select
          class="category-filter"
          value={props.selectedCategory()}
          onChange={(e) => props.setSelectedCategory(e.currentTarget.value)}
          aria-label="Filter icons by category"
        >
          <For each={categoryOptions}>
            {(option: { value: string; label: string }) => (
              <option value={option.value}>{option.label}</option>
            )}
          </For>
        </select>
      </div>
      <div class="search-stats">
        Showing {props.resultCount} icon{props.resultCount !== 1 ? 's' : ''}
        {props.selectedCategory() !== "all" && (
          <span> in {iconCategories[props.selectedCategory() as keyof typeof iconCategories]?.name}</span>
        )}
        {props.searchQuery() && (
          <span> matching "{props.searchQuery()}"</span>
        )}
      </div>
    </div>
  );
};

/**
 * Search Form Component
 *
 * Handles the search input and button interface
 * for RAG queries.
 */

import { Component } from "solid-js";
import { Button, TextField, Icon } from "reynard-components";

export interface SearchFormProps {
  query: string;
  onQueryChange: (query: string) => void;
  onSearch: () => void;
  onKeyPress: (e: KeyboardEvent) => void;
  isSearching: boolean;
  error: string | null;
}

export const SearchForm: Component<SearchFormProps> = (props) => {
  return (
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
          leftIcon={<Icon name="search" size="sm" />}
          loading={props.isSearching}
        >
          Search
        </Button>
      </div>

      {props.error && <div class="error-message">{props.error}</div>}
    </div>
  );
};

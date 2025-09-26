/**
 * Search Form Component
 *
 * Handles the search input and button interface
 * for RAG queries.
 */
import { Button, TextField, Icon } from "reynard-primitives";
export const SearchForm = (props: any) => {
  return (
    <div class="search-form">
      <div class="search-input-group">
        <TextField
          value={props.query}
          onInput={e => props.onQueryChange(e.target.value)}
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

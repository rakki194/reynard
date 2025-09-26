/**
 * @fileoverview Search components for documentation sites
 */
import { createSignal, createEffect, For, Show } from "solid-js";
import { Button, TextField } from "reynard-primitives";
/**
 * Search input component
 */
export const DocsSearch = (props: any) => {
  const [query, setQuery] = createSignal("");
  const [isFocused, setIsFocused] = createSignal(false);
  const handleSearch = (value: any) => {
    setQuery(value);
    props.onSearch(value);
  };
  // const handleClear = () => {
  //   setQuery('');
  //   props.onClear?.();
  // };
  return (
    <div class={`docs-search ${props.className || ""} ${isFocused() ? "focused" : ""}`}>
      <div class="docs-search-input-wrapper">
        <TextField
          value={query()}
          onInput={e => handleSearch(e.currentTarget.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={props.placeholder || "Search documentation..."}
          leftIcon="🔍"
          rightIcon={query() ? "✕" : undefined}
          class="docs-search-input"
        />
      </div>
    </div>
  );
};
/**
 * Search results component
 */
export const DocsSearchResults = (props: any) => {
  return (
    <div class={`docs-search-results ${props.className || ""}`}>
      <Show when={props.results.length > 0}>
        <div class="docs-search-results-header">
          <h3>Search Results</h3>
          <span class="docs-search-count">
            {props.results.length} result{props.results.length !== 1 ? "s" : ""} for "{props.query}"
          </span>
        </div>

        <ul class="docs-search-results-list">
          <For each={props.results}>
            {result => (
              <li class="docs-search-result">
                <button class="docs-search-result-button" onClick={() => props.onResultClick(result)}>
                  <div class="docs-search-result-content">
                    <h4 class="docs-search-result-title">{result.title}</h4>
                    <Show when={result.description}>
                      <p class="docs-search-result-description">{result.description}</p>
                    </Show>
                    <div class="docs-search-result-meta">
                      <Show when={result.category}>
                        <span class="docs-search-result-category">{result.category}</span>
                      </Show>
                      <Show when={result.tags && result.tags.length > 0}>
                        <div class="docs-search-result-tags">
                          <For each={result.tags}>{tag => <span class="docs-search-result-tag">{tag}</span>}</For>
                        </div>
                      </Show>
                    </div>
                  </div>
                  <Show when={result.score}>
                    <div class="docs-search-result-score">{Math.round(result.score * 100)}%</div>
                  </Show>
                </button>
              </li>
            )}
          </For>
        </ul>
      </Show>

      <Show when={props.results.length === 0 && props.query}>
        <div class="docs-search-no-results">
          <h3>No results found</h3>
          <p>Try searching with different keywords or check your spelling.</p>
        </div>
      </Show>
    </div>
  );
};
/**
 * Search suggestions component
 */
export const DocsSearchSuggestions = (props: any) => {
  return (
    <div class={`docs-search-suggestions ${props.className || ""}`}>
      <Show when={props.suggestions.length > 0}>
        <h4>Popular searches</h4>
        <ul class="docs-search-suggestions-list">
          <For each={props.suggestions}>
            {suggestion => (
              <li class="docs-search-suggestion">
                <button class="docs-search-suggestion-button" onClick={() => props.onSuggestionClick(suggestion)}>
                  {suggestion}
                </button>
              </li>
            )}
          </For>
        </ul>
      </Show>
    </div>
  );
};
/**
 * Advanced search component
 */
export const DocsAdvancedSearch = (props: any) => {
  const [query, setQuery] = createSignal("");
  const [category, setCategory] = createSignal("");
  const [selectedTags, setSelectedTags] = createSignal<string[]>([]);
  const [dateStart, setDateStart] = createSignal("");
  const [dateEnd, setDateEnd] = createSignal("");
  const handleSearch = () => {
    props.onSearch({
      query: query(),
      category: category() || undefined,
      tags: selectedTags().length > 0 ? selectedTags() : undefined,
      dateRange:
        dateStart() && dateEnd()
          ? {
              start: dateStart(),
              end: dateEnd(),
            }
          : undefined,
    });
  };
  const toggleTag = (tag: any) => {
    const tags = selectedTags();
    if (tags.includes(tag)) {
      setSelectedTags(tags.filter(t => t !== tag));
    } else {
      setSelectedTags([...tags, tag]);
    }
  };
  return (
    <div class={`docs-advanced-search ${props.className || ""}`}>
      <div class="docs-advanced-search-form">
        <div class="docs-advanced-search-field">
          <TextField
            value={query()}
            onInput={e => setQuery(e.currentTarget.value)}
            placeholder="Search query..."
            label="Search"
          />
        </div>

        <Show when={props.categories && props.categories.length > 0}>
          <div class="docs-advanced-search-field">
            <label class="docs-advanced-search-label">Category</label>
            <select
              value={category()}
              onChange={e => setCategory(e.currentTarget.value)}
              class="docs-advanced-search-select"
            >
              <option value="">All categories</option>
              <For each={props.categories}>{cat => <option value={cat}>{cat}</option>}</For>
            </select>
          </div>
        </Show>

        <Show when={props.tags && props.tags.length > 0}>
          <div class="docs-advanced-search-field">
            <label class="docs-advanced-search-label">Tags</label>
            <div class="docs-advanced-search-tags">
              <For each={props.tags}>
                {tag => (
                  <button
                    class={`docs-advanced-search-tag ${selectedTags().includes(tag) ? "selected" : ""}`}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </button>
                )}
              </For>
            </div>
          </div>
        </Show>

        <div class="docs-advanced-search-field">
          <label class="docs-advanced-search-label">Date Range</label>
          <div class="docs-advanced-search-dates">
            <input
              type="date"
              value={dateStart()}
              onChange={e => setDateStart(e.currentTarget.value)}
              class="docs-advanced-search-date"
              placeholder="Start date"
            />
            <span class="docs-advanced-search-date-separator">to</span>
            <input
              type="date"
              value={dateEnd()}
              onChange={e => setDateEnd(e.currentTarget.value)}
              class="docs-advanced-search-date"
              placeholder="End date"
            />
          </div>
        </div>

        <div class="docs-advanced-search-actions">
          <Button variant="primary" onClick={handleSearch}>
            Search
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setQuery("");
              setCategory("");
              setSelectedTags([]);
              setDateStart("");
              setDateEnd("");
            }}
          >
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
};
/**
 * Search modal component
 */
export const DocsSearchModal = (props: any) => {
  const [query, setQuery] = createSignal("");
  createEffect(() => {
    if (props.isOpen) {
      // Focus search input when modal opens
      const input = document.querySelector(".docs-search-modal-input input") as HTMLInputElement;
      input?.focus();
    }
  });
  const handleSearch = (value: any) => {
    setQuery(value);
    props.onSearch(value);
  };
  const handleResultClick = (result: any) => {
    props.onResultClick(result);
    props.onClose();
  };
  return (
    <Show when={props.isOpen}>
      <div class={`docs-search-modal ${props.className || ""}`}>
        <div class="docs-search-modal-backdrop" onClick={props.onClose} />
        <div class="docs-search-modal-content">
          <div class="docs-search-modal-header">
            <DocsSearch onSearch={handleSearch} onClear={() => handleSearch("")} className="docs-search-modal-input" />
            <button class="docs-search-modal-close" onClick={props.onClose} aria-label="Close search">
              ✕
            </button>
          </div>

          <div class="docs-search-modal-body">
            <Show when={query()}>
              <DocsSearchResults results={props.results} query={query()} onResultClick={handleResultClick} />
            </Show>

            <Show when={!query() && props.suggestions}>
              <DocsSearchSuggestions suggestions={props.suggestions || []} onSuggestionClick={handleSearch} />
            </Show>
          </div>
        </div>
      </div>
    </Show>
  );
};

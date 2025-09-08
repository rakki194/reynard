/**
 * @fileoverview Search page
 */

import { Component, createSignal, onMount } from 'solid-js';
import { useSearchParams } from 'solid-router';
import { 
  DocsPage, 
  DocsSection, 
  DocsSearch,
  DocsSearchResults
} from 'reynard-docs-components';

/**
 * Search page component
 */
export const SearchPage: Component = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = createSignal(searchParams.q || '');
  const [searchResults, setSearchResults] = createSignal<any[]>([]);
  const [isSearching, setIsSearching] = createSignal(false);

  onMount(() => {
    if (searchQuery()) {
      performSearch(searchQuery());
    }
  });

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Simulate search API call
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const results = await response.json();
        setSearchResults(results);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setSearchParams({ q: query });
    performSearch(query);
  };

  const handleResultClick = (result: any) => {
    window.location.href = `/${result.slug}`;
  };

  return (
    <DocsPage>
      <DocsSection>
        <h1 class="docs-search-title">Search Documentation</h1>
        <p class="docs-search-description">
          Find what you're looking for in the Reynard documentation
        </p>
      </DocsSection>

      <DocsSection>
        <div class="docs-search-form">
          <DocsSearch
            onSearch={handleSearch}
            onClear={() => handleSearch('')}
            placeholder="Search documentation..."
            class="docs-search-input-large"
          />
        </div>
      </DocsSection>

      <DocsSection>
        {isSearching() && (
          <div class="docs-search-loading">
            <div class="docs-loading-spinner" />
            <p>Searching...</p>
          </div>
        )}

        {!isSearching() && searchQuery() && (
          <DocsSearchResults
            results={searchResults()}
            query={searchQuery()}
            onResultClick={handleResultClick}
          />
        )}

        {!isSearching() && !searchQuery() && (
          <div class="docs-search-empty">
            <h3>Start searching</h3>
            <p>Enter a search term above to find documentation, examples, and API references.</p>
          </div>
        )}
      </DocsSection>
    </DocsPage>
  );
};

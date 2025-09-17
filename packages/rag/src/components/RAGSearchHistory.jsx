/**
 * RAG Search History Component
 *
 * Component for displaying and managing search history
 * with filtering and quick re-search capabilities.
 */
import { Show } from "solid-js";
import { useSearchHistoryFilter } from "../composables/useSearchHistoryFilter";
import { SearchHistoryFilters } from "./SearchHistoryFilters";
import { SearchHistoryList } from "./SearchHistoryList";
import { SearchHistoryHeader } from "./SearchHistoryHeader";
import { SearchHistoryFooter } from "./SearchHistoryFooter";
const renderSearchHistory = (props) => {
    const { searchQuery, selectedModality, sortBy, sortOrder, setSearchQuery, setSelectedModality, setSortBy, setSortOrder, filteredHistory, } = useSearchHistoryFilter(() => props.searchHistory);
    return (<div class="rag-search-history">
      <SearchHistoryHeader onClearHistory={props.onClearHistory}/>

      <Show when={props.showFilters}>
        <SearchHistoryFilters searchQuery={searchQuery()} selectedModality={selectedModality()} sortBy={sortBy()} sortOrder={sortOrder()} onSearchQueryChange={setSearchQuery} onModalityChange={setSelectedModality} onSortByChange={setSortBy} onSortOrderChange={setSortOrder}/>
      </Show>

      <SearchHistoryList filteredHistory={filteredHistory()} searchQuery={searchQuery()} selectedModality={selectedModality()} onSearchAgain={props.onSearchAgain} onRemoveItem={props.onRemoveItem}/>

      <SearchHistoryFooter filteredCount={filteredHistory().length} totalCount={props.searchHistory.length} maxItems={props.maxItems}/>
    </div>);
};
export const RAGSearchHistory = (props) => {
    return renderSearchHistory(props);
};

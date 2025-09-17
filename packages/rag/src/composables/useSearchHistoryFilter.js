/**
 * Search History Filter Composable
 *
 * Provides filtering and sorting functionality for search history items.
 */
import { createSignal, createMemo } from "solid-js";
export function useSearchHistoryFilter(searchHistory) {
    const [searchQuery, setSearchQuery] = createSignal("");
    const [selectedModality, setSelectedModality] = createSignal("all");
    const [sortBy, setSortBy] = createSignal("timestamp");
    const [sortOrder, setSortOrder] = createSignal("desc");
    // Filter and sort search history
    const filteredHistory = createMemo(() => {
        let filtered = searchHistory().filter((item) => {
            const matchesQuery = !searchQuery() ||
                item.query.toLowerCase().includes(searchQuery().toLowerCase());
            const matchesModality = selectedModality() === "all" || item.modality === selectedModality();
            return matchesQuery && matchesModality;
        });
        // Sort the filtered results
        filtered.sort((a, b) => {
            let comparison = 0;
            switch (sortBy()) {
                case "timestamp":
                    comparison = a.timestamp.getTime() - b.timestamp.getTime();
                    break;
                case "resultCount":
                    comparison = a.resultCount - b.resultCount;
                    break;
                case "topScore":
                    comparison = a.topScore - b.topScore;
                    break;
            }
            return sortOrder() === "asc" ? comparison : -comparison;
        });
        return filtered;
    });
    return {
        // State
        searchQuery,
        selectedModality,
        sortBy,
        sortOrder,
        // Actions
        setSearchQuery,
        setSelectedModality,
        setSortBy,
        setSortOrder,
        // Computed
        filteredHistory,
    };
}

/**
 * RAG History Composable
 *
 * Focused state management for search history.
 * Extracted from useRAGSearchState.ts to follow the 140-line axiom.
 */
import { createSignal } from "solid-js";
import type { SearchHistoryItem, RAGModality } from "../types";

export interface RAGHistoryConfig {
  maxHistoryItems?: number;
}

export function useRAGHistory(config: RAGHistoryConfig = {}) {
  const maxItems = config.maxHistoryItems || 50;

  // History state
  const [searchHistory, setSearchHistory] = createSignal<SearchHistoryItem[]>([]);
  const [isLoading, setIsLoading] = createSignal(false);

  // History operations
  const addSearchToHistory = (query: string, modality: RAGModality, resultCount: number, topScore: number) => {
    const historyItem: SearchHistoryItem = {
      id: `search-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      query,
      modality,
      timestamp: new Date(),
      resultCount,
      topScore,
    };

    setSearchHistory(prev => {
      const newHistory = [historyItem, ...prev];
      // Keep only the most recent items
      return newHistory.slice(0, maxItems);
    });
  };

  const clearHistory = () => {
    setSearchHistory([]);
  };

  const removeHistoryItem = (itemId: string) => {
    setSearchHistory(prev => prev.filter(item => item.id !== itemId));
  };

  const getHistoryByModality = (modality: RAGModality) => {
    return searchHistory().filter(item => item.modality === modality);
  };

  const getRecentHistory = (limit: number = 10) => {
    return searchHistory().slice(0, limit);
  };

  const searchHistoryByQuery = (searchQuery: string) => {
    const query = searchQuery.toLowerCase();
    return searchHistory().filter(item => item.query.toLowerCase().includes(query));
  };

  // Load history from localStorage on initialization
  const loadHistoryFromStorage = () => {
    try {
      const stored = localStorage.getItem("rag-search-history");
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert timestamp strings back to Date objects
        const historyWithDates = parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }));
        setSearchHistory(historyWithDates);
      }
    } catch (err) {
      console.warn("Failed to load search history from storage:", err);
    }
  };

  // Save history to localStorage whenever it changes
  const saveHistoryToStorage = () => {
    try {
      localStorage.setItem("rag-search-history", JSON.stringify(searchHistory()));
    } catch (err) {
      console.warn("Failed to save search history to storage:", err);
    }
  };

  return {
    // State
    searchHistory,
    isLoading,

    // Actions
    addSearchToHistory,
    clearHistory,
    removeHistoryItem,
    getHistoryByModality,
    getRecentHistory,
    searchHistoryByQuery,
    loadHistoryFromStorage,
    saveHistoryToStorage,
  };
}

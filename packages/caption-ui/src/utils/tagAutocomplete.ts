/**
 * Tag Autocomplete Utilities
 *
 * Utilities for tag autocomplete functionality.
 */

import { createSignal, createEffect } from "solid-js";

export interface TagAutocompleteState {
  query: string;
  suggestions: string[];
  selectedIndex: number;
  isOpen: boolean;
}

export function useTagAutocomplete() {
  const [query, setQuery] = createSignal("");
  const [suggestions, setSuggestions] = createSignal<string[]>([]);
  const [selectedIndex, setSelectedIndex] = createSignal(-1);
  const [isOpen, setIsOpen] = createSignal(false);

  const selectNextSuggestion = () => {
    const currentIndex = selectedIndex();
    const maxIndex = suggestions().length - 1;

    if (currentIndex < maxIndex) {
      setSelectedIndex(currentIndex + 1);
    } else {
      setSelectedIndex(0); // Wrap to first
    }
  };

  const selectPreviousSuggestion = () => {
    const currentIndex = selectedIndex();
    const maxIndex = suggestions().length - 1;

    if (currentIndex > 0) {
      setSelectedIndex(currentIndex - 1);
    } else {
      setSelectedIndex(maxIndex); // Wrap to last
    }
  };

  const getSelectedSuggestion = (): string | undefined => {
    const index = selectedIndex();
    const suggestionsList = suggestions();

    if (index >= 0 && index < suggestionsList.length) {
      return suggestionsList[index];
    }

    return undefined;
  };

  const clearSuggestions = () => {
    setSuggestions([]);
    setSelectedIndex(-1);
    setIsOpen(false);
  };

  const updateSuggestions = (newSuggestions: string[]) => {
    setSuggestions(newSuggestions);
    setSelectedIndex(-1);
    setIsOpen(newSuggestions.length > 0);
  };

  // Reset selected index when suggestions change
  createEffect(() => {
    const suggestionsList = suggestions();
    const currentIndex = selectedIndex();

    if (currentIndex >= suggestionsList.length) {
      setSelectedIndex(-1);
    }
  });

  return {
    query,
    setQuery,
    suggestions,
    setSuggestions,
    selectedIndex,
    setSelectedIndex,
    isOpen,
    setIsOpen,
    selectNextSuggestion,
    selectPreviousSuggestion,
    getSelectedSuggestion,
    clearSuggestions,
    updateSuggestions,
  };
}

export function createTagAutocompleteManager(
  availableTags: string[] = [],
  maxSuggestions: number = 10,
) {
  const autocomplete = useTagAutocomplete();

  const updateQuery = (newQuery: string) => {
    autocomplete.setQuery(newQuery);

    if (newQuery.trim().length === 0) {
      autocomplete.clearSuggestions();
      return;
    }

    const filteredSuggestions = availableTags
      .filter(
        (tag) =>
          tag.toLowerCase().includes(newQuery.toLowerCase()) &&
          tag.toLowerCase() !== newQuery.toLowerCase(),
      )
      .sort((a, b) => {
        const aLower = a.toLowerCase();
        const bLower = b.toLowerCase();
        const queryLower = newQuery.toLowerCase();

        // Prioritize exact matches at the beginning
        const aStartsWith = aLower.startsWith(queryLower);
        const bStartsWith = bLower.startsWith(queryLower);

        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;

        // Then sort by length (shorter first)
        return a.length - b.length;
      })
      .slice(0, maxSuggestions);

    autocomplete.updateSuggestions(filteredSuggestions);
  };

  const selectSuggestion = (index: number) => {
    if (index >= 0 && index < autocomplete.suggestions().length) {
      const suggestion = autocomplete.suggestions()[index];
      autocomplete.setQuery(suggestion);
      autocomplete.clearSuggestions();
      return suggestion;
    }
    return null;
  };

  const selectCurrentSuggestion = () => {
    const selected = autocomplete.getSelectedSuggestion();
    if (selected) {
      autocomplete.setQuery(selected);
      autocomplete.clearSuggestions();
      return selected;
    }
    return null;
  };

  return {
    ...autocomplete,
    updateQuery,
    selectSuggestion,
    selectCurrentSuggestion,
    availableTags,
    maxSuggestions,
  };
}

/**
 * TagBubbleKeyboard Composable
 *
 * Handles keyboard shortcuts and navigation for the TagBubble component.
 */

import { Accessor, Setter, onCleanup, onMount } from "solid-js";

export interface TagBubbleKeyboardConfig {
  isEditing: Accessor<boolean>;
  isFocused: Accessor<boolean>;
  query: Accessor<string>;
  isOpen: Accessor<boolean>;
  selectedIndex: Accessor<number>;
  getSelectedSuggestion: () => string | undefined;
  selectNextSuggestion: () => void;
  selectPreviousSuggestion: () => void;
  setQuery: Setter<string>;
  finishEditing: () => void;
  cancelEditing: () => void;
  startEditing: () => void;
  handleRemove: () => void;
  props: { onRemove: () => void };
}

export function createTagBubbleKeyboard(config: TagBubbleKeyboardConfig) {
  const {
    isEditing,
    isFocused,
    query,
    isOpen,
    selectedIndex,
    getSelectedSuggestion,
    selectNextSuggestion,
    selectPreviousSuggestion,
    setQuery,
    finishEditing,
    cancelEditing,
    startEditing,
    handleRemove,
  } = config;

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isEditing()) return;

    switch (e.key) {
      case "Enter":
        e.preventDefault();
        if (isOpen() && selectedIndex() >= 0) {
          const suggestion = getSelectedSuggestion();
          if (suggestion) {
            setQuery(suggestion);
            finishEditing();
          }
        } else {
          finishEditing();
        }
        break;

      case "Escape":
        e.preventDefault();
        cancelEditing();
        break;

      case "ArrowDown":
        if (isOpen()) {
          e.preventDefault();
          selectNextSuggestion();
        }
        break;

      case "ArrowUp":
        if (isOpen()) {
          e.preventDefault();
          selectPreviousSuggestion();
        }
        break;

      case "Tab":
        e.preventDefault();
        if (isOpen() && selectedIndex() >= 0) {
          const suggestion = getSelectedSuggestion();
          if (suggestion) {
            setQuery(suggestion);
            finishEditing();
          }
        } else {
          finishEditing();
        }
        break;

      case "Backspace":
        if (query().length === 0) {
          e.preventDefault();
          handleRemove();
        }
        break;

      case "Delete":
        if (query().length === 0) {
          e.preventDefault();
          handleRemove();
        }
        break;
    }
  };

  // Global keyboard shortcuts
  onMount(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (isFocused() && !isEditing()) {
        switch (e.key) {
          case "Enter":
          case " ":
            e.preventDefault();
            startEditing();
            break;
          case "Delete":
          case "Backspace":
            if (e.ctrlKey || e.metaKey) {
              e.preventDefault();
              handleRemove();
            }
            break;
        }
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown);
    onCleanup(() => {
      document.removeEventListener("keydown", handleGlobalKeyDown);
    });
  });

  return {
    handleKeyDown,
  };
}

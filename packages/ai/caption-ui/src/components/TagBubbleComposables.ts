/**
 * TagBubbleComposables
 *
 * Creates and configures all composables for the TagBubble component.
 */

import { TagBubbleProps } from "reynard-caption-core";
import { Accessor, Setter } from "solid-js";
import { useTagAutocomplete } from "../utils/tagAutocomplete.js";
import { createTagBubbleColors } from "./TagBubbleColors";
import { createTagBubbleHandlers } from "./TagBubbleHandlers";
import { createTagBubbleKeyboard } from "./TagBubbleKeyboard";

export interface TagBubbleComposablesConfig {
  props: TagBubbleProps;
  isEditing: Accessor<boolean>;
  setIsEditing: Setter<boolean>;
  isHovered: Accessor<boolean>;
  setIsHovered: Setter<boolean>;
  isFocused: Accessor<boolean>;
  setIsFocused: Setter<boolean>;
  inputRef: HTMLInputElement | undefined;
  suggestionsList: HTMLDivElement | undefined;
  tagBubbleRef: HTMLDivElement | undefined;
}

export function createTagBubbleComposables(config: TagBubbleComposablesConfig) {
  const {
    props,
    isEditing,
    setIsEditing,
    isHovered,
    setIsHovered,
    isFocused,
    setIsFocused,
    inputRef,
    suggestionsList,
    tagBubbleRef,
  } = config;

  // Create colors composable
  createTagBubbleColors({
    tag: props.tag,
    intensity: props.intensity,
    variant: props.variant,
    theme: props.theme,
    tagBubbleRef,
  });

  // Tag autocomplete
  const autocomplete = useTagAutocomplete();

  // Create handlers composable
  const handlers = createTagBubbleHandlers({
    isEditing,
    setIsEditing,
    isHovered,
    setIsHovered,
    isFocused,
    setIsFocused,
    query: autocomplete.query,
    setQuery: autocomplete.setQuery,
    props,
    inputRef,
    suggestionsList,
    clearSuggestions: autocomplete.clearSuggestions,
    setIsOpen: autocomplete.setIsOpen,
    isOpen: autocomplete.isOpen,
    selectedIndex: autocomplete.selectedIndex,
    getSelectedSuggestion: autocomplete.getSelectedSuggestion,
    selectNextSuggestion: autocomplete.selectNextSuggestion,
    selectPreviousSuggestion: autocomplete.selectPreviousSuggestion,
  });

  // Create keyboard composable
  const keyboard = createTagBubbleKeyboard({
    isEditing,
    isFocused,
    query: autocomplete.query,
    isOpen: autocomplete.isOpen,
    selectedIndex: autocomplete.selectedIndex,
    getSelectedSuggestion: autocomplete.getSelectedSuggestion,
    selectNextSuggestion: autocomplete.selectNextSuggestion,
    selectPreviousSuggestion: autocomplete.selectPreviousSuggestion,
    setQuery: autocomplete.setQuery,
    finishEditing: handlers.finishEditing,
    cancelEditing: handlers.cancelEditing,
    startEditing: handlers.startEditing,
    handleRemove: handlers.handleRemove,
    props,
  });

  return {
    autocomplete,
    handlers,
    keyboard,
  };
}

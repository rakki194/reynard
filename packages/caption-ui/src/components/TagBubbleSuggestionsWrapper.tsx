/**
 * TagBubbleSuggestionsWrapper Component
 *
 * Wrapper component for conditional rendering of suggestions.
 */

import { Component, Show } from "solid-js";
import { TagBubbleSuggestions } from "./TagBubbleSuggestions";

export interface TagBubbleSuggestionsWrapperProps {
  isOpen: () => boolean;
  suggestions: () => string[];
  selectedIndex: () => number;
  onSuggestionClick: (suggestion: string) => void;
  suggestionsListRef: HTMLDivElement | undefined;
}

export const TagBubbleSuggestionsWrapper: Component<TagBubbleSuggestionsWrapperProps> = props => {
  return (
    <Show when={props.isOpen() && props.suggestions().length > 0}>
      <TagBubbleSuggestions
        suggestions={props.suggestions()}
        selectedIndex={props.selectedIndex()}
        onSuggestionClick={props.onSuggestionClick}
        suggestionsListRef={props.suggestionsListRef}
        isOpen={props.isOpen()}
      />
    </Show>
  );
};

/**
 * TagBubbleSuggestions Component
 *
 * Renders the autocomplete suggestions dropdown.
 */

import { Component, For } from "solid-js";

export interface TagBubbleSuggestionsProps {
  suggestions: string[];
  selectedIndex: number;
  onSuggestionClick: (suggestion: string) => void;
  suggestionsListRef: HTMLDivElement | undefined;
  isOpen: boolean;
}

export const TagBubbleSuggestions: Component<TagBubbleSuggestionsProps> = props => {
  return (
    <div ref={props.suggestionsListRef} class="tag-suggestions" role="listbox" aria-label="Tag suggestions">
      <For each={props.suggestions}>
        {(suggestion, index) => (
          <div
            class="tag-suggestion"
            classList={{
              "tag-suggestion--selected": index() === props.selectedIndex,
            }}
            onClick={() => props.onSuggestionClick(suggestion)}
            role="option"
            attr:aria-selected={index() === props.selectedIndex ? "true" : "false"}
          >
            {suggestion}
          </div>
        )}
      </For>
    </div>
  );
};

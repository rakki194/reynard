/**
 * TagBubbleSuggestionsWrapper Component
 *
 * Wrapper component for conditional rendering of suggestions.
 */
import { Show } from "solid-js";
import { TagBubbleSuggestions } from "./TagBubbleSuggestions";
export const TagBubbleSuggestionsWrapper = props => {
    return (<Show when={props.isOpen() && props.suggestions().length > 0}>
      <TagBubbleSuggestions suggestions={props.suggestions()} selectedIndex={props.selectedIndex()} onSuggestionClick={props.onSuggestionClick} suggestionsListRef={props.suggestionsListRef} isOpen={props.isOpen()}/>
    </Show>);
};

/**
 * TagBubbleView Component
 *
 * Renders the JSX structure for the TagBubble component.
 */
import { TagBubbleContainer } from "./TagBubbleContainer";
import { TagBubbleContentSection } from "./TagBubbleContentSection";
import { TagBubbleSuggestionsWrapper } from "./TagBubbleSuggestionsWrapper";
import { extractContainerHandlers } from "./tag-bubble-helpers";
export const TagBubbleView = viewProps => {
    return (<TagBubbleContainer props={viewProps.props} isEditing={viewProps.isEditing} isHovered={viewProps.isHovered} isFocused={viewProps.isFocused} tagBubbleRef={viewProps.tagBubbleRef} handlers={extractContainerHandlers(viewProps.handlers)}>
      <TagBubbleContentSection isEditing={viewProps.isEditing} tag={viewProps.props.tag} query={viewProps.autocomplete.query} onInput={viewProps.handlers.handleInput} onKeyDown={viewProps.handlers.handleKeyDown} onBlur={viewProps.handlers.handleBlur} onFocus={viewProps.handlers.handleFocus} onRemove={viewProps.handlers.handleRemove} removable={viewProps.props.removable} inputRef={viewProps.inputRef}/>

      <TagBubbleSuggestionsWrapper isOpen={viewProps.autocomplete.isOpen} suggestions={viewProps.autocomplete.suggestions} selectedIndex={viewProps.autocomplete.selectedIndex} onSuggestionClick={viewProps.handlers.handleSuggestionClick} suggestionsListRef={viewProps.suggestionsList}/>
    </TagBubbleContainer>);
};

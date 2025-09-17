/**
 * TagBubbleHandlers Composable
 *
 * Handles all event handlers for the TagBubble component.
 */
export function createTagBubbleHandlers(config) {
    const { isEditing, setIsEditing, isHovered, setIsHovered, isFocused, setIsFocused, query, setQuery, props, inputRef, suggestionsList, clearSuggestions, setIsOpen, isOpen, selectedIndex, getSelectedSuggestion, selectNextSuggestion, selectPreviousSuggestion, } = config;
    const closeAllSuggestions = () => {
        clearSuggestions();
        setIsOpen(false);
        if (suggestionsList) {
            suggestionsList.classList.remove("visible");
        }
    };
    const startEditing = () => {
        if (props.editable === false)
            return;
        setIsEditing(true);
        setQuery(props.tag);
        // Focus input after DOM update
        setTimeout(() => {
            if (inputRef) {
                inputRef.focus();
                inputRef.select();
            }
        }, 0);
    };
    const finishEditing = () => {
        if (!isEditing())
            return;
        const newTag = query().trim();
        if (newTag && newTag !== props.tag) {
            props.onEdit(newTag);
        }
        setIsEditing(false);
        closeAllSuggestions();
    };
    const cancelEditing = () => {
        setIsEditing(false);
        setQuery(props.tag);
        closeAllSuggestions();
    };
    const handleInput = (e) => {
        const target = e.target;
        setQuery(target.value);
    };
    const handleBlur = () => {
        setIsFocused(false);
        // Delay to allow click events on suggestions
        setTimeout(() => {
            if (!isHovered()) {
                finishEditing();
            }
        }, 150);
    };
    const handleFocus = () => {
        setIsFocused(true);
    };
    const handleMouseEnter = () => {
        setIsHovered(true);
    };
    const handleMouseLeave = () => {
        setIsHovered(false);
    };
    const handleRemove = () => {
        if (props.removable !== false) {
            props.onRemove();
        }
    };
    const handleDoubleClick = () => {
        startEditing();
    };
    const handleSuggestionClick = (suggestion) => {
        setQuery(suggestion);
        finishEditing();
    };
    return {
        startEditing,
        finishEditing,
        cancelEditing,
        handleInput,
        handleBlur,
        handleFocus,
        handleMouseEnter,
        handleMouseLeave,
        handleRemove,
        handleDoubleClick,
        handleSuggestionClick,
        closeAllSuggestions,
    };
}

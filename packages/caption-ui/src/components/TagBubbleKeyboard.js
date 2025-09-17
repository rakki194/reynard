/**
 * TagBubbleKeyboard Composable
 *
 * Handles keyboard shortcuts and navigation for the TagBubble component.
 */
import { onCleanup, onMount } from "solid-js";
export function createTagBubbleKeyboard(config) {
    const { isEditing, isFocused, query, isOpen, selectedIndex, getSelectedSuggestion, selectNextSuggestion, selectPreviousSuggestion, setQuery, finishEditing, cancelEditing, startEditing, handleRemove, } = config;
    const handleKeyDown = (e) => {
        if (!isEditing())
            return;
        switch (e.key) {
            case "Enter":
                e.preventDefault();
                if (isOpen() && selectedIndex() >= 0) {
                    const suggestion = getSelectedSuggestion();
                    if (suggestion) {
                        setQuery(suggestion);
                        finishEditing();
                    }
                }
                else {
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
                }
                else {
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
        const handleGlobalKeyDown = (e) => {
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

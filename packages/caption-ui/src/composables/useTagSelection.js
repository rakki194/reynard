/**
 * Tag Selection Composable
 *
 * Handles tag selection state management with keyboard shortcuts.
 * Delegates selection logic to utility functions.
 */
import { createMemo, createSignal } from "solid-js";
import { getSelectionStrategy, selectRange, singleSelection, toggleSelection } from "./tag-selection-utils";
export function useTagSelection(tags, showSelection) {
    const [selectedTags, setSelectedTags] = createSignal(new Set());
    const hasSelection = createMemo(() => selectedTags().size > 0);
    const selectedCount = createMemo(() => selectedTags().size);
    const selectTag = (tagId, event) => {
        if (!showSelection())
            return;
        const strategy = getSelectionStrategy(event);
        const tagIds = tags().map(t => t.id);
        setSelectedTags(prev => {
            switch (strategy) {
                case "range":
                    return selectRange(prev, tagIds, tagId);
                case "toggle":
                    return toggleSelection(prev, tagId);
                case "single":
                default:
                    return singleSelection(tagId);
            }
        });
    };
    const clearSelection = () => setSelectedTags(new Set());
    const selectAll = (tagIds) => setSelectedTags(new Set(tagIds));
    const removeFromSelection = (tagId) => {
        setSelectedTags(prev => {
            const newSet = new Set(prev);
            newSet.delete(tagId);
            return newSet;
        });
    };
    return [
        {
            selectedTags: selectedTags(),
            hasSelection: hasSelection(),
            selectedCount: selectedCount(),
        },
        {
            selectTag,
            clearSelection,
            selectAll,
            removeFromSelection,
        },
    ];
}

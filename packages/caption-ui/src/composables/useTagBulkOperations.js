/**
 * Tag Bulk Operations Composable
 *
 * Handles bulk operations on selected tags including deletion and editing.
 * Provides operations for managing multiple tags at once.
 */
import { createMemo } from "solid-js";
export function useTagBulkOperations(tags, selectedTags, onTagsChange, onTagRemove, onTagEdit, onClearSelection) {
    const selectedCount = createMemo(() => selectedTags().size);
    const hasSelection = createMemo(() => selectedTags().size > 0);
    const handleBulkDelete = () => {
        const selectedIds = Array.from(selectedTags());
        const updatedTags = tags().filter(tag => !selectedIds.includes(tag.id));
        onTagsChange(updatedTags);
        selectedIds.forEach(id => onTagRemove?.(id));
        onClearSelection?.();
    };
    const handleBulkEdit = (newText) => {
        const selectedIds = Array.from(selectedTags());
        const updatedTags = tags().map(tag => (selectedIds.includes(tag.id) ? { ...tag, text: newText } : tag));
        onTagsChange(updatedTags);
        selectedIds.forEach(id => onTagEdit?.(id, newText));
    };
    return [
        {
            selectedCount: selectedCount(),
            hasSelection: hasSelection(),
        },
        {
            handleBulkDelete,
            handleBulkEdit,
        },
    ];
}

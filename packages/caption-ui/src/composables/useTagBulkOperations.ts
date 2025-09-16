/**
 * Tag Bulk Operations Composable
 *
 * Handles bulk operations on selected tags including deletion and editing.
 * Provides operations for managing multiple tags at once.
 */

import { createMemo } from "solid-js";

export interface TagBulkOperationsState {
  selectedCount: number;
  hasSelection: boolean;
}

export interface TagBulkOperationsActions {
  handleBulkDelete: () => void;
  handleBulkEdit: (newText: string) => void;
}

export function useTagBulkOperations(
  tags: () => Array<{ id: string; text: string }>,
  selectedTags: () => Set<string>,
  onTagsChange: (tags: Array<{ id: string; text: string }>) => void,
  onTagRemove?: (tagId: string) => void,
  onTagEdit?: (tagId: string, newText: string) => void,
  onClearSelection?: () => void
): [TagBulkOperationsState, TagBulkOperationsActions] {
  const selectedCount = createMemo(() => selectedTags().size);
  const hasSelection = createMemo(() => selectedTags().size > 0);

  const handleBulkDelete = () => {
    const selectedIds = Array.from(selectedTags());
    const updatedTags = tags().filter(tag => !selectedIds.includes(tag.id));
    onTagsChange(updatedTags);

    selectedIds.forEach(id => onTagRemove?.(id));
    onClearSelection?.();
  };

  const handleBulkEdit = (newText: string) => {
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

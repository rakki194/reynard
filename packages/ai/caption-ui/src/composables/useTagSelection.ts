/**
 * Tag Selection Composable
 *
 * Handles tag selection state management with keyboard shortcuts.
 * Delegates selection logic to utility functions.
 */

import { createMemo, createSignal } from "solid-js";
import { getSelectionStrategy, selectRange, singleSelection, toggleSelection } from "./tag-selection-utils";

export interface TagSelectionState {
  selectedTags: Set<string>;
  hasSelection: boolean;
  selectedCount: number;
}

export interface TagSelectionActions {
  selectTag: (tagId: string, event?: MouseEvent) => void;
  clearSelection: () => void;
  selectAll: (tagIds: string[]) => void;
  removeFromSelection: (tagId: string) => void;
}

export function useTagSelection(
  tags: () => Array<{ id: string }>,
  showSelection: () => boolean
): [TagSelectionState, TagSelectionActions] {
  const [selectedTags, setSelectedTags] = createSignal<Set<string>>(new Set());

  const hasSelection = createMemo(() => selectedTags().size > 0);
  const selectedCount = createMemo(() => selectedTags().size);

  const selectTag = (tagId: string, event?: MouseEvent) => {
    if (!showSelection()) return;

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

  const clearSelection = () => setSelectedTags(new Set<string>());
  const selectAll = (tagIds: string[]) => setSelectedTags(new Set<string>(tagIds));
  const removeFromSelection = (tagId: string) => {
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

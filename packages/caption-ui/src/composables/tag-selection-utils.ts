/**
 * Tag Selection Utilities
 *
 * Pure functions for handling tag selection logic including
 * single, multi, and range selection operations.
 */

export interface SelectionEvent {
  shiftKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
}

/**
 * Handles range selection between two tag indices
 */
export function selectRange(currentSelection: Set<string>, tagIds: string[], targetTagId: string): Set<string> {
  const newSet = new Set(currentSelection);
  const startIndex = tagIds.findIndex(id => currentSelection.has(id));
  const endIndex = tagIds.findIndex(id => id === targetTagId);

  if (startIndex !== -1 && endIndex !== -1) {
    const start = Math.min(startIndex, endIndex);
    const end = Math.max(startIndex, endIndex);

    for (let i = start; i <= end; i++) {
      newSet.add(tagIds[i]);
    }
  }

  return newSet;
}

/**
 * Handles toggle selection (Ctrl/Cmd + click)
 */
export function toggleSelection(currentSelection: Set<string>, tagId: string): Set<string> {
  const newSet = new Set(currentSelection);

  if (newSet.has(tagId)) {
    newSet.delete(tagId);
  } else {
    newSet.add(tagId);
  }

  return newSet;
}

/**
 * Handles single selection (regular click)
 */
export function singleSelection(tagId: string): Set<string> {
  return new Set<string>([tagId]);
}

/**
 * Determines the appropriate selection strategy based on event modifiers
 */
export function getSelectionStrategy(event?: SelectionEvent) {
  if (event?.shiftKey) return "range";
  if (event?.ctrlKey || event?.metaKey) return "toggle";
  return "single";
}

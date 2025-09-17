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
export declare function selectRange(currentSelection: Set<string>, tagIds: string[], targetTagId: string): Set<string>;
/**
 * Handles toggle selection (Ctrl/Cmd + click)
 */
export declare function toggleSelection(currentSelection: Set<string>, tagId: string): Set<string>;
/**
 * Handles single selection (regular click)
 */
export declare function singleSelection(tagId: string): Set<string>;
/**
 * Determines the appropriate selection strategy based on event modifiers
 */
export declare function getSelectionStrategy(event?: SelectionEvent): "range" | "toggle" | "single";

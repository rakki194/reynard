/**
 * Tag Selection Composable
 *
 * Handles tag selection state management with keyboard shortcuts.
 * Delegates selection logic to utility functions.
 */
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
export declare function useTagSelection(tags: () => Array<{
    id: string;
}>, showSelection: () => boolean): [TagSelectionState, TagSelectionActions];

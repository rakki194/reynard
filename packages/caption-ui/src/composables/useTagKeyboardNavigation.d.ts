/**
 * Tag Keyboard Navigation Composable
 *
 * Handles keyboard navigation between tags and keyboard shortcuts.
 * Provides focus management and navigation actions.
 */
export interface TagNavigationState {
    focusedTagId: string | null;
}
export interface TagNavigationActions {
    setFocusedTagId: (id: string | null) => void;
    navigateToTag: (direction: "left" | "right" | "start" | "end") => void;
    handleKeyDown: (e: KeyboardEvent) => void;
}
export declare function useTagKeyboardNavigation(tags: () => Array<{
    id: string;
}>, hasSelection: () => boolean, onBulkDelete: () => void, onTagRemove: (tagId: string) => void, onSelectAll: () => void, onClearSelection: () => void): [TagNavigationState, TagNavigationActions];

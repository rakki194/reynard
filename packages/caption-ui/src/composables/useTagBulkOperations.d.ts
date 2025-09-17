/**
 * Tag Bulk Operations Composable
 *
 * Handles bulk operations on selected tags including deletion and editing.
 * Provides operations for managing multiple tags at once.
 */
export interface TagBulkOperationsState {
    selectedCount: number;
    hasSelection: boolean;
}
export interface TagBulkOperationsActions {
    handleBulkDelete: () => void;
    handleBulkEdit: (newText: string) => void;
}
export declare function useTagBulkOperations(tags: () => Array<{
    id: string;
    text: string;
}>, selectedTags: () => Set<string>, onTagsChange: (tags: Array<{
    id: string;
    text: string;
}>) => void, onTagRemove?: (tagId: string) => void, onTagEdit?: (tagId: string, newText: string) => void, onClearSelection?: () => void): [TagBulkOperationsState, TagBulkOperationsActions];

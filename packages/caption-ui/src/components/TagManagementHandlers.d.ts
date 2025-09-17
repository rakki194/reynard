/**
 * Tag Management Handlers
 *
 * Handles tag editing and removal operations.
 * Separated to reduce main component complexity.
 */
export interface TagManagementHandlersProps {
    tags: Array<{
        id: string;
        text: string;
    }>;
    onTagsChange: (tags: Array<{
        id: string;
        text: string;
    }>) => void;
    onTagEdit?: (tagId: string, newText: string) => void;
    onTagRemove?: (tagId: string) => void;
    onRemoveFromSelection: (tagId: string) => void;
}
export declare function createTagHandlers(props: TagManagementHandlersProps): {
    handleTagEdit: (tagId: string, newText: string) => void;
    handleTagRemove: (tagId: string) => void;
};

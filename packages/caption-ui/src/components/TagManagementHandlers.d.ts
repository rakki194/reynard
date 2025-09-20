/**
 * Tag Management Handlers
 *
 * Handles tag editing and removal operations.
 * Separated to reduce main component complexity.
 */
export declare function createTagHandlers(props: any): {
    handleTagEdit: (tagId: any, newText: any) => void;
    handleTagRemove: (tagId: any) => void;
};

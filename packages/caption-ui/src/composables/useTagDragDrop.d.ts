/**
 * Tag Drag and Drop Composable
 *
 * Handles drag and drop functionality for tag reordering.
 * Provides drag state management and drop handling.
 */
export interface TagDragDropState {
    isDragging: boolean;
    dragOverTagId: string | null;
}
export interface TagDragDropActions {
    handleDragStart: (e: DragEvent, tagId: string) => void;
    handleDragOver: (e: DragEvent, tagId: string) => void;
    handleDragLeave: () => void;
    handleDrop: (e: DragEvent, targetTagId: string) => void;
}
export declare function useTagDragDrop(tags: () => Array<{
    id: string;
}>, enableDragDrop: () => boolean, onTagsReorder: (tagIds: string[]) => void): [TagDragDropState, TagDragDropActions];

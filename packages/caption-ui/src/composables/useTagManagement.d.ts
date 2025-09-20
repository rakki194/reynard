/**
 * Tag Management Composable
 *
 * Main composable that orchestrates all tag management functionality.
 * Combines selection, navigation, drag-drop, and bulk operations.
 */
import { createTagHandlers } from "../components/TagManagementHandlers";
import { useTagBulkOperations } from "./useTagBulkOperations";
import { useTagDragDrop } from "./useTagDragDrop";
import { useTagKeyboardNavigation } from "./useTagKeyboardNavigation";
import { useTagSelection } from "./useTagSelection";
export interface TagManagementState {
    selectionState: ReturnType<typeof useTagSelection>[0];
    bulkState: ReturnType<typeof useTagBulkOperations>[0];
    navigationState: ReturnType<typeof useTagKeyboardNavigation>[0];
    dragDropState: ReturnType<typeof useTagDragDrop>[0];
    tagHandlers: ReturnType<typeof createTagHandlers>;
}
export interface TagManagementActions {
    selectionActions: ReturnType<typeof useTagSelection>[1];
    bulkActions: ReturnType<typeof useTagBulkOperations>[1];
    navigationActions: ReturnType<typeof useTagKeyboardNavigation>[1];
    dragDropActions: ReturnType<typeof useTagDragDrop>[1];
}
export declare function useTagManagement(props: {
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
    onTagsReorder?: (tagIds: string[]) => void;
    showSelection?: boolean;
    enableDragDrop?: boolean;
}): readonly [{
    readonly selectionState: import("./useTagSelection").TagSelectionState;
    readonly bulkState: import("./useTagBulkOperations").TagBulkOperationsState;
    readonly navigationState: import("./useTagKeyboardNavigation").TagNavigationState;
    readonly dragDropState: import("./useTagDragDrop").TagDragDropState;
    readonly tagHandlers: {
        handleTagEdit: (tagId: any, newText: any) => void;
        handleTagRemove: (tagId: any) => void;
    };
}, {
    readonly selectionActions: import("./useTagSelection").TagSelectionActions;
    readonly bulkActions: import("./useTagBulkOperations").TagBulkOperationsActions;
    readonly navigationActions: import("./useTagKeyboardNavigation").TagNavigationActions;
    readonly dragDropActions: import("./useTagDragDrop").TagDragDropActions;
}];

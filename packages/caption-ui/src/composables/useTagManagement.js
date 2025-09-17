/**
 * Tag Management Composable
 *
 * Main composable that orchestrates all tag management functionality.
 * Combines selection, navigation, drag-drop, and bulk operations.
 */
import { createMemo } from "solid-js";
import { createTagHandlers } from "../components/TagManagementHandlers";
import { useTagBulkOperations } from "./useTagBulkOperations";
import { useTagDragDrop } from "./useTagDragDrop";
import { useTagKeyboardNavigation } from "./useTagKeyboardNavigation";
import { useTagSelection } from "./useTagSelection";
export function useTagManagement(props) {
    const tags = createMemo(() => props.tags);
    const showSelection = createMemo(() => props.showSelection ?? false);
    const enableDragDrop = createMemo(() => props.enableDragDrop ?? false);
    const [selectionState, selectionActions] = useTagSelection(tags, showSelection);
    const tagHandlers = createTagHandlers({
        tags: props.tags,
        onTagsChange: props.onTagsChange,
        onTagEdit: props.onTagEdit,
        onTagRemove: props.onTagRemove,
        onRemoveFromSelection: selectionActions.removeFromSelection,
    });
    const [bulkState, bulkActions] = useTagBulkOperations(tags, () => selectionState.selectedTags, props.onTagsChange, props.onTagRemove, props.onTagEdit, selectionActions.clearSelection);
    const [navigationState, navigationActions] = useTagKeyboardNavigation(tags, () => bulkState.hasSelection, bulkActions.handleBulkDelete, tagHandlers.handleTagRemove, () => selectionActions.selectAll(props.tags.map(tag => tag.id)), selectionActions.clearSelection);
    const [dragDropState, dragDropActions] = useTagDragDrop(tags, enableDragDrop, props.onTagsReorder ?? (() => { }));
    return [
        {
            selectionState,
            bulkState,
            navigationState,
            dragDropState,
            tagHandlers,
        },
        {
            selectionActions,
            bulkActions,
            navigationActions,
            dragDropActions,
        },
    ];
}

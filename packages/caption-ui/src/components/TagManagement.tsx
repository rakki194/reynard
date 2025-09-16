/**
 * Tag Management Component
 *
 * Advanced tag management system with keyboard navigation, selection,
 * and bulk operations. Built for the Reynard caption system.
 *
 * Features:
 * - Keyboard navigation between tags
 * - Multi-selection with Shift+Click
 * - Bulk operations (delete, edit, move)
 * - Tag reordering with drag and drop
 * - Integration with existing TagBubble components
 */

import { Component, createMemo } from "solid-js";
import { useTagManagement } from "../composables/useTagManagement";
import { TagManagementContainer } from "./TagManagementContainer";
import { TagManagementControls } from "./TagManagementControls";
import { TagManagementShortcuts } from "./TagManagementShortcuts";

export interface Tag {
  id: string;
  text: string;
  metadata?: Record<string, unknown>;
}

export interface TagManagementProps {
  /** Array of tags to manage */
  tags: Tag[];
  /** Callback when tags change */
  onTagsChange: (tags: Tag[]) => void;
  /** Callback when a tag is edited */
  onTagEdit?: (tagId: string, newText: string) => void;
  /** Callback when a tag is removed */
  onTagRemove?: (tagId: string) => void;
  /** Callback when tags are reordered */
  onTagsReorder?: (tagIds: string[]) => void;
  /** Whether tags are editable */
  editable?: boolean;
  /** Whether tags are removable */
  removable?: boolean;
  /** Whether to show selection controls */
  showSelection?: boolean;
  /** Whether to enable drag and drop reordering */
  enableDragDrop?: boolean;
  /** Additional CSS class */
  className?: string;
}

export const TagManagement: Component<TagManagementProps> = props => {
  const showSelection = createMemo(() => props.showSelection ?? false);
  const enableDragDrop = createMemo(() => props.enableDragDrop ?? false);

  const [state, actions] = useTagManagement({
    tags: props.tags,
    onTagsChange: props.onTagsChange,
    onTagEdit: props.onTagEdit,
    onTagRemove: props.onTagRemove,
    onTagsReorder: props.onTagsReorder,
    showSelection: showSelection(),
    enableDragDrop: enableDragDrop(),
  });

  return (
    <div class={`tag-management ${props.className || ""}`}>
      <TagManagementControls
        showSelection={showSelection()}
        hasSelection={state.bulkState.hasSelection}
        selectedCount={state.bulkState.selectedCount}
        onBulkDelete={actions.bulkActions.handleBulkDelete}
        onClearSelection={actions.selectionActions.clearSelection}
      />

      <TagManagementContainer
        tags={props.tags}
        selectedTags={state.selectionState.selectedTags}
        focusedTagId={state.navigationState.focusedTagId}
        isDragging={state.dragDropState.isDragging}
        dragOverTagId={state.dragDropState.dragOverTagId}
        enableDragDrop={enableDragDrop()}
        editable={props.editable}
        removable={props.removable}
        onTagSelect={actions.selectionActions.selectTag}
        onTagEdit={state.tagHandlers.handleTagEdit}
        onTagRemove={state.tagHandlers.handleTagRemove}
        onTagNavigate={actions.navigationActions.navigateToTag}
        onSetFocusedTag={actions.navigationActions.setFocusedTagId}
        onDragStart={actions.dragDropActions.handleDragStart}
        onDragOver={actions.dragDropActions.handleDragOver}
        onDragLeave={actions.dragDropActions.handleDragLeave}
        onDrop={actions.dragDropActions.handleDrop}
      />

      <TagManagementShortcuts showSelection={showSelection()} />
    </div>
  );
};

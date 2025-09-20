/**
 * Tag Drag and Drop Composable
 *
 * Handles drag and drop functionality for tag reordering.
 * Provides drag state management and drop handling.
 */

import { createSignal } from "solid-js";

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

export function useTagDragDrop(
  tags: () => Array<{ id: string }>,
  enableDragDrop: () => boolean,
  onTagsReorder: (tagIds: string[]) => void
): [TagDragDropState, TagDragDropActions] {
  const [isDragging, setIsDragging] = createSignal(false);
  const [dragOverTagId, setDragOverTagId] = createSignal<string | null>(null);

  const handleDragStart = (e: DragEvent, tagId: string) => {
    if (!enableDragDrop()) return;

    e.dataTransfer?.setData("text/plain", tagId);
    setIsDragging(true);
  };

  const handleDragOver = (e: DragEvent, tagId: string) => {
    if (!enableDragDrop()) return;

    e.preventDefault();
    setDragOverTagId(tagId);
  };

  const handleDragLeave = () => {
    setDragOverTagId(null);
  };

  const handleDrop = (e: DragEvent, targetTagId: string) => {
    if (!enableDragDrop()) return;

    e.preventDefault();
    const draggedTagId = e.dataTransfer?.getData("text/plain");

    if (draggedTagId && draggedTagId !== targetTagId) {
      const tagIds = tags().map(t => t.id);
      const draggedIndex = tagIds.findIndex(id => id === draggedTagId);
      const targetIndex = tagIds.findIndex(id => id === targetTagId);

      if (draggedIndex !== -1 && targetIndex !== -1) {
        const newTagIds = [...tagIds];
        newTagIds.splice(draggedIndex, 1);
        newTagIds.splice(targetIndex, 0, draggedTagId);

        onTagsReorder(newTagIds);
      }
    }

    setIsDragging(false);
    setDragOverTagId(null);
  };

  return [
    {
      isDragging: isDragging(),
      dragOverTagId: dragOverTagId(),
    },
    {
      handleDragStart,
      handleDragOver,
      handleDragLeave,
      handleDrop,
    },
  ];
}

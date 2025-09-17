/**
 * Tag Drag and Drop Composable
 *
 * Handles drag and drop functionality for tag reordering.
 * Provides drag state management and drop handling.
 */
import { createSignal } from "solid-js";
export function useTagDragDrop(tags, enableDragDrop, onTagsReorder) {
    const [isDragging, setIsDragging] = createSignal(false);
    const [dragOverTagId, setDragOverTagId] = createSignal(null);
    const handleDragStart = (e, tagId) => {
        if (!enableDragDrop())
            return;
        e.dataTransfer?.setData("text/plain", tagId);
        setIsDragging(true);
    };
    const handleDragOver = (e, tagId) => {
        if (!enableDragDrop())
            return;
        e.preventDefault();
        setDragOverTagId(tagId);
    };
    const handleDragLeave = () => {
        setDragOverTagId(null);
    };
    const handleDrop = (e, targetTagId) => {
        if (!enableDragDrop())
            return;
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

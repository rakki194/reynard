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
import { createSignal, createMemo, onMount, onCleanup, For, Show } from "solid-js";
import { TagBubble } from "./TagBubble";
export const TagManagement = props => {
  const [selectedTags, setSelectedTags] = createSignal(new Set());
  const [focusedTagId, setFocusedTagId] = createSignal(null);
  const [isDragging, setIsDragging] = createSignal(false);
  const [dragOverTagId, setDragOverTagId] = createSignal(null);
  // Computed values
  const hasSelection = createMemo(() => selectedTags().size > 0);
  const selectedCount = createMemo(() => selectedTags().size);
  // Handle tag editing
  const handleTagEdit = (tagId, newText) => {
    const updatedTags = props.tags.map(tag => (tag.id === tagId ? { ...tag, text: newText } : tag));
    props.onTagsChange(updatedTags);
    props.onTagEdit?.(tagId, newText);
  };
  // Handle tag removal
  const handleTagRemove = tagId => {
    const updatedTags = props.tags.filter(tag => tag.id !== tagId);
    props.onTagsChange(updatedTags);
    props.onTagRemove?.(tagId);
    // Remove from selection if it was selected
    setSelectedTags(prev => {
      const newSet = new Set(prev);
      newSet.delete(tagId);
      return newSet;
    });
  };
  // Handle tag selection
  const handleTagSelect = (tagId, event) => {
    if (!props.showSelection) return;
    setSelectedTags(prev => {
      const newSet = new Set(prev);
      if (event?.shiftKey && prev.size > 0) {
        // Range selection
        const tagIds = props.tags.map(t => t.id);
        const startIndex = tagIds.findIndex(id => prev.has(id));
        const endIndex = tagIds.findIndex(id => id === tagId);
        if (startIndex !== -1 && endIndex !== -1) {
          const start = Math.min(startIndex, endIndex);
          const end = Math.max(startIndex, endIndex);
          for (let i = start; i <= end; i++) {
            newSet.add(tagIds[i]);
          }
        }
      } else if (event?.ctrlKey || event?.metaKey) {
        // Toggle selection
        if (newSet.has(tagId)) {
          newSet.delete(tagId);
        } else {
          newSet.add(tagId);
        }
      } else {
        // Single selection
        newSet.clear();
        newSet.add(tagId);
      }
      return newSet;
    });
  };
  // Handle keyboard navigation
  const handleKeyDown = e => {
    if (!focusedTagId()) return;
    const currentIndex = props.tags.findIndex(tag => tag.id === focusedTagId());
    if (currentIndex === -1) return;
    switch (e.key) {
      case "ArrowLeft":
        e.preventDefault();
        if (currentIndex > 0) {
          setFocusedTagId(props.tags[currentIndex - 1].id);
        }
        break;
      case "ArrowRight":
        e.preventDefault();
        if (currentIndex < props.tags.length - 1) {
          setFocusedTagId(props.tags[currentIndex + 1].id);
        }
        break;
      case "Home":
        e.preventDefault();
        setFocusedTagId(props.tags[0]?.id || null);
        break;
      case "End":
        e.preventDefault();
        setFocusedTagId(props.tags[props.tags.length - 1]?.id || null);
        break;
      case "Delete":
        if (hasSelection()) {
          e.preventDefault();
          handleBulkDelete();
        } else if (focusedTagId()) {
          e.preventDefault();
          handleTagRemove(focusedTagId());
        }
        break;
      case "a":
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          setSelectedTags(new Set(props.tags.map(tag => tag.id)));
        }
        break;
      case "Escape":
        e.preventDefault();
        setSelectedTags(new Set());
        setFocusedTagId(null);
        break;
    }
  };
  // Handle bulk delete
  const handleBulkDelete = () => {
    const selectedIds = Array.from(selectedTags());
    const updatedTags = props.tags.filter(tag => !selectedIds.includes(tag.id));
    props.onTagsChange(updatedTags);
    selectedIds.forEach(id => props.onTagRemove?.(id));
    setSelectedTags(new Set());
  };
  // Handle drag and drop
  const handleDragStart = (e, tagId) => {
    if (!props.enableDragDrop) return;
    e.dataTransfer?.setData("text/plain", tagId);
    setIsDragging(true);
  };
  const handleDragOver = (e, tagId) => {
    if (!props.enableDragDrop) return;
    e.preventDefault();
    setDragOverTagId(tagId);
  };
  const handleDragLeave = () => {
    setDragOverTagId(null);
  };
  const handleDrop = (e, targetTagId) => {
    if (!props.enableDragDrop) return;
    e.preventDefault();
    const draggedTagId = e.dataTransfer?.getData("text/plain");
    if (draggedTagId && draggedTagId !== targetTagId) {
      const tagIds = props.tags.map(t => t.id);
      const draggedIndex = tagIds.findIndex(id => id === draggedTagId);
      const targetIndex = tagIds.findIndex(id => id === targetTagId);
      if (draggedIndex !== -1 && targetIndex !== -1) {
        const newTagIds = [...tagIds];
        newTagIds.splice(draggedIndex, 1);
        newTagIds.splice(targetIndex, 0, draggedTagId);
        props.onTagsReorder?.(newTagIds);
      }
    }
    setIsDragging(false);
    setDragOverTagId(null);
  };
  // Handle tag navigation
  const handleTagNavigate = direction => {
    const currentIndex = props.tags.findIndex(tag => tag.id === focusedTagId());
    if (currentIndex === -1) return;
    let newIndex = currentIndex;
    switch (direction) {
      case "left":
        newIndex = Math.max(0, currentIndex - 1);
        break;
      case "right":
        newIndex = Math.min(props.tags.length - 1, currentIndex + 1);
        break;
      case "start":
        newIndex = 0;
        break;
      case "end":
        newIndex = props.tags.length - 1;
        break;
    }
    if (newIndex !== currentIndex) {
      setFocusedTagId(props.tags[newIndex].id);
    }
  };
  // Set up keyboard event listeners
  onMount(() => {
    document.addEventListener("keydown", handleKeyDown);
  });
  onCleanup(() => {
    document.removeEventListener("keydown", handleKeyDown);
  });
  return (
    <div class={`tag-management ${props.className || ""}`}>
      {/* Selection controls */}
      <Show when={props.showSelection && hasSelection()}>
        <div class="selection-controls">
          <div class="selection-info">
            {selectedCount()} tag{selectedCount() !== 1 ? "s" : ""} selected
          </div>
          <div class="selection-actions">
            <button
              type="button"
              class="bulk-delete-button"
              onClick={handleBulkDelete}
              title="Delete selected tags (Delete key)"
            >
              Delete Selected
            </button>
            <button
              type="button"
              class="clear-selection-button"
              onClick={() => setSelectedTags(new Set())}
              title="Clear selection (Escape key)"
            >
              Clear Selection
            </button>
          </div>
        </div>
      </Show>

      {/* Tags container */}
      <div
        class="tags-container"
        classList={{
          dragging: isDragging(),
          "has-selection": hasSelection(),
        }}
      >
        <For each={props.tags}>
          {(tag, index) => (
            <div
              class="tag-wrapper"
              classList={{
                selected: selectedTags().has(tag.id),
                focused: focusedTagId() === tag.id,
                "drag-over": dragOverTagId() === tag.id,
              }}
              draggable={props.enableDragDrop}
              onDragStart={e => handleDragStart(e, tag.id)}
              onDragOver={e => handleDragOver(e, tag.id)}
              onDragLeave={handleDragLeave}
              onDrop={e => handleDrop(e, tag.id)}
              onClick={e => handleTagSelect(tag.id, e)}
              onFocus={() => setFocusedTagId(tag.id)}
              tabIndex={0}
            >
              <TagBubble
                tag={tag.text}
                index={index()}
                onEdit={newText => handleTagEdit(tag.id, newText)}
                onRemove={() => handleTagRemove(tag.id)}
                onNavigate={handleTagNavigate}
                editable={props.editable}
                removable={props.removable}
              />
            </div>
          )}
        </For>
      </div>

      {/* Keyboard shortcuts help */}
      <Show when={props.showSelection}>
        <div class="keyboard-shortcuts">
          <div class="shortcuts-title">Keyboard Shortcuts:</div>
          <div class="shortcuts-list">
            <span>← → Navigate</span>
            <span>Shift+Click Range select</span>
            <span>Ctrl+Click Multi-select</span>
            <span>Ctrl+A Select all</span>
            <span>Delete Remove selected</span>
            <span>Escape Clear selection</span>
          </div>
        </div>
      </Show>
    </div>
  );
};

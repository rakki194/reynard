/**
 * Tag Management Handlers
 *
 * Handles tag editing and removal operations.
 * Separated to reduce main component complexity.
 */

export interface TagManagementHandlersProps {
  tags: Array<{ id: string; text: string }>;
  onTagsChange: (tags: Array<{ id: string; text: string }>) => void;
  onTagEdit?: (tagId: string, newText: string) => void;
  onTagRemove?: (tagId: string) => void;
  onRemoveFromSelection: (tagId: string) => void;
}

export function createTagHandlers(props: TagManagementHandlersProps) {
  const handleTagEdit = (tagId: string, newText: string) => {
    const updatedTags = props.tags.map(tag => (tag.id === tagId ? { ...tag, text: newText } : tag));
    props.onTagsChange(updatedTags);
    props.onTagEdit?.(tagId, newText);
  };

  const handleTagRemove = (tagId: string) => {
    const updatedTags = props.tags.filter(tag => tag.id !== tagId);
    props.onTagsChange(updatedTags);
    props.onTagRemove?.(tagId);
    props.onRemoveFromSelection(tagId);
  };

  return {
    handleTagEdit,
    handleTagRemove,
  };
}

/**
 * Tag Management Handlers
 *
 * Handles tag editing and removal operations.
 * Separated to reduce main component complexity.
 */
export function createTagHandlers(props) {
  const handleTagEdit = (tagId, newText) => {
    const updatedTags = props.tags.map(tag => (tag.id === tagId ? { ...tag, text: newText } : tag));
    props.onTagsChange(updatedTags);
    props.onTagEdit?.(tagId, newText);
  };
  const handleTagRemove = tagId => {
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

/**
 * TagBubbleRemove Component
 *
 * Renders the remove button for tags.
 */
export const TagBubbleRemove = props => {
    if (props.removable === false) {
        return null;
    }
    return (<button class="tag-remove" onClick={props.onRemove} aria-label={`Remove tag: ${props.tag}`} title={`Remove tag: ${props.tag}`}>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
        <path d="M9.5 3.5L8.5 2.5L6 5L3.5 2.5L2.5 3.5L5 6L2.5 8.5L3.5 9.5L6 7L8.5 9.5L9.5 8.5L7 6L9.5 3.5Z"/>
      </svg>
    </button>);
};

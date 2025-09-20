/**
 * TagBubbleInput Component
 *
 * Handles the input field for editing tags.
 */
export const TagBubbleInput = props => {
  return (
    <input
      ref={props.inputRef}
      type="text"
      value={props.value}
      class="tag-input"
      onInput={props.onInput}
      onKeyDown={props.onKeyDown}
      onBlur={props.onBlur}
      onFocus={props.onFocus}
      aria-label="Edit tag"
    />
  );
};

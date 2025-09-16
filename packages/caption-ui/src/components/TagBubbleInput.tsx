/**
 * TagBubbleInput Component
 *
 * Handles the input field for editing tags.
 */

import { Component } from "solid-js";

export interface TagBubbleInputProps {
  value: string;
  onInput: (e: Event) => void;
  onKeyDown: (e: KeyboardEvent) => void;
  onBlur: () => void;
  onFocus: () => void;
  inputRef: HTMLInputElement | undefined;
}

export const TagBubbleInput: Component<TagBubbleInputProps> = props => {
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

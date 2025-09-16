/**
 * TagBubbleContent Component
 *
 * Renders the main content area of the tag bubble.
 */

import { Component, Show } from "solid-js";
import { TagBubbleInput } from "./TagBubbleInput";

export interface TagBubbleContentProps {
  isEditing: boolean;
  tag: string;
  query: string;
  onInput: (e: Event) => void;
  onKeyDown: (e: KeyboardEvent) => void;
  onBlur: () => void;
  onFocus: () => void;
  inputRef: HTMLInputElement | undefined;
}

export const TagBubbleContent: Component<TagBubbleContentProps> = props => {
  return (
    <div class="tag-content">
      <Show
        when={!props.isEditing}
        fallback={
          <TagBubbleInput
            value={props.query}
            onInput={props.onInput}
            onKeyDown={props.onKeyDown}
            onBlur={props.onBlur}
            onFocus={props.onFocus}
            inputRef={props.inputRef}
          />
        }
      >
        <span class="tag-text">{props.tag}</span>
      </Show>
    </div>
  );
};

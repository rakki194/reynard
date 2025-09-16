/**
 * TagBubbleContentSection Component
 *
 * Combines content and remove components for cleaner structure.
 */

import { Component } from "solid-js";
import { TagBubbleContent } from "./TagBubbleContent";
import { TagBubbleRemove } from "./TagBubbleRemove";

export interface TagBubbleContentSectionProps {
  isEditing: () => boolean;
  tag: string;
  query: () => string;
  onInput: (e: Event) => void;
  onKeyDown: (e: KeyboardEvent) => void;
  onBlur: () => void;
  onFocus: () => void;
  onRemove: () => void;
  removable?: boolean;
  inputRef: HTMLInputElement | undefined;
}

export const TagBubbleContentSection: Component<TagBubbleContentSectionProps> = props => {
  return (
    <>
      <TagBubbleContent
        isEditing={props.isEditing()}
        tag={props.tag}
        query={props.query()}
        onInput={props.onInput}
        onKeyDown={props.onKeyDown}
        onBlur={props.onBlur}
        onFocus={props.onFocus}
        inputRef={props.inputRef}
      />
      <TagBubbleRemove tag={props.tag} onRemove={props.onRemove} removable={props.removable} />
    </>
  );
};

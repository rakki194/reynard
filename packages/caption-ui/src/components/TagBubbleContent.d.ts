/**
 * TagBubbleContent Component
 *
 * Renders the main content area of the tag bubble.
 */
import { Component } from "solid-js";
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
export declare const TagBubbleContent: Component<TagBubbleContentProps>;

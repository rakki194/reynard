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
export declare const TagBubbleInput: Component<TagBubbleInputProps>;

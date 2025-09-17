/**
 * TagBubbleContentSection Component
 *
 * Combines content and remove components for cleaner structure.
 */
import { Component } from "solid-js";
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
export declare const TagBubbleContentSection: Component<TagBubbleContentSectionProps>;

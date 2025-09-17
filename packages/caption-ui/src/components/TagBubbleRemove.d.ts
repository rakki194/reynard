/**
 * TagBubbleRemove Component
 *
 * Renders the remove button for tags.
 */
import { Component } from "solid-js";
export interface TagBubbleRemoveProps {
    tag: string;
    onRemove: () => void;
    removable?: boolean;
}
export declare const TagBubbleRemove: Component<TagBubbleRemoveProps>;

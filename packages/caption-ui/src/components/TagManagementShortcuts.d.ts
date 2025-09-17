/**
 * Tag Management Keyboard Shortcuts Component
 *
 * Displays keyboard shortcuts help for tag management.
 * Shows available shortcuts when selection is enabled.
 */
import { Component } from "solid-js";
export interface TagManagementShortcutsProps {
    /** Whether to show shortcuts */
    showSelection: boolean;
}
export declare const TagManagementShortcuts: Component<TagManagementShortcutsProps>;

/**
 * Tag Management Controls Component
 *
 * Selection controls and bulk operation buttons for tag management.
 * Displays selection info and provides action buttons.
 */
import { Component } from "solid-js";
export interface TagManagementControlsProps {
    /** Whether to show selection controls */
    showSelection: boolean;
    /** Whether there are selected tags */
    hasSelection: boolean;
    /** Number of selected tags */
    selectedCount: number;
    /** Callback for bulk delete */
    onBulkDelete: () => void;
    /** Callback for clearing selection */
    onClearSelection: () => void;
}
export declare const TagManagementControls: Component<TagManagementControlsProps>;

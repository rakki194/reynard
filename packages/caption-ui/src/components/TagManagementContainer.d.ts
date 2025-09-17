/**
 * Tag Management Container Component
 *
 * Container for tag items with drag and drop support.
 * Handles tag rendering and interaction events.
 */
import { Component } from "solid-js";
export interface Tag {
    id: string;
    text: string;
    metadata?: Record<string, any>;
}
export interface TagManagementContainerProps {
    /** Array of tags to display */
    tags: Tag[];
    /** Selected tag IDs */
    selectedTags: Set<string>;
    /** Currently focused tag ID */
    focusedTagId: string | null;
    /** Whether dragging is active */
    isDragging: boolean;
    /** Tag ID being dragged over */
    dragOverTagId: string | null;
    /** Whether drag and drop is enabled */
    enableDragDrop: boolean;
    /** Whether tags are editable */
    editable?: boolean;
    /** Whether tags are removable */
    removable?: boolean;
    /** Callback for tag selection */
    onTagSelect: (tagId: string, event?: MouseEvent) => void;
    /** Callback for tag editing */
    onTagEdit: (tagId: string, newText: string) => void;
    /** Callback for tag removal */
    onTagRemove: (tagId: string) => void;
    /** Callback for tag navigation */
    onTagNavigate: (direction: "left" | "right" | "start" | "end") => void;
    /** Callback for setting focused tag */
    onSetFocusedTag: (tagId: string) => void;
    /** Drag and drop handlers */
    onDragStart: (e: DragEvent, tagId: string) => void;
    onDragOver: (e: DragEvent, tagId: string) => void;
    onDragLeave: () => void;
    onDrop: (e: DragEvent, tagId: string) => void;
}
export declare const TagManagementContainer: Component<TagManagementContainerProps>;

/**
 * Tag Management Component
 *
 * Advanced tag management system with keyboard navigation, selection,
 * and bulk operations. Built for the Reynard caption system.
 *
 * Features:
 * - Keyboard navigation between tags
 * - Multi-selection with Shift+Click
 * - Bulk operations (delete, edit, move)
 * - Tag reordering with drag and drop
 * - Integration with existing TagBubble components
 */
import { Component } from "solid-js";
export interface Tag {
    id: string;
    text: string;
    metadata?: Record<string, unknown>;
}
export interface TagManagementProps {
    /** Array of tags to manage */
    tags: Tag[];
    /** Callback when tags change */
    onTagsChange: (tags: Tag[]) => void;
    /** Callback when a tag is edited */
    onTagEdit?: (tagId: string, newText: string) => void;
    /** Callback when a tag is removed */
    onTagRemove?: (tagId: string) => void;
    /** Callback when tags are reordered */
    onTagsReorder?: (tagIds: string[]) => void;
    /** Whether tags are editable */
    editable?: boolean;
    /** Whether tags are removable */
    removable?: boolean;
    /** Whether to show selection controls */
    showSelection?: boolean;
    /** Whether to enable drag and drop reordering */
    enableDragDrop?: boolean;
    /** Additional CSS class */
    className?: string;
}
export declare const TagManagement: Component<TagManagementProps>;

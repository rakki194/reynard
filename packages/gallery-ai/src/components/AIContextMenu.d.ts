/**
 * AI Context Menu Component
 *
 * Enhanced context menu with AI-powered actions for gallery items.
 * Integrates with the annotation system to provide caption generation,
 * batch processing, and smart features.
 */
import { Component } from "solid-js";
import type { AIContextMenuAction, FileItem, FolderItem } from "../types";
export interface AIContextMenuProps {
    /** Whether the menu is visible */
    visible: boolean;
    /** Menu position */
    position: {
        x: number;
        y: number;
    };
    /** Target item */
    item: FileItem | FolderItem;
    /** Selected items for batch operations */
    selectedItems: (FileItem | FolderItem)[];
    /** Available AI actions */
    actions: AIContextMenuAction[];
    /** Event handlers */
    onClose: () => void;
    onActionClick: (action: AIContextMenuAction) => void;
    /** Custom class name */
    class?: string;
}
export declare const AIContextMenu: Component<AIContextMenuProps>;

/**
 * AI Context Menu Actions Factory
 *
 * Creates AI-powered context menu actions for gallery items.
 * Provides predefined actions for caption generation, batch processing,
 * and smart features.
 */
import type { AIContextMenuAction, FileItem, FolderItem } from "../types";
export interface ContextMenuActionsConfig {
    /** Available generators */
    availableGenerators: string[];
    /** Default generator */
    defaultGenerator: string;
    /** Whether AI is enabled */
    aiEnabled: boolean;
    /** Whether batch operations are supported */
    enableBatchOperations: boolean;
    /** Whether smart features are enabled */
    enableSmartFeatures: boolean;
}
/**
 * Create AI context menu actions for a single item
 */
export declare function createSingleItemActions(item: FileItem | FolderItem, config: ContextMenuActionsConfig): AIContextMenuAction[];
/**
 * Create AI context menu actions for multiple selected items
 */
export declare function createBatchActions(items: (FileItem | FolderItem)[], config: ContextMenuActionsConfig): AIContextMenuAction[];
/**
 * Create smart feature actions
 */
export declare function createSmartFeatureActions(_item: FileItem | FolderItem, config: ContextMenuActionsConfig): AIContextMenuAction[];
/**
 * Create all AI context menu actions
 */
export declare function createAIContextMenuActions(item: FileItem | FolderItem, selectedItems: (FileItem | FolderItem)[], config: ContextMenuActionsConfig): AIContextMenuAction[];

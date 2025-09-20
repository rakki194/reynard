/**
 * Caption UI Composables
 *
 * Exports all composables for caption generation and tag management functionality.
 */

// Tag Management Composables
export { useTagBulkOperations } from "./useTagBulkOperations";
export { useTagDragDrop } from "./useTagDragDrop";
export { useTagKeyboardNavigation } from "./useTagKeyboardNavigation";
export { useTagManagement } from "./useTagManagement";
export { useTagSelection } from "./useTagSelection";

// Caption Generator Composables
export { useCaptionGeneratorBackend } from "./useCaptionGeneratorBackend";
export { useCaptionGeneratorHandlers } from "./useCaptionGeneratorHandlers";

// File Handling Composables
export { useFileHandling } from "./useFileHandling";
export { useFileUpload } from "./useFileUpload";
export { useTextFileManager } from "./useTextFileManager";
export { useTextFileUpload } from "./useTextFileUpload";

// Type Exports
export type { TagBulkOperationsActions, TagBulkOperationsState } from "./useTagBulkOperations";
export type { TagDragDropActions, TagDragDropState } from "./useTagDragDrop";
export type { TagNavigationActions, TagNavigationState } from "./useTagKeyboardNavigation";
export type { TagManagementActions, TagManagementState } from "./useTagManagement";
export type { TagSelectionActions, TagSelectionState } from "./useTagSelection";

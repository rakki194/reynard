/**
 * AI Gallery Types
 *
 * Core type definitions for the AI-enhanced gallery system.
 * Extends the base gallery types with AI-specific functionality.
 */
export var AIOperationStatus;
(function (AIOperationStatus) {
    AIOperationStatus["IDLE"] = "idle";
    AIOperationStatus["GENERATING"] = "generating";
    AIOperationStatus["BATCH_PROCESSING"] = "batch_processing";
    AIOperationStatus["ERROR"] = "error";
    AIOperationStatus["SUCCESS"] = "success";
})(AIOperationStatus || (AIOperationStatus = {}));
export var AIContextMenuActionType;
(function (AIContextMenuActionType) {
    AIContextMenuActionType["GENERATE_CAPTION"] = "generate_caption";
    AIContextMenuActionType["BATCH_ANNOTATE"] = "batch_annotate";
    AIContextMenuActionType["EDIT_CAPTION"] = "edit_caption";
    AIContextMenuActionType["DELETE_CAPTION"] = "delete_caption";
    AIContextMenuActionType["REGENERATE_CAPTION"] = "regenerate_caption";
    AIContextMenuActionType["SMART_ORGANIZE"] = "smart_organize";
    AIContextMenuActionType["AI_SEARCH"] = "ai_search";
})(AIContextMenuActionType || (AIContextMenuActionType = {}));
// ============================================================================
// Export all types
// ============================================================================
export * from "./index";

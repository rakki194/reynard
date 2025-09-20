/**
 * AI Context Menu Actions Factory
 *
 * Creates AI-powered context menu actions for gallery items.
 * Provides predefined actions for caption generation, batch processing,
 * and smart features.
 */

import type { AIContextMenuAction, FileItem, FolderItem, CaptionType } from "../types";
import { AIContextMenuActionType } from "../types";
import { CaptionType as AISharedCaptionType } from "reynard-ai-shared";

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
export function createSingleItemActions(
  item: FileItem | FolderItem,
  config: ContextMenuActionsConfig
): AIContextMenuAction[] {
  const actions: AIContextMenuAction[] = [];

  // Only add AI actions for files (not folders)
  if (item.type === "folder") {
    return actions;
  }

  // Generate Caption submenu
  if (config.aiEnabled && config.availableGenerators.length > 0) {
    const generateCaptionAction: AIContextMenuAction = {
      id: "generate-caption",
      label: "Generate Caption",
      icon: "🤖",
      aiActionType: AIContextMenuActionType.GENERATE_CAPTION,
      children: config.availableGenerators.map(generator => ({
        id: `generate-caption-${generator}`,
        label: getGeneratorDisplayName(generator),
        icon: getGeneratorIcon(generator),
        aiActionType: AIContextMenuActionType.GENERATE_CAPTION,
        aiConfig: {
          generator,
          captionType: getDefaultCaptionType(generator),
        },
      })),
    };
    actions.push(generateCaptionAction);
  }

  // Edit Caption action
  actions.push({
    id: "edit-caption",
    label: "Edit Caption",
    icon: "✏️",
    aiActionType: AIContextMenuActionType.EDIT_CAPTION,
    disabled: !config.aiEnabled,
  });

  // Regenerate Caption action
  if (config.aiEnabled) {
    actions.push({
      id: "regenerate-caption",
      label: "Regenerate Caption",
      icon: "🔄",
      aiActionType: AIContextMenuActionType.REGENERATE_CAPTION,
      aiConfig: {
        generator: config.defaultGenerator,
        forceRegeneration: true,
      },
    });
  }

  // Delete Caption action
  actions.push({
    id: "delete-caption",
    label: "Delete Caption",
    icon: "🗑️",
    aiActionType: AIContextMenuActionType.DELETE_CAPTION,
    isDestructive: true,
    disabled: !config.aiEnabled,
  });

  return actions;
}

/**
 * Create AI context menu actions for multiple selected items
 */
export function createBatchActions(
  items: (FileItem | FolderItem)[],
  config: ContextMenuActionsConfig
): AIContextMenuAction[] {
  const actions: AIContextMenuAction[] = [];

  if (!config.enableBatchOperations || !config.aiEnabled) {
    return actions;
  }

  const fileItems = items.filter(item => item.type !== "folder") as FileItem[];

  if (fileItems.length < 2) {
    return actions;
  }

  // Batch Annotate submenu
  const batchAnnotateAction: AIContextMenuAction = {
    id: "batch-annotate",
    label: `Batch Annotate (${fileItems.length} items)`,
    icon: "📦",
    aiActionType: AIContextMenuActionType.BATCH_ANNOTATE,
    requiresMultipleSelection: true,
    children: config.availableGenerators.map(generator => ({
      id: `batch-annotate-${generator}`,
      label: `Batch with ${getGeneratorDisplayName(generator)}`,
      icon: getGeneratorIcon(generator),
      aiActionType: AIContextMenuActionType.BATCH_ANNOTATE,
      requiresMultipleSelection: true,
      aiConfig: {
        generator,
        captionType: getDefaultCaptionType(generator),
      },
    })),
  };
  actions.push(batchAnnotateAction);

  return actions;
}

/**
 * Create smart feature actions
 */
export function createSmartFeatureActions(
  _item: FileItem | FolderItem,
  config: ContextMenuActionsConfig
): AIContextMenuAction[] {
  const actions: AIContextMenuAction[] = [];

  if (!config.enableSmartFeatures || !config.aiEnabled) {
    return actions;
  }

  // Smart Organize action
  actions.push({
    id: "smart-organize",
    label: "Smart Organize",
    icon: "🧠",
    aiActionType: AIContextMenuActionType.SMART_ORGANIZE,
  });

  // AI Search action
  actions.push({
    id: "ai-search",
    label: "AI Search Similar",
    icon: "🔍",
    aiActionType: AIContextMenuActionType.AI_SEARCH,
  });

  return actions;
}

/**
 * Create all AI context menu actions
 */
export function createAIContextMenuActions(
  item: FileItem | FolderItem,
  selectedItems: (FileItem | FolderItem)[],
  config: ContextMenuActionsConfig
): AIContextMenuAction[] {
  const actions: AIContextMenuAction[] = [];

  // Add single item actions
  actions.push(...createSingleItemActions(item, config));

  // Add batch actions if multiple items are selected
  if (selectedItems.length > 1) {
    actions.push(...createBatchActions(selectedItems, config));
  }

  // Add smart feature actions
  actions.push(...createSmartFeatureActions(item, config));

  return actions;
}

/**
 * Get display name for a generator
 */
function getGeneratorDisplayName(generator: string): string {
  const displayNames: Record<string, string> = {
    jtp2: "JTP2 (Furry Tags)",
    wdv3: "WDv3 (Anime Tags)",
    joy: "JoyCaption (Detailed)",
    florence2: "Florence2 (General)",
  };

  return displayNames[generator] || generator;
}

/**
 * Get icon for a generator
 */
function getGeneratorIcon(generator: string): string {
  const icons: Record<string, string> = {
    jtp2: "🦊",
    wdv3: "🎌",
    joy: "😊",
    florence2: "🏛️",
  };

  return icons[generator] || "🤖";
}

/**
 * Get default caption type for a generator
 */
function getDefaultCaptionType(generator: string): CaptionType {
  const captionTypes: Record<string, CaptionType> = {
    jtp2: AISharedCaptionType.TAGS,
    wdv3: AISharedCaptionType.TAGS,
    joy: AISharedCaptionType.CAPTION,
    florence2: AISharedCaptionType.CAPTION,
  };

  return captionTypes[generator] || AISharedCaptionType.CAPTION;
}

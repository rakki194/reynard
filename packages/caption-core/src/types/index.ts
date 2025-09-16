/**
 * Caption Types Barrel Export
 *
 * Centralized exports for all caption-related types.
 */

// Core types
export type { CaptionData, CaptionEditorState, CaptionHistory } from "./CaptionCore";

export { CaptionType } from "./CaptionCore";

// Component props
export type {
  CaptionInputProps,
  CaptionStatsProps,
  CaptionToolbarProps,
  TagAutocompleteProps,
  TagBubbleProps,
  TagInputProps,
} from "./ComponentProps";

// Editor types
export type { CaptionEditorConfig, CaptionEditorEvents, CaptionEditorProps, CaptionEditorRef } from "./EditorTypes";

// Theme types
export type { CaptionTheme, TagColorScheme } from "./ThemeTypes";

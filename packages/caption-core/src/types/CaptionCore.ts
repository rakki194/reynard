/**
 * Core Caption Types
 *
 * Fundamental types for caption data and basic enums.
 */

export enum CaptionType {
  CAPTION = "caption",
  TAGS = "tags",
  E621 = "e621",
  TOML = "toml",
}

export interface CaptionData {
  type: CaptionType;
  content: string;
}

export interface CaptionHistory {
  past: CaptionData[];
  present: CaptionData;
  future: CaptionData[];
}

export interface CaptionEditorState {
  caption: CaptionData;
  history: CaptionHistory;
  isDirty: boolean;
  isSaving: boolean;
  error?: string;
  lastSaved?: Date;
}

/**
 * Component Props Types
 *
 * Type definitions for caption UI component props.
 */

import type { CaptionData } from "./CaptionCore";

export interface TagBubbleProps {
  tag: string;
  index: number;
  onRemove: () => void;
  onEdit: (newTag: string) => void;
  onNavigate?: (direction: "left" | "right" | "up" | "down" | "start" | "end") => void;
  editable?: boolean;
  removable?: boolean;
  color?: string;
  size?: "small" | "medium" | "large";
  // Enhanced OKLCH color options
  intensity?: number; // 0.5 (subtle) to 2.0 (intense)
  variant?: "default" | "muted" | "vibrant";
  theme?: string;
}

export interface CaptionInputProps {
  caption: CaptionData;
  state: "expanded" | "collapsed" | null;
  onClick: () => void;
  shouldAutoFocus?: boolean;
  imageInfo?: {
    path: string;
    size: number;
    width: number;
    height: number;
    format: string;
    lastModified: Date;
  };
  onCaptionChange: (caption: CaptionData) => void;
  onSave?: (caption: CaptionData) => void;
  onCancel?: () => void;
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
  readonly?: boolean;
}

export interface TagAutocompleteProps {
  query: string;
  suggestions: string[];
  selectedIndex: number;
  isOpen: boolean;
  onQueryChange: (query: string) => void;
  onSuggestionSelect: (suggestion: string) => void;
  onSuggestionHover: (index: number) => void;
  onClose: () => void;
  maxSuggestions?: number;
  minQueryLength?: number;
}

export interface TagInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  onTagAdd: (tag: string) => void;
  onTagRemove: (index: number) => void;
  onTagEdit: (index: number, newTag: string) => void;
  placeholder?: string;
  maxTags?: number;
  allowDuplicates?: boolean;
  validateTag?: (tag: string) => boolean;
  suggestions?: string[];
  showSuggestions?: boolean;
  disabled?: boolean;
  readonly?: boolean;
}

export interface CaptionToolbarProps {
  onSave?: () => void;
  onCancel?: () => void;
  onClear?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canSave?: boolean;
  canCancel?: boolean;
  canClear?: boolean;
  canUndo?: boolean;
  canRedo?: boolean;
  disabled?: boolean;
}

export interface CaptionStatsProps {
  caption: CaptionData;
  showWordCount?: boolean;
  showCharacterCount?: boolean;
  showLineCount?: boolean;
  maxLength?: number;
}

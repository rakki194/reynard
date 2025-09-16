/**
 * Caption UI Types
 *
 * Types for caption editing UI components including textarea and tag bubbles.
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

export interface CaptionEditorProps {
  caption: CaptionData;
  onCaptionChange: (caption: CaptionData) => void;
  onSave?: (caption: CaptionData) => void;
  onCancel?: () => void;
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
  readonly?: boolean;
  showToolbar?: boolean;
  showWordCount?: boolean;
  showCharacterCount?: boolean;
  autoResize?: boolean;
  minRows?: number;
  maxRows?: number;
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

export interface TagColorScheme {
  background: string;
  text: string;
  border: string;
  hover: string;
  active: string;
}

export interface CaptionTheme {
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    fontWeight: {
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
}

export interface CaptionEditorConfig {
  theme?: CaptionTheme;
  autoSave?: boolean;
  autoSaveInterval?: number;
  maxHistorySize?: number;
  enableKeyboardShortcuts?: boolean;
  enableDragAndDrop?: boolean;
  enableSpellCheck?: boolean;
  enableAutoComplete?: boolean;
  enableSuggestions?: boolean;
  defaultCaptionType?: CaptionType;
  allowedCaptionTypes?: CaptionType[];
}

export interface CaptionEditorEvents {
  onCaptionChange?: (caption: CaptionData) => void;
  onSave?: (caption: CaptionData) => void;
  onCancel?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onKeyDown?: (event: KeyboardEvent) => void;
  onKeyUp?: (event: KeyboardEvent) => void;
  onPaste?: (event: ClipboardEvent) => void;
  onDrop?: (event: DragEvent) => void;
  onDragOver?: (event: DragEvent) => void;
  onDragLeave?: (event: DragEvent) => void;
}

export interface CaptionEditorRef {
  focus: () => void;
  blur: () => void;
  selectAll: () => void;
  clear: () => void;
  undo: () => void;
  redo: () => void;
  save: () => void;
  cancel: () => void;
  getValue: () => CaptionData;
  setValue: (caption: CaptionData) => void;
  isDirty: () => boolean;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

/**
 * Editor Types
 *
 * Type definitions for caption editor functionality and events.
 */
import type { CaptionData, CaptionType } from "./CaptionCore";
import type { CaptionTheme } from "./ThemeTypes";
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

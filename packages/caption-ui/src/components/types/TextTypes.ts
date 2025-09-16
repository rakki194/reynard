/**
 * Text Types for Reynard Caption System
 *
 * Type definitions for text processing components,
 * leveraging existing text processing infrastructure.
 */

export interface TextFile {
  /** Unique identifier for the text file */
  id: string;
  /** Original filename */
  name: string;
  /** File size in bytes */
  size: number;
  /** MIME type */
  type: string;
  /** File content */
  content: string;
  /** Extracted text metadata */
  metadata: TextMetadata;
  /** Upload timestamp */
  uploadedAt: Date;
  /** Last modification timestamp */
  modifiedAt: Date;
}

export interface TextMetadata {
  /** Original filename */
  name: string;
  /** File size in bytes */
  size: number;
  /** MIME type */
  type: string;
  /** File extension */
  extension: string;
  /** Number of lines */
  lineCount: number;
  /** Number of words */
  wordCount: number;
  /** Number of characters */
  characterCount: number;
  /** Text encoding */
  encoding: string;
  /** Detected programming language */
  language: string;
  /** Last modified date */
  lastModified: Date;
}

export interface TextProcessingOptions {
  /** Content analysis options */
  analysis?: {
    /** Whether to detect programming language */
    detectLanguage?: boolean;
    /** Whether to count words and lines */
    countMetrics?: boolean;
    /** Whether to detect encoding */
    detectEncoding?: boolean;
    /** Whether to extract syntax highlighting info */
    extractSyntaxInfo?: boolean;
  };
  /** Editing options */
  editing?: {
    /** Whether to enable syntax highlighting */
    enableSyntaxHighlighting?: boolean;
    /** Whether to enable auto-completion */
    enableAutoCompletion?: boolean;
    /** Whether to enable formatting */
    enableFormatting?: boolean;
    /** Whether to enable linting */
    enableLinting?: boolean;
  };
}

export interface TextGridState {
  /** Currently selected text file */
  selectedFile: TextFile | null;
  /** List of all text files */
  files: TextFile[];
  /** Whether processing is in progress */
  isLoading: boolean;
  /** Current error message */
  error: string | null;
  /** Upload progress for batch operations */
  uploadProgress: Record<string, number>;
}

export interface TextEditorState {
  /** Current file content */
  content: string;
  /** Whether content has been modified */
  isModified: boolean;
  /** Current cursor position */
  cursorPosition: { line: number; column: number };
  /** Selected text range */
  selection: { start: number; end: number } | null;
  /** Whether editor is focused */
  isFocused: boolean;
  /** Current zoom level */
  zoomLevel: number;
}

export type SupportedTextFormat =
  | "txt"
  | "md"
  | "json"
  | "xml"
  | "yaml"
  | "yml"
  | "toml"
  | "js"
  | "ts"
  | "tsx"
  | "jsx"
  | "py"
  | "java"
  | "cpp"
  | "c"
  | "cs"
  | "php"
  | "rb"
  | "go"
  | "rs"
  | "swift"
  | "kt"
  | "scala"
  | "html"
  | "css"
  | "scss"
  | "sass"
  | "less"
  | "sql"
  | "sh"
  | "bash"
  | "zsh"
  | "fish"
  | "ps1"
  | "bat"
  | "dockerfile"
  | "gitignore"
  | "env"
  | "log";

export interface TextFormatInfo {
  /** File extension */
  extension: string;
  /** MIME type */
  mimeType: string;
  /** Programming language for syntax highlighting */
  language: string;
  /** Display icon */
  icon: string;
  /** Human-readable name */
  name: string;
  /** Whether format supports syntax highlighting */
  supportsSyntaxHighlighting: boolean;
  /** Whether format supports auto-completion */
  supportsAutoCompletion: boolean;
  /** Whether format supports formatting */
  supportsFormatting: boolean;
}

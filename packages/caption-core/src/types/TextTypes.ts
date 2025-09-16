/**
 * Text Types for Reynard Caption System
 *
 * Defines interfaces for text file handling and metadata.
 */

export interface TextMetadata {
  name: string;
  size: number;
  type: string;
  extension: string;
  lineCount: number;
  wordCount: number;
  characterCount: number;
  encoding: string;
  language: string;
  lastModified: Date;
}

export interface TextFile {
  id: string;
  name: string;
  size: number;
  type: string;
  content: string;
  metadata: TextMetadata;
  uploadedAt: Date;
  modifiedAt: Date;
}

export interface TextGridProps {
  /** Initial text files to display */
  initialFiles?: TextFile[];
  /** Callback when files are selected */
  onFileSelect?: (file: TextFile) => void;
  /** Callback when files are removed */
  onFileRemove?: (fileId: string) => void;
  /** Callback when file content is modified */
  onFileModify?: (fileId: string, content: string) => void;
  /** Maximum number of files to display */
  maxFiles?: number;
  /** Whether to show file metadata */
  showMetadata?: boolean;
  /** Whether to enable editing */
  editable?: boolean;
  /** Custom CSS class */
  class?: string;
}

export interface TextGridState {
  files: TextFile[];
  selectedFile: TextFile | null;
  isLoading: boolean;
  error: string | null;
}

export interface TextProcessingOptions {
  encoding?: string;
  language?: string;
  maxSize?: number;
  allowedExtensions?: string[];
}

export interface TextFileCardProps {
  file: TextFile;
  onSelect?: (file: TextFile) => void;
  onRemove?: (fileId: string) => void;
  onModify?: (fileId: string, content: string) => void;
  selected?: boolean;
  editable?: boolean;
  showMetadata?: boolean;
}

export interface TextEditorProps {
  file: TextFile;
  onContentChange?: (content: string) => void;
  onSave?: (content: string) => void;
  readonly?: boolean;
  showLineNumbers?: boolean;
  showWordCount?: boolean;
  autoSave?: boolean;
  autoSaveInterval?: number;
}

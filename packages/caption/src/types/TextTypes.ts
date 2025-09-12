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

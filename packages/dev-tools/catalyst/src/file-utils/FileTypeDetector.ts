/**
 * ⚗️ Catalyst File Type Detector
 * Unified file type detection for all Reynard dev-tools
 */

import path from 'path';
import type { FileType, FileTypeMapping } from '../types/FileUtils.js';

export class FileTypeDetector {
  private static readonly FILE_TYPE_MAPPING: FileTypeMapping = {
    '.ts': 'typescript',
    '.tsx': 'typescript',
    '.js': 'javascript',
    '.jsx': 'javascript',
    '.py': 'python',
    '.md': 'markdown',
    '.mdx': 'markdown',
    '.json': 'json',
    '.yaml': 'yaml',
    '.yml': 'yaml',
    '.css': 'css',
    '.html': 'html',
    '.htm': 'html',
    '.sh': 'shell',
    '.sql': 'sql',
    '.conf': 'config',
    '.toml': 'toml',
  };

  /**
   * Get file type from file path
   */
  static getFileType(filePath: string): FileType | null {
    const ext = path.extname(filePath).toLowerCase();
    return (this.FILE_TYPE_MAPPING[ext] as FileType) || null;
  }

  /**
   * Get all supported file extensions
   */
  static getSupportedExtensions(): string[] {
    return Object.keys(this.FILE_TYPE_MAPPING);
  }

  /**
   * Get all supported file types
   */
  static getSupportedFileTypes(): FileType[] {
    return Array.from(new Set(Object.values(this.FILE_TYPE_MAPPING))) as FileType[];
  }

  /**
   * Check if file extension is supported
   */
  static isSupportedExtension(extension: string): boolean {
    return extension.toLowerCase() in this.FILE_TYPE_MAPPING;
  }

  /**
   * Check if file type is supported
   */
  static isSupportedFileType(fileType: string): boolean {
    return Object.values(this.FILE_TYPE_MAPPING).includes(fileType as FileType);
  }

  /**
   * Get extensions for a specific file type
   */
  static getExtensionsForType(fileType: FileType): string[] {
    return Object.entries(this.FILE_TYPE_MAPPING)
      .filter(([, type]) => type === fileType)
      .map(([ext]) => ext);
  }

  /**
   * Get file type mapping
   */
  static getFileTypeMapping(): FileTypeMapping {
    return { ...this.FILE_TYPE_MAPPING };
  }
}

/**
 * File type validation utilities for the processing pipeline.
 * 
 * Handles file type checking and validation against supported extensions.
 */

import {
  getFileTypeInfo,
  isSupportedExtension,
  getAllSupportedExtensions,
} from "../../config/file-types";

export class FileTypeValidator {
  private supportedExtensions: Set<string>;

  constructor(supportedExtensions?: Set<string>) {
    this.supportedExtensions = supportedExtensions || getAllSupportedExtensions();
  }

  /**
   * Check if file type is supported
   */
  isSupported(file: File | string): boolean {
    if (typeof file === "string") {
      // URL case - extract extension from path
      const extension = this.getFileExtension(file);
      return isSupportedExtension(extension);
    } else {
      // File object case
      const extension = this.getFileExtension(file.name);
      return isSupportedExtension(extension);
    }
  }

  /**
   * Get file extension from filename
   */
  getFileExtension(filename: string): string {
    const lastDotIndex = filename.lastIndexOf(".");
    return lastDotIndex !== -1
      ? filename.substring(lastDotIndex).toLowerCase()
      : "";
  }

  /**
   * Get file type information
   */
  getFileTypeInfo(extension: string) {
    return getFileTypeInfo(extension);
  }

  /**
   * Get all supported extensions
   */
  getAllSupportedExtensions(): Set<string> {
    return getAllSupportedExtensions();
  }

  /**
   * Check if extension is supported
   */
  isExtensionSupported(extension: string): boolean {
    return isSupportedExtension(extension);
  }

  /**
   * Update supported extensions
   */
  updateSupportedExtensions(extensions: Set<string>): void {
    this.supportedExtensions = new Set(extensions);
  }

  /**
   * Add supported extension
   */
  addSupportedExtension(extension: string): void {
    this.supportedExtensions.add(extension.toLowerCase());
  }

  /**
   * Remove supported extension
   */
  removeSupportedExtension(extension: string): void {
    this.supportedExtensions.delete(extension.toLowerCase());
  }

  /**
   * Get current supported extensions
   */
  getSupportedExtensions(): Set<string> {
    return new Set(this.supportedExtensions);
  }
}

/**
 * Modality utility functions for managing media modalities
 */

import type { Modality } from "../types";

/**
 * Base modality class that defines the common interface for all modalities
 */
export abstract class BaseModality implements Modality {
  /** Unique identifier for the modality */
  abstract readonly id: string;

  /** Human-readable name */
  abstract readonly name: string;

  /** Icon identifier for the modality */
  abstract readonly icon: string;

  /** Description of the modality */
  abstract readonly description: string;

  /** Whether this modality is currently enabled */
  abstract readonly enabled: boolean;

  /** File extensions supported by this modality */
  abstract readonly fileExtensions: string[];

  /** Functionalities that work with this modality */
  abstract readonly supportedFunctionalities: string[];

  /** Component to render for this modality */
  abstract readonly component: any;

  /**
   * Validate if a file is supported by this modality
   * @param file - The file to validate
   * @returns True if the file is supported
   */
  validateFile(file: File): boolean {
    const extension = "." + file.name.split(".").pop()?.toLowerCase();
    return this.fileExtensions.includes(extension);
  }

  /**
   * Get supported file types for this modality
   * @returns Array of supported file extensions
   */
  getSupportedFileTypes(): string[] {
    return [...this.fileExtensions];
  }

  /**
   * Check if this modality supports a specific functionality
   * @param functionalityId - The functionality ID to check
   * @returns True if the functionality is supported
   */
  supportsFunctionality(functionalityId: string): boolean {
    return this.supportedFunctionalities.includes(functionalityId);
  }

  /**
   * Get modality configuration object
   * @returns Modality configuration
   */
  getConfig(): Modality {
    return {
      id: this.id,
      name: this.name,
      icon: this.icon,
      description: this.description,
      enabled: this.enabled,
      fileExtensions: this.fileExtensions,
      supportedFunctionalities: this.supportedFunctionalities,
      component: this.component,
      validateFile: this.validateFile.bind(this),
      getSupportedFileTypes: this.getSupportedFileTypes.bind(this),
    };
  }
}

/**
 * Factory function to create modality instances
 * @param config - Modality configuration
 * @returns Modality instance
 */
export function createModality(config: Modality): Modality {
  return {
    ...config,
    validateFile: config.validateFile,
    getSupportedFileTypes: config.getSupportedFileTypes,
  };
}

/**
 * Modality registry for managing all available modalities
 */
export class ModalityRegistry {
  private modalities = new Map<string, Modality>();

  constructor() {
    this.registerDefaultModalities();
  }

  /**
   * Register default modalities
   */
  private registerDefaultModalities() {
    // This will be populated by the specific modality implementations
  }

  /**
   * Register a new modality
   * @param modality - The modality to register
   */
  registerModality(modality: Modality) {
    if (this.modalities.has(modality.id)) {
      console.warn(`Modality with id '${modality.id}' is already registered. Overwriting.`);
    }

    this.modalities.set(modality.id, modality);
  }

  /**
   * Unregister a modality
   * @param modalityId - The ID of the modality to unregister
   */
  unregisterModality(modalityId: string) {
    this.modalities.delete(modalityId);
  }

  /**
   * Get a modality by ID
   * @param modalityId - The ID of the modality to get
   * @returns The modality or undefined if not found
   */
  getModality(modalityId: string): Modality | undefined {
    return this.modalities.get(modalityId);
  }

  /**
   * Get all registered modalities
   * @returns Array of all registered modalities
   */
  getAllModalities(): Modality[] {
    return Array.from(this.modalities.values());
  }

  /**
   * Get enabled modalities
   * @returns Array of enabled modalities
   */
  getEnabledModalities(): Modality[] {
    return this.getAllModalities().filter(modality => modality.enabled);
  }

  /**
   * Get modalities that support a specific functionality
   * @param functionalityId - The functionality ID to check
   * @returns Array of modalities that support the functionality
   */
  getModalitiesForFunctionality(functionalityId: string): Modality[] {
    return this.getAllModalities().filter(modality => modality.supportedFunctionalities.includes(functionalityId));
  }

  /**
   * Get modalities that support a specific file extension
   * @param extension - The file extension to check
   * @returns Array of modalities that support the extension
   */
  getModalitiesForFileExtension(extension: string): Modality[] {
    const normalizedExtension = extension.toLowerCase();
    return this.getAllModalities().filter(modality =>
      modality.fileExtensions.some(ext => ext.toLowerCase() === normalizedExtension)
    );
  }

  /**
   * Check if a file is supported by any modality
   * @param file - The file to check
   * @returns Array of modalities that support the file
   */
  getModalitiesForFile(file: File): Modality[] {
    return this.getAllModalities().filter(modality => modality.validateFile(file));
  }
}

/**
 * File utility functions
 */

/**
 * Format file size in human-readable format
 * @param bytes - File size in bytes
 * @returns Formatted file size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Format duration in human-readable format
 * @param seconds - Duration in seconds
 * @returns Formatted duration string
 */
export function formatDuration(seconds?: number): string {
  if (!seconds) return "Unknown";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Get file extension from filename
 * @param filename - The filename to extract extension from
 * @returns File extension with dot (e.g., '.jpg')
 */
export function getFileExtension(filename: string): string {
  return "." + filename.split(".").pop()?.toLowerCase();
}

/**
 * Check if a file is an image
 * @param file - File to check
 * @returns True if file is an image
 */
export function isImageFile(file: File): boolean {
  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".tiff", ".svg"];
  return imageExtensions.includes(getFileExtension(file.name));
}

/**
 * Check if a file is an audio file
 * @param file - File to check
 * @returns True if file is an audio file
 */
export function isAudioFile(file: File): boolean {
  const audioExtensions = [".mp3", ".wav", ".flac", ".aac", ".ogg", ".m4a", ".wma", ".opus"];
  return audioExtensions.includes(getFileExtension(file.name));
}

/**
 * Check if a file is a video file
 * @param file - File to check
 * @returns True if file is a video file
 */
export function isVideoFile(file: File): boolean {
  const videoExtensions = [".mp4", ".avi", ".mov", ".mkv", ".webm", ".flv", ".wmv", ".m4v"];
  return videoExtensions.includes(getFileExtension(file.name));
}

/**
 * Check if a file is a text file
 * @param file - File to check
 * @returns True if file is a text file
 */
export function isTextFile(file: File): boolean {
  const textExtensions = [".txt", ".md", ".json", ".xml", ".html", ".css", ".js", ".ts", ".tsx"];
  return textExtensions.includes(getFileExtension(file.name));
}

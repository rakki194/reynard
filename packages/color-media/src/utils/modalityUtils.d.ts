/**
 * Modality utility functions for managing media modalities
 */
import type { Modality } from "../types";
/**
 * Base modality class that defines the common interface for all modalities
 */
export declare abstract class BaseModality implements Modality {
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
  validateFile(file: File): boolean;
  /**
   * Get supported file types for this modality
   * @returns Array of supported file extensions
   */
  getSupportedFileTypes(): string[];
  /**
   * Check if this modality supports a specific functionality
   * @param functionalityId - The functionality ID to check
   * @returns True if the functionality is supported
   */
  supportsFunctionality(functionalityId: string): boolean;
  /**
   * Get modality configuration object
   * @returns Modality configuration
   */
  getConfig(): Modality;
}
/**
 * Factory function to create modality instances
 * @param config - Modality configuration
 * @returns Modality instance
 */
export declare function createModality(config: Modality): Modality;
/**
 * Modality registry for managing all available modalities
 */
export declare class ModalityRegistry {
  private modalities;
  constructor();
  /**
   * Register default modalities
   */
  private registerDefaultModalities;
  /**
   * Register a new modality
   * @param modality - The modality to register
   */
  registerModality(modality: Modality): void;
  /**
   * Unregister a modality
   * @param modalityId - The ID of the modality to unregister
   */
  unregisterModality(modalityId: string): void;
  /**
   * Get a modality by ID
   * @param modalityId - The ID of the modality to get
   * @returns The modality or undefined if not found
   */
  getModality(modalityId: string): Modality | undefined;
  /**
   * Get all registered modalities
   * @returns Array of all registered modalities
   */
  getAllModalities(): Modality[];
  /**
   * Get enabled modalities
   * @returns Array of enabled modalities
   */
  getEnabledModalities(): Modality[];
  /**
   * Get modalities that support a specific functionality
   * @param functionalityId - The functionality ID to check
   * @returns Array of modalities that support the functionality
   */
  getModalitiesForFunctionality(functionalityId: string): Modality[];
  /**
   * Get modalities that support a specific file extension
   * @param extension - The file extension to check
   * @returns Array of modalities that support the extension
   */
  getModalitiesForFileExtension(extension: string): Modality[];
  /**
   * Check if a file is supported by any modality
   * @param file - The file to check
   * @returns Array of modalities that support the file
   */
  getModalitiesForFile(file: File): Modality[];
}
/**
 * File utility functions
 */
/**
 * Format file size in human-readable format
 * @param bytes - File size in bytes
 * @returns Formatted file size string
 */
export declare function formatFileSize(bytes: number): string;
/**
 * Format duration in human-readable format
 * @param seconds - Duration in seconds
 * @returns Formatted duration string
 */
export declare function formatDuration(seconds?: number): string;
/**
 * Get file extension from filename
 * @param filename - The filename to extract extension from
 * @returns File extension with dot (e.g., '.jpg')
 */
export declare function getFileExtension(filename: string): string;
/**
 * Check if a file is an image
 * @param file - File to check
 * @returns True if file is an image
 */
export declare function isImageFile(file: File): boolean;
/**
 * Check if a file is an audio file
 * @param file - File to check
 * @returns True if file is an audio file
 */
export declare function isAudioFile(file: File): boolean;
/**
 * Check if a file is a video file
 * @param file - File to check
 * @returns True if file is a video file
 */
export declare function isVideoFile(file: File): boolean;
/**
 * Check if a file is a text file
 * @param file - File to check
 * @returns True if file is a text file
 */
export declare function isTextFile(file: File): boolean;

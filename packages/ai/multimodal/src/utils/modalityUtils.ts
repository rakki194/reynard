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
   * Get supported MIME types for this modality
   * @returns Array of supported MIME types
   */
  getSupportedMimeTypes(): string[] {
    // Default MIME type mapping based on file extensions
    const mimeMap: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".bmp": "image/bmp",
      ".tiff": "image/tiff",
      ".svg": "image/svg+xml",
      ".mp4": "video/mp4",
      ".avi": "video/x-msvideo",
      ".mov": "video/quicktime",
      ".mkv": "video/x-matroska",
      ".webm": "video/webm",
      ".flv": "video/x-flv",
      ".wmv": "video/x-ms-wmv",
      ".m4v": "video/x-m4v",
      ".mp3": "audio/mpeg",
      ".wav": "audio/wav",
      ".flac": "audio/flac",
      ".aac": "audio/aac",
      ".ogg": "audio/ogg",
      ".m4a": "audio/mp4",
      ".wma": "audio/x-ms-wma",
      ".opus": "audio/opus",
      ".txt": "text/plain",
      ".md": "text/markdown",
      ".json": "application/json",
      ".xml": "application/xml",
      ".html": "text/html",
      ".css": "text/css",
      ".js": "application/javascript",
      ".ts": "application/typescript",
      ".tsx": "application/typescript",
      ".pdf": "application/pdf",
      ".doc": "application/msword",
      ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ".xls": "application/vnd.ms-excel",
      ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ".ppt": "application/vnd.ms-powerpoint",
      ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    };

    return this.fileExtensions.map(ext => mimeMap[ext.toLowerCase()]).filter(Boolean) as string[];
  }

  /**
   * Get supported functionalities for this modality
   * @returns Array of supported functionalities
   */
  getSupportedFunctionalities(): string[] {
    return [...this.supportedFunctionalities];
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
   * @returns The modality or null if not found
   */
  getModality(modalityId: string): Modality | null {
    return this.modalities.get(modalityId) || null;
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
 * Modality Manager for managing modality instances
 */
export class ModalityManager {
  private registry: ModalityRegistry;

  constructor() {
    this.registry = new ModalityRegistry();
  }

  /**
   * Get the modality registry
   * @returns The modality registry
   */
  getRegistry(): ModalityRegistry {
    return this.registry;
  }

  /**
   * Register a modality
   * @param modality - The modality to register
   */
  registerModality(modality: Modality) {
    this.registry.registerModality(modality);
  }

  /**
   * Get a modality by ID
   * @param modalityId - The modality ID
   * @returns The modality or undefined
   */
  getModality(modalityId: string): Modality | undefined {
    return this.registry.getModality(modalityId);
  }

  /**
   * Get all modalities
   * @returns Array of all modalities
   */
  getAllModalities(): Modality[] {
    return this.registry.getAllModalities();
  }

  /**
   * Get enabled modalities
   * @returns Array of enabled modalities
   */
  getEnabledModalities(): Modality[] {
    return this.registry.getEnabledModalities();
  }

  /**
   * Get modality count
   * @returns Number of registered modalities
   */
  getModalityCount(): number {
    return this.registry.getAllModalities().length;
  }

  /**
   * Unregister a modality
   * @param modalityId - The modality ID to unregister
   */
  unregisterModality(modalityId: string) {
    this.registry.unregisterModality(modalityId);
  }

  /**
   * Detect file modality using the registry
   * @param file - The file to detect modality for
   * @returns The detected modality or null
   */
  detectFileModality(file: File): Modality | null {
    const modalities = this.registry.getModalitiesForFile(file);
    return modalities.length > 0 ? modalities[0] : null;
  }

  /**
   * Get all supported file extensions
   * @returns Array of all supported extensions
   */
  getAllSupportedExtensions(): string[] {
    const extensions = new Set<string>();
    this.registry.getAllModalities().forEach(modality => {
      modality.fileExtensions.forEach(ext => extensions.add(ext));
    });
    return Array.from(extensions);
  }

  /**
   * Get supported extensions for a specific modality
   * @param modalityId - The modality ID
   * @returns Array of supported extensions
   */
  getSupportedExtensions(modalityId: string): string[] {
    const modality = this.registry.getModality(modalityId);
    return modality ? modality.fileExtensions : [];
  }
}

/**
 * Detect the modality of a file
 * @param file - The file to detect modality for
 * @param manager - Optional modality manager for advanced detection
 * @returns The detected modality or null if not found
 */
export function detectFileModality(file: File, manager?: ModalityManager): Modality | null {
  // If manager is provided, use it for detection
  if (manager) {
    return manager.detectFileModality(file);
  }

  // Fallback to simple file extension detection
  if (isImageFile(file)) {
    return {
      id: "image",
      name: "Image",
      icon: "image",
      description: "Image files",
      enabled: true,
      fileExtensions: [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".tiff", ".svg"],
      supportedFunctionalities: ["view", "edit", "annotate"],
      component: null,
      validateFile: () => true,
      getSupportedFileTypes: () => [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".tiff", ".svg"],
    };
  }

  if (isVideoFile(file)) {
    return {
      id: "video",
      name: "Video",
      icon: "video",
      description: "Video files",
      enabled: true,
      fileExtensions: [".mp4", ".avi", ".mov", ".mkv", ".webm", ".flv", ".wmv", ".m4v"],
      supportedFunctionalities: ["view", "edit"],
      component: null,
      validateFile: () => true,
      getSupportedFileTypes: () => [".mp4", ".avi", ".mov", ".mkv", ".webm", ".flv", ".wmv", ".m4v"],
    };
  }

  if (isAudioFile(file)) {
    return {
      id: "audio",
      name: "Audio",
      icon: "audio",
      description: "Audio files",
      enabled: true,
      fileExtensions: [".mp3", ".wav", ".flac", ".aac", ".ogg", ".m4a", ".wma", ".opus"],
      supportedFunctionalities: ["view", "edit"],
      component: null,
      validateFile: () => true,
      getSupportedFileTypes: () => [".mp3", ".wav", ".flac", ".aac", ".ogg", ".m4a", ".wma", ".opus"],
    };
  }

  if (isTextFile(file)) {
    return {
      id: "text",
      name: "Text",
      icon: "text",
      description: "Text files",
      enabled: true,
      fileExtensions: [".txt", ".md", ".json", ".xml", ".html", ".css", ".js", ".ts", ".tsx"],
      supportedFunctionalities: ["view", "edit"],
      component: null,
      validateFile: () => true,
      getSupportedFileTypes: () => [".txt", ".md", ".json", ".xml", ".html", ".css", ".js", ".ts", ".tsx"],
    };
  }

  // Check for document types
  const docExtensions = [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx"];
  if (docExtensions.includes(getFileExtension(file.name))) {
    return {
      id: "document",
      name: "Document",
      icon: "document",
      description: "Document files",
      enabled: true,
      fileExtensions: docExtensions,
      supportedFunctionalities: ["view"],
      component: null,
      validateFile: () => true,
      getSupportedFileTypes: () => docExtensions,
    };
  }

  return null;
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

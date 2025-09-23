/**
 * Gallery-dl Types
 *
 * Type definitions for the gallery-dl package.
 */

export type DownloadStatus = 'pending' | 'downloading' | 'completed' | 'error' | 'cancelled';

export type ExtractorCategory = 'image' | 'video' | 'audio' | 'document' | 'other';

export type PostProcessorType = 'metadata' | 'resize' | 'compress' | 'watermark';

export type FileType = 'image' | 'video' | 'audio' | 'document' | 'other';

export interface DownloadOptions {
  outputDirectory?: string;
  filename?: string;
  maxConcurrent?: number;
  retries?: number;
  timeout?: number;
  minFileSize?: number;
  maxFileSize?: number;
  allowedExtensions?: string[];
  blockedExtensions?: string[];
  postprocessors?: PostProcessorType[];
  skipExisting?: boolean;
  skipDuplicates?: boolean;
  extractorOptions?: Record<string, any>;
  userAgent?: string;
  cookies?: string;
  headers?: Record<string, string>;
  proxy?: string;
}
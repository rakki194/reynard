/**
 * Gallery Service
 *
 * Service for managing gallery downloads and operations.
 */
import { ConnectionManager } from "reynard-connection";

export interface GalleryServiceConfig {
  name: string;
  baseUrl: string;
  timeout: number;
  token?: string;
}

export interface DownloadRequest {
  url: string;
  options?: Record<string, any>;
}

export interface DownloadResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export interface ExtractorInfo {
  name: string;
  category: string;
  subcategory?: string;
  patterns: string[];
  description?: string;
  features?: string[];
}

export interface ValidationResponse {
  isValid: boolean;
  extractor?: ExtractorInfo;
  error?: string;
}

export interface BatchDownloadRequest {
  urls: string[];
  options?: Record<string, any>;
}

export interface BatchDownloadResponse {
  success: boolean;
  results: DownloadResponse[];
  error?: string;
}

export class GalleryService {
  private connection: ConnectionManager;

  constructor(config: GalleryServiceConfig) {
    this.connection = new ConnectionManager({
      url: config.baseUrl,
      timeout: config.timeout,
      token: config.token,
    });
  }

  async getExtractors(): Promise<{ success: boolean; data?: ExtractorInfo[]; error?: string }> {
    try {
      const response = await this.connection.request({
        method: 'GET',
        path: '/api/gallery/extractors',
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get extractors' 
      };
    }
  }

  async validateUrl(url: string): Promise<ValidationResponse> {
    try {
      const response = await this.connection.request({
        method: 'POST',
        path: '/api/gallery/validate',
        data: { url },
      });
      return response.data;
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Validation failed',
      };
    }
  }

  async downloadGallery(url: string, options: Record<string, any> = {}): Promise<DownloadResponse> {
    try {
      const response = await this.connection.request({
        method: 'POST',
        path: '/api/gallery/download',
        data: { url, options },
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Download failed',
      };
    }
  }

  async batchDownload(request: BatchDownloadRequest): Promise<BatchDownloadResponse> {
    try {
      const response = await this.connection.request({
        method: 'POST',
        path: '/api/gallery/batch-download',
        data: request,
      });
      return { success: true, results: response.data };
    } catch (error) {
      return {
        success: false,
        results: [],
        error: error instanceof Error ? error.message : 'Batch download failed',
      };
    }
  }
}
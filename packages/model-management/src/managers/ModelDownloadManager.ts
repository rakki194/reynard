/**
 * Model Download Manager
 * 
 * Handles model downloading with progress tracking and concurrent download management.
 */

import { ModelDownloadManager as IModelDownloadManager, ModelDownloadProgress, ModelStatus } from '../types/index.js';
import { ModelRegistry } from './ModelRegistry.js';

export class ModelDownloadManager implements IModelDownloadManager {
  private _registry: ModelRegistry;
  private _downloadProgress: Map<string, ModelDownloadProgress> = new Map();
  private _activeDownloads: Map<string, Promise<void>> = new Map();
  private _maxConcurrentDownloads: number = 3;
  private _downloadTimeout: number = 300000; // 5 minutes

  constructor(registry: ModelRegistry, maxConcurrentDownloads = 3, downloadTimeout = 300000) {
    this._registry = registry;
    this._maxConcurrentDownloads = maxConcurrentDownloads;
    this._downloadTimeout = downloadTimeout;
  }

  async downloadModel(modelId: string, progressCallback?: (progress: ModelDownloadProgress) => void): Promise<void> {
    // Check if model is registered
    const modelInfo = this._registry.getModelInfo(modelId);
    if (!modelInfo) {
      throw new Error(`Model ${modelId} is not registered`);
    }

    // Check if already downloading
    if (this._activeDownloads.has(modelId)) {
      return this._activeDownloads.get(modelId);
    }

    // Check if already downloaded
    if (this.isDownloaded(modelId)) {
      return;
    }

    // Check concurrent download limit
    if (this._activeDownloads.size >= this._maxConcurrentDownloads) {
      throw new Error(`Maximum concurrent downloads (${this._maxConcurrentDownloads}) reached`);
    }

    // Initialize progress tracking
    const progress: ModelDownloadProgress = {
      modelId,
      status: ModelStatus.DOWNLOADING,
      progress: 0,
      downloadedBytes: 0,
      totalBytes: modelInfo.totalSizeEstimate,
      startTime: new Date()
    };
    this._downloadProgress.set(modelId, progress);

    // Create download promise
    const downloadPromise = this._performDownload(modelId, modelInfo, progress, progressCallback);
    this._activeDownloads.set(modelId, downloadPromise);

    try {
      await downloadPromise;
    } finally {
      this._activeDownloads.delete(modelId);
    }
  }

  cancelDownload(modelId: string): void {
    const progress = this._downloadProgress.get(modelId);
    if (progress && progress.status === ModelStatus.DOWNLOADING) {
      progress.status = ModelStatus.ERROR;
      progress.error = 'Download cancelled';
      this._downloadProgress.set(modelId, progress);
    }
  }

  getDownloadProgress(modelId: string): ModelDownloadProgress | undefined {
    const progress = this._downloadProgress.get(modelId);
    return progress ? { ...progress } : undefined;
  }

  getAllDownloadProgress(): Record<string, ModelDownloadProgress> {
    const result: Record<string, ModelDownloadProgress> = {};
    for (const [modelId, progress] of this._downloadProgress) {
      result[modelId] = { ...progress };
    }
    return result;
  }

  isDownloading(modelId: string): boolean {
    const progress = this._downloadProgress.get(modelId);
    return progress?.status === ModelStatus.DOWNLOADING;
  }

  isDownloaded(modelId: string): boolean {
    const progress = this._downloadProgress.get(modelId);
    return progress?.status === ModelStatus.DOWNLOADED;
  }

  private async _performDownload(
    modelId: string,
    modelInfo: any,
    progress: ModelDownloadProgress,
    progressCallback?: (progress: ModelDownloadProgress) => void
  ): Promise<void> {
    try {
      // Simulate download process
      // In a real implementation, this would use actual download logic
      const totalFiles = modelInfo.fileCountEstimate;
      const bytesPerFile = modelInfo.totalSizeEstimate / totalFiles;

      for (let i = 0; i < totalFiles; i++) {
        // Check if download was cancelled
        if (progress.status === ModelStatus.ERROR) {
          throw new Error('Download cancelled');
        }

        // Simulate file download
        progress.currentFile = `file_${i + 1}.bin`;
        progress.downloadedBytes += bytesPerFile;
        progress.progress = Math.round((progress.downloadedBytes / progress.totalBytes) * 100);

        // Calculate estimated time remaining
        if (progress.startTime) {
          const elapsed = Date.now() - progress.startTime.getTime();
          const rate = progress.downloadedBytes / elapsed;
          const remaining = progress.totalBytes - progress.downloadedBytes;
          progress.estimatedTimeRemaining = Math.round(remaining / rate);
        }

        this._downloadProgress.set(modelId, { ...progress });

        // Call progress callback
        if (progressCallback) {
          progressCallback({ ...progress });
        }

        // Simulate download time
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Mark as downloaded
      progress.status = ModelStatus.DOWNLOADED;
      progress.progress = 100;
      progress.currentFile = undefined;
      progress.estimatedTimeRemaining = 0;
      this._downloadProgress.set(modelId, progress);

      if (progressCallback) {
        progressCallback({ ...progress });
      }

    } catch (error) {
      progress.status = ModelStatus.ERROR;
      progress.error = error instanceof Error ? error.message : String(error);
      this._downloadProgress.set(modelId, progress);

      if (progressCallback) {
        progressCallback({ ...progress });
      }

      throw error;
    }
  }

  // Utility methods
  getActiveDownloadCount(): number {
    return this._activeDownloads.size;
  }

  getMaxConcurrentDownloads(): number {
    return this._maxConcurrentDownloads;
  }

  setMaxConcurrentDownloads(max: number): void {
    this._maxConcurrentDownloads = max;
  }

  getDownloadTimeout(): number {
    return this._downloadTimeout;
  }

  setDownloadTimeout(timeout: number): void {
    this._downloadTimeout = timeout;
  }

  clearProgress(modelId: string): void {
    this._downloadProgress.delete(modelId);
  }

  clearAllProgress(): void {
    this._downloadProgress.clear();
  }

  // Statistics
  getDownloadStatistics(): {
    totalDownloads: number;
    activeDownloads: number;
    completedDownloads: number;
    failedDownloads: number;
    totalBytesDownloaded: number;
  } {
    let completedDownloads = 0;
    let failedDownloads = 0;
    let totalBytesDownloaded = 0;

    for (const progress of this._downloadProgress.values()) {
      if (progress.status === ModelStatus.DOWNLOADED) {
        completedDownloads++;
        totalBytesDownloaded += progress.downloadedBytes;
      } else if (progress.status === ModelStatus.ERROR) {
        failedDownloads++;
      }
    }

    return {
      totalDownloads: this._downloadProgress.size,
      activeDownloads: this._activeDownloads.size,
      completedDownloads,
      failedDownloads,
      totalBytesDownloaded
    };
  }
}

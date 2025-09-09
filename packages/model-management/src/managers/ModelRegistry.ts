/**
 * Model Registry
 *
 * Manages model registration and discovery.
 */

import {
  ModelRegistry as IModelRegistry,
  ModelInfo,
  ModelType,
} from "../types/index.js";

export class ModelRegistry implements IModelRegistry {
  private _models: Map<string, ModelInfo> = new Map();

  registerModel(modelInfo: ModelInfo): void {
    if (this._models.has(modelInfo.modelId)) {
      console.warn(
        `Model '${modelInfo.modelId}' is already registered, overwriting`,
      );
    }

    this._models.set(modelInfo.modelId, { ...modelInfo });
  }

  unregisterModel(modelId: string): void {
    this._models.delete(modelId);
  }

  getModelInfo(modelId: string): ModelInfo | undefined {
    const info = this._models.get(modelId);
    return info ? { ...info } : undefined;
  }

  getAllModelInfo(): ModelInfo[] {
    return Array.from(this._models.values()).map((info) => ({ ...info }));
  }

  isModelRegistered(modelId: string): boolean {
    return this._models.has(modelId);
  }

  getModelsByType(modelType: ModelType): ModelInfo[] {
    return Array.from(this._models.values())
      .filter((info) => info.modelType === modelType)
      .map((info) => ({ ...info }));
  }

  getRegisteredModelIds(): string[] {
    return Array.from(this._models.keys());
  }

  getModelCount(): number {
    return this._models.size;
  }

  getModelCountByType(modelType: ModelType): number {
    return Array.from(this._models.values()).filter(
      (info) => info.modelType === modelType,
    ).length;
  }

  clear(): void {
    this._models.clear();
  }

  // Utility methods for model discovery
  searchModels(query: string): ModelInfo[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this._models.values())
      .filter(
        (info) =>
          info.modelId.toLowerCase().includes(lowerQuery) ||
          info.description.toLowerCase().includes(lowerQuery) ||
          info.repoId.toLowerCase().includes(lowerQuery) ||
          (info.tags &&
            info.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))),
      )
      .map((info) => ({ ...info }));
  }

  getModelsByTag(tag: string): ModelInfo[] {
    return Array.from(this._models.values())
      .filter((info) => info.tags && info.tags.includes(tag))
      .map((info) => ({ ...info }));
  }

  getModelsBySize(minSize?: number, maxSize?: number): ModelInfo[] {
    return Array.from(this._models.values())
      .filter((info) => {
        if (minSize !== undefined && info.totalSizeEstimate < minSize)
          return false;
        if (maxSize !== undefined && info.totalSizeEstimate > maxSize)
          return false;
        return true;
      })
      .map((info) => ({ ...info }));
  }

  // Model validation
  validateModelInfo(modelInfo: ModelInfo): string[] {
    const errors: string[] = [];

    if (!modelInfo.modelId || modelInfo.modelId.trim() === "") {
      errors.push("Model ID is required");
    }

    if (!modelInfo.repoId || modelInfo.repoId.trim() === "") {
      errors.push("Repository ID is required");
    }

    if (!modelInfo.description || modelInfo.description.trim() === "") {
      errors.push("Description is required");
    }

    if (modelInfo.totalSizeEstimate <= 0) {
      errors.push("Total size estimate must be greater than 0");
    }

    if (modelInfo.fileCountEstimate <= 0) {
      errors.push("File count estimate must be greater than 0");
    }

    if (!Object.values(ModelType).includes(modelInfo.modelType)) {
      errors.push("Invalid model type");
    }

    return errors;
  }

  // Bulk operations
  registerModels(modelInfos: ModelInfo[]): void {
    for (const modelInfo of modelInfos) {
      const errors = this.validateModelInfo(modelInfo);
      if (errors.length > 0) {
        console.warn(
          `Skipping invalid model ${modelInfo.modelId}: ${errors.join(", ")}`,
        );
        continue;
      }
      this.registerModel(modelInfo);
    }
  }

  unregisterModels(modelIds: string[]): void {
    for (const modelId of modelIds) {
      this.unregisterModel(modelId);
    }
  }

  // Export/Import
  exportModels(): ModelInfo[] {
    return this.getAllModelInfo();
  }

  importModels(modelInfos: ModelInfo[], overwrite = false): void {
    for (const modelInfo of modelInfos) {
      if (!overwrite && this.isModelRegistered(modelInfo.modelId)) {
        console.warn(`Model ${modelInfo.modelId} already registered, skipping`);
        continue;
      }

      const errors = this.validateModelInfo(modelInfo);
      if (errors.length > 0) {
        console.warn(
          `Skipping invalid model ${modelInfo.modelId}: ${errors.join(", ")}`,
        );
        continue;
      }

      this.registerModel(modelInfo);
    }
  }
}

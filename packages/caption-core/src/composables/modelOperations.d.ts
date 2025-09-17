/**
 * Model Operations Utilities
 *
 * Utility functions for model loading and unloading operations.
 * Extracted to keep composables under the 140-line limit.
 */
import type { ModelInfo } from "./modelData";
/**
 * Updates model loading state
 */
export declare const updateModelLoadingState: (models: ModelInfo[], modelName: string, isLoading: boolean) => ModelInfo[];
/**
 * Creates error message for model operations
 */
export declare const createModelErrorMessage: (operation: string, modelName: string, error: unknown) => string;
/**
 * Creates initialization error message
 */
export declare const createInitErrorMessage: (error: unknown) => string;
/**
 * Creates model data error message
 */
export declare const createModelDataErrorMessage: (error: unknown) => string;

/**
 * Model Operations Utilities
 *
 * Utility functions for model loading and unloading operations.
 * Extracted to keep composables under the 140-line limit.
 */
/**
 * Updates model loading state
 */
export const updateModelLoadingState = (models, modelName, isLoading) => {
    return models.map(model => (model.name === modelName ? { ...model, isLoading } : model));
};
/**
 * Creates error message for model operations
 */
export const createModelErrorMessage = (operation, modelName, error) => {
    return `Failed to ${operation} model ${modelName}: ${error instanceof Error ? error.message : "Unknown error"}`;
};
/**
 * Creates initialization error message
 */
export const createInitErrorMessage = (error) => {
    return `Failed to initialize model manager: ${error instanceof Error ? error.message : "Unknown error"}`;
};
/**
 * Creates model data error message
 */
export const createModelDataErrorMessage = (error) => {
    return `Failed to load model data: ${error instanceof Error ? error.message : "Unknown error"}`;
};

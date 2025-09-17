/**
 * Model Data Utilities
 *
 * Utility functions for managing model information and system statistics.
 * Extracted to keep composables under the 140-line limit.
 */
/**
 * Creates the default model information array
 */
export const createDefaultModels = (loadedModels) => [
    {
        name: "jtp2",
        displayName: "JTP2 (Furry Tags)",
        description: "Specialized for furry and anthropomorphic content",
        isLoaded: loadedModels.includes("jtp2"),
        isLoading: false,
        healthStatus: "healthy",
        usageStats: undefined,
    },
    {
        name: "joycaption",
        displayName: "JoyCaption (Detailed)",
        description: "Detailed descriptive captions",
        isLoaded: loadedModels.includes("joycaption"),
        isLoading: false,
        healthStatus: "healthy",
        usageStats: undefined,
    },
    {
        name: "wdv3",
        displayName: "WDv3 (Anime Tags)",
        description: "Anime and manga style tags",
        isLoaded: loadedModels.includes("wdv3"),
        isLoading: false,
        healthStatus: "healthy",
        usageStats: undefined,
    },
    {
        name: "florence2",
        displayName: "Florence2 (General)",
        description: "General purpose image captions",
        isLoaded: loadedModels.includes("florence2"),
        isLoading: false,
        healthStatus: "healthy",
        usageStats: undefined,
    },
];
/**
 * Extracts loaded models from system statistics
 */
export const extractLoadedModels = (systemStats) => {
    return Array.isArray(systemStats.loadedModels) ? systemStats.loadedModels : [];
};
/**
 * Creates model status mapping from loaded models
 */
export const createModelStatusMap = (loadedModels) => {
    return loadedModels.reduce((acc, model) => {
        acc[model] = true;
        return acc;
    }, {});
};

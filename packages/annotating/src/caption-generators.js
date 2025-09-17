/**
 * Caption generation utilities for different model types
 *
 * These functions provide specialized caption generation for various use cases:
 * - Furry tags (JTP2 model)
 * - Detailed descriptions (JoyCaption model)
 * - Anime tags (WDV3 model)
 * - General captions (Florence2 model)
 */
/**
 * Generate furry tags using JTP2 model
 */
export async function generateFurryTags(manager, imagePath, config) {
    const service = manager.getService();
    const task = {
        imagePath,
        generatorName: "jtp2",
        config: config || {},
    };
    return service.generateCaption(task);
}
/**
 * Generate detailed caption using JoyCaption model
 */
export async function generateDetailedCaption(manager, imagePath, config) {
    const service = manager.getService();
    const task = {
        imagePath,
        generatorName: "joycaption",
        config: config || {},
    };
    return service.generateCaption(task);
}
/**
 * Generate anime tags using WDV3 model
 */
export async function generateAnimeTags(manager, imagePath, config) {
    const service = manager.getService();
    const task = {
        imagePath,
        generatorName: "wdv3",
        config: config || {},
    };
    return service.generateCaption(task);
}
/**
 * Generate general caption using Florence2 model
 */
export async function generateGeneralCaption(manager, imagePath, config) {
    const service = manager.getService();
    const task = {
        imagePath,
        generatorName: "florence2",
        config: config || {},
    };
    return service.generateCaption(task);
}

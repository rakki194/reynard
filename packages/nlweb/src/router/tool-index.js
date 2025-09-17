/**
 * Tool Index Management
 *
 * Manages the indexing of tools by category and tags for efficient lookups.
 */
/**
 * Update category index when registering a tool
 */
export function addToCategoryIndex(toolsByCategory, tool) {
    if (!toolsByCategory.has(tool.category)) {
        toolsByCategory.set(tool.category, new Set());
    }
    toolsByCategory.get(tool.category).add(tool.name);
}
/**
 * Update tag index when registering a tool
 */
export function addToTagIndex(toolsByTag, tool) {
    for (const tag of tool.tags) {
        if (!toolsByTag.has(tag)) {
            toolsByTag.set(tag, new Set());
        }
        toolsByTag.get(tag).add(tool.name);
    }
}
/**
 * Remove from category index when unregistering a tool
 */
export function removeFromCategoryIndex(toolsByCategory, tool) {
    const categorySet = toolsByCategory.get(tool.category);
    if (categorySet) {
        categorySet.delete(tool.name);
        if (categorySet.size === 0) {
            toolsByCategory.delete(tool.category);
        }
    }
}
/**
 * Remove from tag index when unregistering a tool
 */
export function removeFromTagIndex(toolsByTag, tool) {
    for (const tag of tool.tags) {
        const tagSet = toolsByTag.get(tag);
        if (tagSet) {
            tagSet.delete(tool.name);
            if (tagSet.size === 0) {
                toolsByTag.delete(tag);
            }
        }
    }
}

/**
 * Tool Statistics
 *
 * Provides statistics and analytics for tool registries.
 */
/**
 * Calculate tool statistics
 */
export function calculateToolStats(tools, toolsByCategory, toolsByTag) {
    const toolsByCategoryRecord = {};
    for (const [category, toolNames] of toolsByCategory) {
        toolsByCategoryRecord[category] = toolNames.size;
    }
    const toolsByTagRecord = {};
    for (const [tag, toolNames] of toolsByTag) {
        toolsByTagRecord[tag] = toolNames.size;
    }
    return {
        totalTools: tools.length,
        toolsByCategory: toolsByCategoryRecord,
        toolsByTag: toolsByTagRecord,
    };
}

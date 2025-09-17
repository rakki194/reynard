/**
 * Tool Searcher
 *
 * Provides search functionality for finding tools based on various criteria.
 */
/**
 * Search tools by query
 */
export function searchTools(tools, query) {
    const normalizedQuery = query.toLowerCase();
    const results = [];
    for (const tool of tools) {
        if (!tool.enabled) {
            continue;
        }
        // Check name match
        if (tool.name.toLowerCase().includes(normalizedQuery)) {
            results.push(tool);
            continue;
        }
        // Check description match
        if (tool.description.toLowerCase().includes(normalizedQuery)) {
            results.push(tool);
            continue;
        }
        // Check tag match
        if (tool.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery))) {
            results.push(tool);
            continue;
        }
        // Check example match
        if (tool.examples.some((example) => example.toLowerCase().includes(normalizedQuery))) {
            results.push(tool);
            continue;
        }
    }
    // Sort by priority (higher priority first)
    return results.sort((a, b) => b.priority - a.priority);
}
/**
 * Get tools by tags with intersection logic
 */
export function getToolsByTags(tools, tags) {
    if (tags.length === 0) {
        return tools;
    }
    // Find tools that have all the specified tags
    const matchingTools = [];
    for (const tool of tools) {
        const hasAllTags = tags.every((tag) => tool.tags.includes(tag));
        if (hasAllTags) {
            matchingTools.push(tool);
        }
    }
    return matchingTools;
}
/**
 * Get tools by category
 */
export function getToolsByCategory(tools, category) {
    return tools.filter((tool) => tool.category === category);
}

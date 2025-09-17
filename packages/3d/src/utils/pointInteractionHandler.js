/**
 * Handles point interaction logic for clicks and hover effects
 * Follows the 50-line axiom for focused responsibility
 */
export function createPointInteractionHandler() {
    const handlePointClick = (intersects, points, onPointSelect) => {
        if (intersects.length === 0)
            return;
        const intersect = intersects[0];
        const pointIndex = intersect.index;
        if (pointIndex !== undefined && points[pointIndex]) {
            const point = points[pointIndex];
            onPointSelect?.(point.id);
        }
    };
    const handlePointHover = (pointId, config) => {
        const configObj = config;
        if (!configObj.enableHighlighting)
            return;
        // Implementation for highlighting
        // This will be expanded based on specific highlighting requirements
    };
    const handlePointLeave = (config) => {
        const configObj = config;
        if (!configObj.enableHighlighting)
            return;
        // Implementation for removing highlight
        // This will be expanded based on specific highlighting requirements
    };
    return {
        handlePointClick,
        handlePointHover,
        handlePointLeave,
    };
}

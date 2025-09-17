// Point cloud size calculation utilities
// Extracted from usePointCloud for modularity
/**
 * Calculate point sizes based on different strategies
 */
export function calculatePointSizes(points, strategy = "uniform", baseSize = 2) {
    return points.map((point) => {
        let size = baseSize;
        switch (strategy) {
            case "importance":
                size = (point.importance || 0.5) * baseSize * 2;
                break;
            case "confidence":
                const confidence = point.confidence || 0.5;
                size = confidence * baseSize * 2;
                break;
            case "uniform":
                size = baseSize;
                break;
        }
        return { ...point, size };
    });
}

import { applyEasing } from "./easing";
/**
 * Interpolate a single point based on animation state
 */
export function interpolatePoint(point, pointAnim, animationState) {
    const progress = Math.max(0, animationState.progress - pointAnim.delay / animationState.duration);
    const easedProgress = applyEasing(Math.max(0, Math.min(1, progress)), animationState.easing);
    return {
        ...point,
        position: [
            pointAnim.startPosition[0] +
                (pointAnim.endPosition[0] - pointAnim.startPosition[0]) * easedProgress,
            pointAnim.startPosition[1] +
                (pointAnim.endPosition[1] - pointAnim.startPosition[1]) * easedProgress,
            pointAnim.startPosition[2] +
                (pointAnim.endPosition[2] - pointAnim.startPosition[2]) * easedProgress,
        ],
        color: [
            pointAnim.startColor[0] +
                (pointAnim.endColor[0] - pointAnim.startColor[0]) * easedProgress,
            pointAnim.startColor[1] +
                (pointAnim.endColor[1] - pointAnim.startColor[1]) * easedProgress,
            pointAnim.startColor[2] +
                (pointAnim.endColor[2] - pointAnim.startColor[2]) * easedProgress,
        ],
        size: pointAnim.startSize +
            (pointAnim.endSize - pointAnim.startSize) * easedProgress,
    };
}
/**
 * Create point animations from start and end points
 */
export function createPointAnimations(startPoints, endPoints) {
    return startPoints.map((startPoint) => {
        const endPoint = endPoints.find((p) => p.id === startPoint.id) || startPoint;
        return {
            id: startPoint.id,
            startPosition: startPoint.position,
            endPosition: endPoint.position,
            startColor: startPoint.color || [1, 1, 1],
            endColor: endPoint.color || [1, 1, 1],
            startSize: startPoint.size || 1,
            endSize: endPoint.size || 1,
            delay: Math.random() * 200,
        };
    });
}

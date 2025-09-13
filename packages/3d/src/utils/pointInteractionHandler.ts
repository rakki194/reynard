import type { EmbeddingPoint } from "../types/rendering";

/**
 * Handles point interaction logic for clicks and hover effects
 * Follows the 50-line axiom for focused responsibility
 */
export function createPointInteractionHandler() {
  const handlePointClick = (
    intersects: unknown[],
    points: EmbeddingPoint[],
    onPointSelect?: (pointId: string) => void,
  ): void => {
    if (intersects.length === 0) return;

    const intersect = intersects[0] as { index?: number };
    const pointIndex = intersect.index;

    if (pointIndex !== undefined && points[pointIndex]) {
      const point = points[pointIndex];
      onPointSelect?.(point.id);
    }
  };

  const handlePointHover = (pointId: string, config: unknown): void => {
    const configObj = config as { enableHighlighting?: boolean };
    if (!configObj.enableHighlighting) return;
    // Implementation for highlighting
    // This will be expanded based on specific highlighting requirements
  };

  const handlePointLeave = (config: unknown): void => {
    const configObj = config as { enableHighlighting?: boolean };
    if (!configObj.enableHighlighting) return;
    // Implementation for removing highlight
    // This will be expanded based on specific highlighting requirements
  };

  return {
    handlePointClick,
    handlePointHover,
    handlePointLeave,
  };
}

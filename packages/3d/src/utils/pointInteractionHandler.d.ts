import type { EmbeddingPoint } from "../types/rendering";
/**
 * Handles point interaction logic for clicks and hover effects
 * Follows the 50-line axiom for focused responsibility
 */
export declare function createPointInteractionHandler(): {
    handlePointClick: (intersects: unknown[], points: EmbeddingPoint[], onPointSelect?: (pointId: string) => void) => void;
    handlePointHover: (pointId: string, config: unknown) => void;
    handlePointLeave: (config: unknown) => void;
};

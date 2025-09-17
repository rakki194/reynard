/**
 * Panel Constraints Types
 *
 * Constraint types for floating panels.
 */
export interface PanelConstraints {
    minX?: number;
    maxX?: number;
    minY?: number;
    maxY?: number;
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
}
export type PanelSnapPoints = Array<{
    left: number;
    top: number;
}>;

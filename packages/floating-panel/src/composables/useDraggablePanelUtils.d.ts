/**
 * Draggable Panel Utils
 *
 * Utility functions for draggable panels.
 */
import type { PanelPosition, PanelConstraints, PanelSnapPoints } from "../types.js";
/**
 * Constrain position within bounds
 */
export declare function constrainPosition(position: PanelPosition, constraints?: PanelConstraints): PanelPosition;
/**
 * Snap position to nearest snap point
 */
export declare function snapToPoint(position: PanelPosition, snapPoints?: PanelSnapPoints): PanelPosition;
/**
 * Get drag state
 */
export declare function getDragState(isDragging: boolean, startPosition: PanelPosition, currentPosition: PanelPosition): {
    isDragging: boolean;
    startPosition: PanelPosition;
    currentPosition: PanelPosition;
    delta: {
        x: number;
        y: number;
    };
};

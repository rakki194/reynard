/**
 * Panel Constraints
 *
 * Constraint management for draggable/resizable panels.
 */
import type { PanelState } from "./PanelState.js";
export interface PanelConstraints {
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
    bounds?: {
        top?: number;
        right?: number;
        bottom?: number;
        left?: number;
    };
}
/**
 * Apply constraints to panel state
 */
export declare function applyConstraints(state: PanelState, constraints: PanelConstraints): PanelState;

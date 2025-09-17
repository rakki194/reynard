/**
 * Debug Panel Handlers
 *
 * Event handlers for debug panels.
 */
import type { FloatingPanelProps } from "../../types.js";
/**
 * Create debug panel handlers
 */
export declare function createDebugHandlers(props: FloatingPanelProps): {
    handleHide: () => void;
    handleDragStart: () => void;
    handleDrag: (position: {
        top: number;
        left: number;
    }) => void;
    handleDragEnd: () => void;
};

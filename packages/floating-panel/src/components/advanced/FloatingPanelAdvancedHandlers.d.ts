/**
 * Advanced Panel Handlers
 *
 * Event handlers for advanced panels.
 */
import type { FloatingPanelProps } from "../../types.js";
/**
 * Create advanced panel handlers
 */
export declare function createAdvancedHandlers(props: FloatingPanelProps): {
    handleShow: () => void;
    handleHide: () => void;
    handleDrag: (position: {
        top: number;
        left: number;
    }) => void;
    handleResize: (size: {
        width: number;
        height: number;
    }) => void;
};

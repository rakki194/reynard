/**
 * Overlay Handlers
 *
 * Event handlers for overlay manager.
 */
import type { PanelEventHandlers, FloatingPanel } from "../../types.js";
/**
 * Create overlay handlers
 */
export declare function createOverlayHandlers(eventHandlers?: PanelEventHandlers): {
    handlePanelShow: (panel: FloatingPanel) => void;
    handlePanelHide: (panel: FloatingPanel) => void;
    handlePanelDrag: (panel: FloatingPanel, position: {
        top: number;
        left: number;
    }) => void;
    handlePanelResize: (panel: FloatingPanel, size: {
        width: number;
        height: number;
    }) => void;
};

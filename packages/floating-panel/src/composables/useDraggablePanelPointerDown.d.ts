/**
 * Draggable Panel Pointer Down Handler
 *
 * Handles pointer down events for draggable panels.
 */
import type { PanelPosition, DraggablePanelCore } from "./useDraggablePanelCore.js";
export interface PointerDownHandler {
    handlePointerDown: (event: globalThis.PointerEvent) => void;
}
/**
 * Create pointer down handler
 */
export declare function createPointerDownHandler(core: DraggablePanelCore, onDragStart?: (position: PanelPosition) => void): PointerDownHandler;

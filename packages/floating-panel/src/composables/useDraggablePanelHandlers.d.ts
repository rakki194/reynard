/**
 * Draggable Panel Handlers
 *
 * Event handlers for draggable panels.
 */
import type { PanelPosition, DraggablePanelCore } from "./useDraggablePanelCore.js";
export interface DraggablePanelHandlers {
    handlePointerDown: (event: globalThis.PointerEvent) => void;
    handlePointerMove: (event: globalThis.PointerEvent) => void;
    handlePointerUp: () => void;
}
/**
 * Create draggable panel handlers
 */
export declare function createDraggablePanelHandlers(core: DraggablePanelCore, onDragStart?: (position: PanelPosition) => void, onDrag?: (position: PanelPosition) => void, onDragEnd?: (position: PanelPosition) => void): DraggablePanelHandlers;

/**
 * Draggable Panel Pointer Move Handler
 *
 * Handles pointer move events for draggable panels.
 */
import type { PanelPosition } from "../types.js";
export interface PointerMoveHandler {
    handlePointerMove: (event: globalThis.PointerEvent) => void;
}
/**
 * Create pointer move handler
 */
export declare function createPointerMoveHandler(onDrag?: (position: PanelPosition) => void): PointerMoveHandler;

/**
 * useDraggableResizable Composable
 *
 * Ported from Yipyap's sophisticated draggable/resizable panel system.
 * Provides comprehensive panel interaction capabilities.
 */
import { type PanelState } from "./draggable-resizable/PanelState.js";
import { type PanelConstraints } from "./draggable-resizable/PanelConstraints.js";
export interface DraggableResizableOptions extends PanelConstraints {
    initialState: PanelState;
    storageKey?: string;
    onStateChange?: (state: PanelState) => void;
    onDrag?: (position: {
        top: number;
        left: number;
    }) => void;
    onResize?: (size: {
        width: number;
        height: number;
    }) => void;
    onShow?: () => void;
    onHide?: () => void;
}
export interface DraggableResizableReturn {
    state: () => PanelState;
    isDragging: () => boolean;
    isResizing: () => boolean;
    isMinimized: () => boolean;
    ref: () => HTMLElement | undefined;
    setRef: (element: HTMLElement) => void;
    handleMouseDown: (e: MouseEvent, type: "drag" | "resize") => void;
    toggleMinimized: () => void;
    resetPosition: () => void;
}
export declare function useDraggableResizable(options: DraggableResizableOptions): DraggableResizableReturn;

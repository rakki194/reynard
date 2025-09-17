/**
 * Draggable Panel Composable
 *
 * Handles drag functionality for floating panels with constraints and snap points.
 * Based on Yipyap's sophisticated drag handling patterns.
 */
import { Accessor } from "solid-js";
import type { PanelPosition, PanelConstraints, PanelSnapPoints, UseFloatingPanelReturn } from "../types.js";
export interface UseDraggablePanelOptions {
    initialPosition?: PanelPosition;
    constraints?: PanelConstraints;
    snapPoints?: PanelSnapPoints;
    dragHandle?: string;
    onDragStart?: (position: PanelPosition) => void;
    onDrag?: (position: PanelPosition) => void;
    onDragEnd?: (position: PanelPosition) => void;
    enabled?: boolean;
}
export interface UseDraggablePanelReturn extends UseFloatingPanelReturn {
    dragState: () => {
        isDragging: boolean;
        startPosition: PanelPosition;
        currentPosition: PanelPosition;
        delta: {
            x: number;
            y: number;
        };
    };
    startDrag: (event: globalThis.PointerEvent) => void;
    updateDrag: (event: globalThis.PointerEvent) => void;
    endDrag: () => void;
    snapToPoint: (position: PanelPosition) => PanelPosition;
    constrainPosition: (position: PanelPosition) => PanelPosition;
}
export declare function useDraggablePanel(panelRef: Accessor<HTMLElement | undefined>, options?: UseDraggablePanelOptions): UseDraggablePanelReturn;

/**
 * Draggable Panel Core
 *
 * Core functionality for draggable panels.
 */
import { createSignal, Accessor } from "solid-js";
import type { PanelPosition, PanelConstraints, PanelSnapPoints } from "../types.js";
export interface DraggablePanelCore {
    position: ReturnType<typeof createSignal<PanelPosition>>;
    dragState: ReturnType<typeof createSignal<{
        isDragging: boolean;
        startPosition: PanelPosition;
        currentPosition: PanelPosition;
        delta: {
            x: number;
            y: number;
        };
    }>>;
    panelRef: Accessor<HTMLElement | undefined>;
    constraints?: PanelConstraints;
    snapPoints?: PanelSnapPoints;
    dragHandle?: string;
    enabled: boolean;
}
/**
 * Create draggable panel core
 */
export declare function createDraggablePanelCore(panelRef: Accessor<HTMLElement | undefined>, initialPosition: PanelPosition, constraints?: PanelConstraints, snapPoints?: PanelSnapPoints, dragHandle?: string, enabled?: boolean): DraggablePanelCore;

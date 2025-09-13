/**
 * Draggable Panel Core
 *
 * Core functionality for draggable panels.
 */

import { createSignal, Accessor } from "solid-js";
import type {
  PanelPosition,
  PanelConstraints,
  PanelSnapPoints,
} from "../types.js";

export interface DraggablePanelCore {
  position: ReturnType<typeof createSignal<PanelPosition>>;
  dragState: ReturnType<
    typeof createSignal<{
      isDragging: boolean;
      startPosition: PanelPosition;
      currentPosition: PanelPosition;
      delta: { x: number; y: number };
    }>
  >;
  panelRef: Accessor<HTMLElement | undefined>;
  constraints?: PanelConstraints;
  snapPoints?: PanelSnapPoints;
  dragHandle?: string;
  enabled: boolean;
}

/**
 * Create draggable panel core
 */
export function createDraggablePanelCore(
  panelRef: Accessor<HTMLElement | undefined>,
  initialPosition: PanelPosition,
  constraints?: PanelConstraints,
  snapPoints?: PanelSnapPoints,
  dragHandle?: string,
  enabled = true,
): DraggablePanelCore {
  const position = createSignal<PanelPosition>(initialPosition);
  const dragState = createSignal({
    isDragging: false,
    startPosition: initialPosition,
    currentPosition: initialPosition,
    delta: { x: 0, y: 0 },
  });

  return {
    position,
    dragState,
    panelRef,
    constraints,
    snapPoints,
    dragHandle,
    enabled,
  };
}

/**
 * Draggable Panel Composable
 *
 * Handles drag functionality for floating panels with constraints and snap points.
 * Based on Yipyap's sophisticated drag handling patterns.
 */

import { createEffect, onCleanup, Accessor } from "solid-js";
import type { PanelPosition, PanelConstraints, PanelSnapPoints, UseFloatingPanelReturn } from "../types.js";
import { createDraggablePanelCore, DraggablePanelCore } from "./useDraggablePanelCore.js";
import { createDraggablePanelHandlers } from "./useDraggablePanelHandlers.js";
import { constrainPosition, snapToPoint } from "./useDraggablePanelUtils.js";

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
    delta: { x: number; y: number };
  };
  startDrag: (event: globalThis.PointerEvent) => void;
  updateDrag: (event: globalThis.PointerEvent) => void;
  endDrag: () => void;
  snapToPoint: (position: PanelPosition) => PanelPosition;
  constrainPosition: (position: PanelPosition) => PanelPosition;
}

export function useDraggablePanel(
  panelRef: Accessor<HTMLElement | undefined>,
  options: UseDraggablePanelOptions = {}
): UseDraggablePanelReturn {
  const {
    initialPosition = { top: 0, left: 0 },
    constraints,
    snapPoints,
    dragHandle,
    onDragStart,
    onDrag,
    onDragEnd,
    enabled = true,
  } = options;

  const core: DraggablePanelCore = createDraggablePanelCore(
    panelRef,
    initialPosition,
    constraints,
    snapPoints,
    dragHandle,
    enabled
  );

  const handlers = createDraggablePanelHandlers(core, onDragStart, onDrag, onDragEnd);

  // Apply constraints and snap points
  createEffect(() => {
    const currentPosition = core.position[0]();
    const constrainedPosition = constrainPosition(currentPosition, constraints);
    const snappedPosition = snapToPoint(constrainedPosition, snapPoints);

    if (constrainedPosition !== currentPosition || snappedPosition !== constrainedPosition) {
      const [, setPosition] = core.position;
      setPosition(snappedPosition);
    }
  });

  // Cleanup
  onCleanup(() => {
    document.removeEventListener("pointermove", handlers.handlePointerMove);
    document.removeEventListener("pointerup", handlers.handlePointerUp);
    document.removeEventListener("pointercancel", handlers.handlePointerUp);
  });

  return {
    position: core.position[0],
    setPosition: core.position[1],
    dragState: () => {
      const [dragState] = core.dragState;
      return dragState();
    },
    startDrag: handlers.handlePointerDown,
    updateDrag: handlers.handlePointerMove,
    endDrag: handlers.handlePointerUp,
    snapToPoint: (position: PanelPosition) => snapToPoint(position, snapPoints),
    constrainPosition: (position: PanelPosition) => constrainPosition(position, constraints),
  };
}

/**
 * Draggable Panel Composable
 *
 * Handles drag functionality for floating panels with constraints and snap points.
 * Based on Yipyap's sophisticated drag handling patterns.
 */

import { createSignal, createEffect, onCleanup, Accessor } from "solid-js";
import type {
  PanelPosition,
  PanelConstraints,
  PanelSnapPoints,
  UseFloatingPanelReturn,
} from "../types";

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
  startDrag: (event: PointerEvent) => void;
  updateDrag: (event: PointerEvent) => void;
  endDrag: () => void;
  snapToPoint: (position: PanelPosition) => PanelPosition;
  constrainPosition: (position: PanelPosition) => PanelPosition;
}

export function useDraggablePanel(
  panelRef: Accessor<HTMLElement | undefined>,
  options: UseDraggablePanelOptions = {},
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

  // Panel state
  const [panelState, setPanelState] = createSignal({
    isVisible: true,
    isDragging: false,
    isResizing: false,
    isHovered: false,
    isFocused: false,
    position: initialPosition,
    size: { width: 300 as number | string, height: 200 as number | string },
    zIndex: 1000,
  });

  // Drag state
  const [dragState, setDragState] = createSignal({
    isDragging: false,
    startPosition: initialPosition,
    currentPosition: initialPosition,
    delta: { x: 0, y: 0 },
  });

  // Drag tracking
  let dragStartPos = { x: 0, y: 0 };
  let initialPanelPos = { top: 0, left: 0 };
  let isPointerDown = false;

  // Event handlers
  const handlePointerDown = (event: PointerEvent) => {
    if (!enabled) return;

    const target = event.target as HTMLElement;
    const panel = panelRef();

    if (!panel) return;

    // Check if drag handle is specified and event target matches
    if (dragHandle) {
      const handle = panel.querySelector(dragHandle);
      if (!handle || !handle.contains(target)) return;
    }

    event.preventDefault();
    event.stopPropagation();

    isPointerDown = true;
    dragStartPos = { x: event.clientX, y: event.clientY };
    const currentPos = panelState().position;
    initialPanelPos = {
      top: typeof currentPos.top === "number" ? currentPos.top : 0,
      left: typeof currentPos.left === "number" ? currentPos.left : 0,
    };

    setDragState((prev) => ({
      ...prev,
      isDragging: true,
      startPosition: initialPanelPos,
      currentPosition: initialPanelPos,
      delta: { x: 0, y: 0 },
    }));

    setPanelState((prev) => ({
      ...prev,
      isDragging: true,
      zIndex: 2000, // Bring to front when dragging
    }));

    onDragStart?.(initialPanelPos);

    // Add global event listeners
    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", handlePointerUp);
    document.addEventListener("pointercancel", handlePointerUp);
  };

  const handlePointerMove = (event: PointerEvent) => {
    if (!isPointerDown || !enabled) return;

    const deltaX = event.clientX - dragStartPos.x;
    const deltaY = event.clientY - dragStartPos.y;

    const newPosition = {
      top: (initialPanelPos.top as number) + deltaY,
      left: (initialPanelPos.left as number) + deltaX,
    };

    // Apply constraints
    const constrainedPosition = constraints
      ? constrainPosition(newPosition)
      : newPosition;

    // Apply snap points
    const snappedPosition = snapPoints
      ? snapToPoint(constrainedPosition)
      : constrainedPosition;

    setDragState((prev) => ({
      ...prev,
      currentPosition: snappedPosition,
      delta: { x: deltaX, y: deltaY },
    }));

    setPanelState((prev) => ({
      ...prev,
      position: snappedPosition,
    }));

    onDrag?.(snappedPosition);
  };

  const handlePointerUp = () => {
    if (!isPointerDown) return;

    isPointerDown = false;

    setDragState((prev) => ({
      ...prev,
      isDragging: false,
    }));

    setPanelState((prev) => ({
      ...prev,
      isDragging: false,
      zIndex: 1000, // Reset z-index
    }));

    onDragEnd?.(panelState().position);

    // Remove global event listeners
    document.removeEventListener("pointermove", handlePointerMove);
    document.removeEventListener("pointerup", handlePointerUp);
    document.removeEventListener("pointercancel", handlePointerUp);
  };

  // Constrain position to bounds
  const constrainPosition = (position: PanelPosition): PanelPosition => {
    if (!constraints) return position;

    const panel = panelRef();
    if (!panel) return position;

    const rect = panel.getBoundingClientRect();
    const containerRect = panel.parentElement?.getBoundingClientRect();

    if (!containerRect) return position;

    const constrained = { ...position };

    // Constrain to container bounds
    if (typeof constrained.left === "number") {
      constrained.left = Math.max(
        0,
        Math.min(constrained.left, containerRect.width - rect.width),
      );
    }

    if (typeof constrained.top === "number") {
      constrained.top = Math.max(
        0,
        Math.min(constrained.top, containerRect.height - rect.height),
      );
    }

    return constrained;
  };

  // Snap to nearest snap point
  const snapToPoint = (position: PanelPosition): PanelPosition => {
    if (!snapPoints) return position;

    const snapped = { ...position };
    const tolerance = snapPoints.tolerance || 10;

    // Snap X position
    if (typeof snapped.left === "number") {
      const leftValue = snapped.left;
      const nearestX = snapPoints.x.reduce((prev, curr) =>
        Math.abs(curr - leftValue) < Math.abs(prev - leftValue) ? curr : prev,
      );

      if (Math.abs(nearestX - leftValue) <= tolerance) {
        snapped.left = nearestX;
      }
    }

    // Snap Y position
    if (typeof snapped.top === "number") {
      const topValue = snapped.top;
      const nearestY = snapPoints.y.reduce((prev, curr) =>
        Math.abs(curr - topValue) < Math.abs(prev - topValue) ? curr : prev,
      );

      if (Math.abs(nearestY - topValue) <= tolerance) {
        snapped.top = nearestY;
      }
    }

    return snapped;
  };

  // Panel control methods
  const showPanel = () => {
    setPanelState((prev) => ({ ...prev, isVisible: true }));
  };

  const hidePanel = () => {
    setPanelState((prev) => ({ ...prev, isVisible: false }));
  };

  const togglePanel = () => {
    setPanelState((prev) => ({ ...prev, isVisible: !prev.isVisible }));
  };

  const updatePosition = (position: Partial<PanelPosition>) => {
    const newPosition = { ...panelState().position, ...position };
    const constrainedPosition = constraints
      ? constrainPosition(newPosition)
      : newPosition;
    const snappedPosition = snapPoints
      ? snapToPoint(constrainedPosition)
      : constrainedPosition;

    setPanelState((prev) => ({ ...prev, position: snappedPosition }));
  };

  const updateSize = (
    size: Partial<{ width: number | string; height: number | string }>,
  ) => {
    setPanelState((prev) => ({
      ...prev,
      size: {
        ...prev.size,
        width: size.width !== undefined ? size.width : prev.size.width,
        height: size.height !== undefined ? size.height : prev.size.height,
      },
    }));
  };

  // Cleanup on unmount
  onCleanup(() => {
    document.removeEventListener("pointermove", handlePointerMove);
    document.removeEventListener("pointerup", handlePointerUp);
    document.removeEventListener("pointercancel", handlePointerUp);
  });

  // Set up event listeners on panel
  createEffect(() => {
    const panel = panelRef();
    if (!panel) return;

    panel.addEventListener("pointerdown", handlePointerDown);

    return () => {
      panel.removeEventListener("pointerdown", handlePointerDown);
    };
  });

  return {
    panelState,
    dragState,
    showPanel,
    hidePanel,
    togglePanel,
    updatePosition,
    updateSize,
    isVisible: () => panelState().isVisible,
    isDragging: () => panelState().isDragging,
    isResizing: () => panelState().isResizing,
    startDrag: handlePointerDown,
    updateDrag: handlePointerMove,
    endDrag: handlePointerUp,
    snapToPoint,
    constrainPosition,
  };
}

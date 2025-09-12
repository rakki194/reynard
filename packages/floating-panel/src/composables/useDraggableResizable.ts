/**
 * useDraggableResizable Composable
 *
 * Ported from Yipyap's sophisticated draggable/resizable panel system.
 * Provides comprehensive panel interaction capabilities.
 */

import { createSignal, createEffect, onCleanup } from "solid-js";

export interface PanelState {
  x: number;
  y: number;
  width: number;
  height: number;
  minimized: boolean;
}

export interface DraggableResizableOptions {
  initialState: PanelState;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  bounds?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  storageKey?: string;
  onStateChange?: (state: PanelState) => void;
}

export interface DraggableResizableReturn {
  panelState: () => PanelState;
  isDragging: () => boolean;
  isResizing: () => boolean;
  isMinimized: () => boolean;
  style: () => Record<string, string>;
  handleMouseDown: (e: MouseEvent, type: "drag" | "resize") => void;
  toggleMinimized: () => void;
  resetPosition: () => void;
}

export function useDraggableResizable(
  options: DraggableResizableOptions,
): DraggableResizableReturn {
  const {
    initialState,
    minWidth = 180,
    minHeight = 120,
    maxWidth = window.innerWidth * 0.8,
    maxHeight = window.innerHeight * 0.8,
    storageKey,
    onStateChange,
  } = options;

  // Load from localStorage if storage key is provided
  const loadStoredState = (): PanelState => {
    if (storageKey) {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          // Validate the stored state
          if (
            typeof parsed === "object" &&
            typeof parsed.x === "number" &&
            typeof parsed.y === "number" &&
            typeof parsed.width === "number" &&
            typeof parsed.height === "number"
          ) {
            return { ...initialState, ...parsed };
          }
        }
      } catch (error) {
        console.warn(
          `[useDraggableResizable] Failed to load stored state for ${storageKey}:`,
          error,
        );
      }
    }
    return initialState;
  };

  const [panelState, setPanelStateInternal] =
    createSignal<PanelState>(loadStoredState());
  const [isDragging, setIsDragging] = createSignal(false);
  const [isResizing, setIsResizing] = createSignal(false);
  const [dragStart, setDragStart] = createSignal<{
    x: number;
    y: number;
    panelX: number;
    panelY: number;
  } | null>(null);
  const [resizeStart, setResizeStart] = createSignal<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  // Save to localStorage when state changes
  createEffect(() => {
    const state = panelState();
    if (storageKey) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(state));
      } catch (error) {
        console.warn(
          `[useDraggableResizable] Failed to save state for ${storageKey}:`,
          error,
        );
      }
    }
    onStateChange?.(state);
  });

  const setPanelState = (updates: Partial<PanelState>) => {
    setPanelStateInternal((prev) => ({ ...prev, ...updates }));
  };

  const constrainPosition = (
    x: number,
    y: number,
    width: number,
    height: number,
  ) => {
    const constrainedX = Math.max(0, Math.min(x, window.innerWidth - width));
    const constrainedY = Math.max(0, Math.min(y, window.innerHeight - height));
    return { x: constrainedX, y: constrainedY };
  };

  const constrainSize = (width: number, height: number) => {
    const constrainedWidth = Math.max(minWidth, Math.min(width, maxWidth));
    const constrainedHeight = Math.max(minHeight, Math.min(height, maxHeight));
    return { width: constrainedWidth, height: constrainedHeight };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging()) {
      const start = dragStart();
      if (!start) return;

      const deltaX = e.clientX - start.x;
      const deltaY = e.clientY - start.y;
      const newX = start.panelX + deltaX;
      const newY = start.panelY + deltaY;

      const constrained = constrainPosition(
        newX,
        newY,
        panelState().width,
        panelState().height,
      );
      setPanelState({ x: constrained.x, y: constrained.y });
    } else if (isResizing()) {
      const start = resizeStart();
      if (!start) return;

      const deltaX = e.clientX - start.x;
      const deltaY = e.clientY - start.y;
      const newWidth = start.width + deltaX;
      const newHeight = start.height + deltaY;

      const constrained = constrainSize(newWidth, newHeight);
      console.debug(
        `[useDraggableResizable] Resize ${storageKey}: delta(${deltaX}, ${deltaY}) -> size(${newWidth}, ${newHeight}) -> constrained(${constrained.width}, ${constrained.height})`,
      );
      setPanelState({ width: constrained.width, height: constrained.height });
    }
  };

  const handleMouseUp = () => {
    if (isDragging()) {
      setIsDragging(false);
      setDragStart(null);
      console.debug(`[useDraggableResizable] Drag ended for ${storageKey}`);
    }
    if (isResizing()) {
      setIsResizing(false);
      setResizeStart(null);
      console.debug(`[useDraggableResizable] Resize ended for ${storageKey}`);
    }
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  };

  const handleMouseDown = (e: MouseEvent, type: "drag" | "resize") => {
    e.preventDefault();
    e.stopPropagation();

    if (type === "drag") {
      setIsDragging(true);
      setDragStart({
        x: e.clientX,
        y: e.clientY,
        panelX: panelState().x,
        panelY: panelState().y,
      });
      document.body.style.cursor = "grabbing";
      document.body.style.userSelect = "none";
      console.debug(`[useDraggableResizable] Drag started for ${storageKey}`);
    } else if (type === "resize") {
      setIsResizing(true);
      setResizeStart({
        x: e.clientX,
        y: e.clientY,
        width: panelState().width,
        height: panelState().height,
      });
      document.body.style.cursor = "nw-resize";
      document.body.style.userSelect = "none";
      console.debug(`[useDraggableResizable] Resize started for ${storageKey}`);
    }
  };

  const toggleMinimized = () => {
    const currentState = panelState();
    const newMinimized = !currentState.minimized;
    console.log("🦦> toggleMinimized called:", {
      storageKey,
      currentMinimized: currentState.minimized,
      newMinimized,
      fullState: currentState,
    });
    setPanelState({ minimized: newMinimized });
  };

  const resetPosition = () => {
    setPanelState(initialState);
  };

  // Set up global event listeners
  createEffect(() => {
    if (isDragging() || isResizing()) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("mouseleave", handleMouseUp);
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleMouseUp);
    }
  });

  // Cleanup on unmount
  onCleanup(() => {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
    document.removeEventListener("mouseleave", handleMouseUp);
  });

  // Generate style object
  const style = () => {
    const state = panelState();
    return {
      position: "absolute",
      left: `${state.x}px`,
      top: `${state.y}px`,
      width: `${state.width}px`,
      height: state.minimized ? "40px" : `${state.height}px`,
      zIndex: "1001",
      cursor: isDragging()
        ? "grabbing"
        : isResizing()
          ? "nw-resize"
          : "default",
      userSelect: isDragging() || isResizing() ? "none" : "auto",
    };
  };

  return {
    panelState,
    isDragging,
    isResizing,
    isMinimized: () => panelState().minimized,
    style,
    handleMouseDown,
    toggleMinimized,
    resetPosition,
  };
}

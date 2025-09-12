/**
 * useDraggableResizable Composable
 *
 * Ported from Yipyap's sophisticated draggable/resizable panel system.
 * Provides comprehensive panel interaction capabilities.
 */

import { createSignal, createEffect, onCleanup } from "solid-js";
import { createPanelState, updatePanelState, type PanelState } from "./draggable-resizable/PanelState.js";
import { applyConstraints, type PanelConstraints } from "./draggable-resizable/PanelConstraints.js";
import { savePanelState, loadPanelState } from "./draggable-resizable/PanelStorage.js";

export interface DraggableResizableOptions extends PanelConstraints {
  initialState: PanelState;
  storageKey?: string;
  onStateChange?: (state: PanelState) => void;
  onDrag?: (position: { top: number; left: number }) => void;
  onResize?: (size: { width: number; height: number }) => void;
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

export function useDraggableResizable(
  options: DraggableResizableOptions,
): DraggableResizableReturn {
  const { initialState, storageKey, onStateChange, onDrag: _onDrag, onResize: _onResize, onShow, onHide: _onHide, ...constraints } = options;
  
  // Load initial state from storage if available
  const [state, setState] = createPanelState(storageKey ? loadPanelState(storageKey, initialState) : initialState);
  const [isDragging, setIsDragging] = createSignal(false);
  const [isResizing, setIsResizing] = createSignal(false);
  const [ref, setRef] = createSignal<HTMLElement>();
  
  // Save state to storage when it changes
  createEffect(() => {
    if (storageKey) {
      savePanelState(storageKey, state());
    }
    onStateChange?.(state());
  });
  
  // Apply constraints
  createEffect(() => {
    const constrainedState = applyConstraints(state(), constraints);
    if (constrainedState !== state()) {
      setState(constrainedState);
    }
  });
  
  const handleMouseDown = (e: MouseEvent, type: "drag" | "resize") => {
    e.preventDefault();
    if (type === "drag") { setIsDragging(true); onShow?.(); } else { setIsResizing(true); }
  };
  
  const toggleMinimized = () => updatePanelState(setState, { minimized: !state().minimized });
  const resetPosition = () => setState(initialState);
  
  // Cleanup
  onCleanup(() => {
    if (storageKey) {
      savePanelState(storageKey, state());
    }
  });
  
  return {
    state,
    isDragging,
    isResizing,
    isMinimized: () => state().minimized,
    ref,
    setRef,
    handleMouseDown,
    toggleMinimized,
    resetPosition,
  };
}
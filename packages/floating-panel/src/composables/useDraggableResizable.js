/**
 * useDraggableResizable Composable
 *
 * Ported from Yipyap's sophisticated draggable/resizable panel system.
 * Provides comprehensive panel interaction capabilities.
 */
import { createSignal, createEffect, onCleanup } from "solid-js";
import { createPanelState, updatePanelState, } from "./draggable-resizable/PanelState.js";
import { applyConstraints, } from "./draggable-resizable/PanelConstraints.js";
import { savePanelState, loadPanelState, } from "./draggable-resizable/PanelStorage.js";
export function useDraggableResizable(options) {
    const { initialState, storageKey, onStateChange, onDrag: _onDrag, onResize: _onResize, onShow, onHide: _onHide, ...constraints } = options;
    // Load initial state from storage if available
    const [state, setState] = createPanelState(storageKey ? loadPanelState(storageKey, initialState) : initialState);
    const [isDragging, setIsDragging] = createSignal(false);
    const [isResizing, setIsResizing] = createSignal(false);
    const [ref, setRef] = createSignal();
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
    const handleMouseDown = (e, type) => {
        e.preventDefault();
        if (type === "drag") {
            setIsDragging(true);
            onShow?.();
        }
        else {
            setIsResizing(true);
        }
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

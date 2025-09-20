/**
 * Debug version of FloatingPanel with console logging
 */
import { createSignal } from "solid-js";
import { useDraggablePanel } from "../composables/useDraggablePanel.js";
import { createDebugConfig } from "./debug/FloatingPanelDebugConfig.js";
import { createDebugLogging } from "./debug/FloatingPanelDebugLogging.js";
import { createDebugHandlers } from "./debug/FloatingPanelDebugHandlers.js";
import "./FloatingPanel.css";
export const FloatingPanelDebug = props => {
    const [panelRef, setPanelRef] = createSignal();
    // Create configuration and handlers
    const config = createDebugConfig(props.config);
    const handlers = createDebugHandlers(props);
    // Set up draggable functionality
    const { isVisible, isDragging } = useDraggablePanel(panelRef, {
        initialPosition: props.position,
        enabled: config.draggable,
        onDragStart: handlers.handleDragStart,
        onDrag: handlers.handleDrag,
        onDragEnd: handlers.handleDragEnd,
        constraints: {
            minWidth: 200,
            minHeight: 100,
            maxWidth: 800,
            maxHeight: 600,
        },
    });
    // Set up debug logging
    createDebugLogging(props, panelRef, isVisible, isDragging);
    return (<div ref={setPanelRef} class={`floating-panel theme-${config.theme} ${isDragging() ? "dragging" : ""}`} style={{
            position: "absolute",
            top: `${props.position.top || 0}px`,
            left: `${props.position.left || 0}px`,
            width: `${props.size?.width || 300}px`,
            height: `${props.size?.height || 200}px`,
            "min-width": `${props.size?.minWidth || 200}px`,
            "min-height": `${props.size?.minHeight || 100}px`,
            "max-width": `${props.size?.maxWidth || 800}px`,
            "max-height": `${props.size?.maxHeight || 600}px`,
            "z-index": props.position.zIndex || 1000,
            "transition-delay": `${config.animationDelay}ms`,
        }}>
      <div class="floating-panel-content">
        <div class="floating-panel-header">
          <div class="floating-panel-drag-handle">
            <span>⋮⋮</span>
            <h3 class="floating-panel-title">Panel {props.id}</h3>
          </div>
          <div class="floating-panel-controls">
            {config.closable && (<button class="floating-panel-control-btn" onClick={handlers.handleHide} title="Close panel">
                ✕
              </button>)}
          </div>
        </div>

        <div class="floating-panel-body">{props.children}</div>
      </div>

      {config.resizable && <div class="floating-panel-resize-handle"/>}
    </div>);
};

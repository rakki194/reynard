/**
 * Debug version of FloatingPanel with console logging
 */

import type { Component } from "solid-js";
import { createSignal, createEffect } from "solid-js";
import { useDraggablePanel } from "../composables/useDraggablePanel";
import type { FloatingPanelProps, PanelConfig } from "../types";
import "./FloatingPanel.css";

export const FloatingPanelDebug: Component<FloatingPanelProps> = (props) => {
  const [panelRef, setPanelRef] = createSignal<HTMLElement>();

  // Debug logging
  console.log("🦦> FloatingPanelDebug created:", {
    id: props.id,
    position: props.position,
    size: props.size,
    config: props.config,
  });

  // Default configuration
  const config: Required<PanelConfig> = {
    draggable: true,
    resizable: false,
    closable: false,
    backdrop: false,
    backdropBlur: false,
    backdropColor: "transparent",
    animationDelay: 0,
    animationDuration: 300,
    animationEasing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    showOnHover: false,
    hoverDelay: 500,
    persistent: true,
    theme: "default",
    ...props.config,
  };

  // Set up draggable functionality
  const { isVisible, isDragging } = useDraggablePanel(panelRef, {
    initialPosition: props.position,
    enabled: config.draggable,
    onDragStart: () => {
      console.log("🦦> Panel drag started:", props.id);
      props.onShow?.();
    },
    onDrag: (position) => {
      console.log("🦦> Panel dragging:", props.id, position);
      props.onDrag?.(position);
    },
    onDragEnd: () => {
      console.log("🦦> Panel drag ended:", props.id);
      props.onHide?.();
    },
    constraints: {
      minWidth: 200,
      minHeight: 100,
      maxWidth: 800,
      maxHeight: 600,
    },
  });

  // Debug effect for visibility changes
  createEffect(() => {
    console.log("🦦> Panel visibility changed:", {
      id: props.id,
      isVisible: isVisible(),
      isDragging: isDragging(),
    });
  });

  // Debug effect for position changes
  createEffect(() => {
    const element = panelRef();
    if (element) {
      const rect = element.getBoundingClientRect();
      console.log("🦦> Panel position:", {
        id: props.id,
        rect: {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        },
        computedStyle: {
          position: getComputedStyle(element).position,
          zIndex: getComputedStyle(element).zIndex,
          transform: getComputedStyle(element).transform,
        },
      });
    }
  });

  const handleHide = () => {
    console.log("🦦> Panel hide requested:", props.id);
    props.onHide?.();
  };

  return (
    <div
      ref={setPanelRef}
      class={`floating-panel theme-${config.theme} ${isDragging() ? "dragging" : ""}`}
      style={{
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
      }}
    >
      <div class="floating-panel-content">
        <div class="floating-panel-header">
          <div class="floating-panel-drag-handle">
            <span>⋮⋮</span>
            <h3 class="floating-panel-title">Panel {props.id}</h3>
          </div>
          <div class="floating-panel-controls">
            {config.closable && (
              <button
                class="floating-panel-control-btn"
                onClick={handleHide}
                title="Close panel"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div class="floating-panel-body">{props.children}</div>
      </div>

      {config.resizable && <div class="floating-panel-resize-handle" />}
    </div>
  );
};

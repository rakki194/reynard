/**
 * FloatingPanelAdvanced Component
 */

import type { Component } from "solid-js";
import { createEffect } from "solid-js";
import { getIcon } from "reynard-fluent-icons";
import { useDraggableResizable } from "../composables/useDraggableResizable.js";
import type { FloatingPanelProps } from "../types.js";
import { useI18n } from "reynard-i18n";
import { createAdvancedConfig } from "./advanced/FloatingPanelAdvancedConfig.js";
import {
  createAdvancedState,
  createAdvancedConstraints,
} from "./advanced/FloatingPanelAdvancedState.js";
import { createAdvancedHandlers } from "./advanced/FloatingPanelAdvancedHandlers.js";
import "./FloatingPanelAdvanced.css";

export const FloatingPanelAdvanced: Component<FloatingPanelProps> = (props) => {
  const { t } = useI18n();
  console.log("🦦> FloatingPanelAdvanced rendering for panel:", props.id);

  // Create configuration, state, constraints, and handlers
  const config = createAdvancedConfig(props.config);
  const initialState = createAdvancedState(props);
  const constraints = createAdvancedConstraints(props);
  const handlers = createAdvancedHandlers(props);

  // Set up draggable/resizable functionality
  const panel = useDraggableResizable({
    initialState,
    ...constraints,
    onDrag: handlers.handleDrag,
    onResize: handlers.handleResize,
    onShow: handlers.handleShow,
    onHide: handlers.handleHide,
  });

  // Apply theme and animations
  createEffect(() => {
    const element = panel.ref();
    if (element) {
      element.style.setProperty(
        "--animation-duration",
        `${config.animationDuration}ms`,
      );
      element.style.setProperty("--animation-easing", config.animationEasing);
      element.style.setProperty(
        "--animation-delay",
        `${config.animationDelay}ms`,
      );
    }
  });

  return (
    <div
      ref={panel.ref}
      class={`floating-panel-advanced theme-${config.theme} ${panel.isDragging() ? "dragging" : ""} ${panel.isResizing() ? "resizing" : ""}`}
      style={{
        position: "absolute",
        top: `${panel.state().y}px`,
        left: `${panel.state().x}px`,
        width: `${panel.state().width}px`,
        height: `${panel.state().height}px`,
        "z-index": props.position.zIndex || 1000,
        "transition-delay": `${config.animationDelay}ms`,
      }}
    >
      <div class="floating-panel-content">
        <div class="floating-panel-header">
          <div class="floating-panel-drag-handle">
            <span>{getIcon("GripVertical")}</span>
            <h3 class="floating-panel-title">
              {props.title || `Panel ${props.id}`}
            </h3>
          </div>
          <div class="floating-panel-controls">
            {config.closable && (
              <button
                class="floating-panel-control-btn"
                onClick={handlers.handleHide}
                title={t("floatingPanel.close")}
              >
                {getIcon("Dismiss")}
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

/**
 * Floating Panel Component
 *
 * Individual floating panel with draggable, resizable, and animated capabilities.
 * Based on Yipyap's sophisticated panel system.
 */

import type { Component } from "solid-js";
import { createSignal, createEffect } from "solid-js";
import { useDraggablePanel } from "../composables/useDraggablePanel";
import { usePanelConfig } from "../composables/usePanelConfig";
import { usePanelStyles } from "../composables/usePanelStyles";
import { usePanelKeyboard } from "../composables/usePanelKeyboard";
import { FloatingPanelHeader } from "./FloatingPanelHeader";
import type { FloatingPanelProps } from "../types";
import "./FloatingPanel.css";

const FloatingPanelContent: Component<FloatingPanelProps> = props => {
  const [panelRef, setPanelRef] = createSignal<HTMLElement>();
  const config = usePanelConfig(props.config);

  const { isVisible, isDragging } = useDraggablePanel(panelRef, {
    initialPosition: props.position,
    enabled: config.draggable,
    onDragStart: () => props.onShow?.(),
    onDrag: position => props.onDrag?.(position),
    onDragEnd: () => props.onHide?.(),
    constraints: {
      minWidth: 200,
      minHeight: 100,
      maxWidth: 800,
      maxHeight: 600,
    },
  });

  createEffect(() => {
    if (isVisible()) props.onShow?.();
    else props.onHide?.();
  });

  usePanelKeyboard({ panelRef, config, onHide: props.onHide });

  const { getInlineStyles } = usePanelStyles({
    position: props.position,
    size: props.size,
    config,
  });

  return (
    <div
      ref={setPanelRef}
      class={`floating-panel theme-${config.theme} ${isDragging() ? "dragging" : ""} ${props.class || ""}`}
      style={getInlineStyles()}
      tabIndex={config.closable ? 0 : -1}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`panel-title-${props.id}`}
    >
      <div class="floating-panel-content">
        {(config.draggable || config.closable) && (
          <FloatingPanelHeader id={props.id} config={config} onHide={props.onHide} />
        )}
        <div class="floating-panel-body">{props.children}</div>
      </div>
      {config.resizable && <div class="floating-panel-resize-handle" />}
    </div>
  );
};

export const FloatingPanel: Component<FloatingPanelProps> = props => {
  return <FloatingPanelContent {...props} />;
};

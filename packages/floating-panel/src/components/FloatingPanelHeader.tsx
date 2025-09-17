/**
 * Floating Panel Header Component
 *
 * Extracted header logic from FloatingPanel to maintain 140-line axiom.
 */

import type { Component } from "solid-js";
import type { PanelConfig } from "../types";

interface FloatingPanelHeaderProps {
  id: string;
  config: Required<PanelConfig>;
  onHide?: () => void;
}

export const FloatingPanelHeader: Component<FloatingPanelHeaderProps> = props => {
  return (
    <div class="floating-panel-header">
      {props.config.draggable ? (
        <div class="floating-panel-drag-handle">
          <svg viewBox="0 0 16 16" fill="currentColor">
            <path d="M4 6h8v1H4V6zm0 2h8v1H4V8z" />
          </svg>
          <span class="floating-panel-title" id={`panel-title-${props.id}`}>
            Panel {props.id}
          </span>
        </div>
      ) : (
        <h3 class="floating-panel-title" id={`panel-title-${props.id}`}>
          Panel {props.id}
        </h3>
      )}

      {props.config.closable && (
        <div class="floating-panel-controls">
          <button class="floating-panel-control-btn" onClick={() => props.onHide?.()} aria-label="Close panel">
            <svg viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 6.585l3.593-3.592a1 1 0 011.414 1.414L9.415 8l3.592 3.593a1 1 0 01-1.414 1.414L8 9.415l-3.593 3.592a1 1 0 01-1.414-1.414L6.585 8 2.993 4.407a1 1 0 011.414-1.414L8 6.585z" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

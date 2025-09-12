/**
 * FloatingPanelAdvanced Component
 */

import type { Component } from "solid-js";
import { createEffect } from "solid-js";
import { getIcon } from "reynard-fluent-icons";
import { useDraggableResizable } from "../composables/useDraggableResizable";
import type { FloatingPanelProps, PanelConfig } from "../types";
import { useI18n } from "reynard-i18n";
import "./FloatingPanelAdvanced.css";

export const FloatingPanelAdvanced: Component<FloatingPanelProps> = (props) => {
  const { t } = useI18n();
  console.log('🦦> FloatingPanelAdvanced rendering for panel:', props.id);
  
  // Default configuration
  const config: Required<PanelConfig> = {
    draggable: true,
    resizable: true,
    closable: true,
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
    ...props.config
  };

  // Set up draggable/resizable functionality
  const panel = useDraggableResizable({
    initialState: {
      x: typeof props.position.left === 'number' ? props.position.left : 20,
      y: typeof props.position.top === 'number' ? props.position.top : 20,
      width: typeof props.size?.width === 'number' ? props.size.width : 300,
      height: typeof props.size?.height === 'number' ? props.size.height : 200,
      minimized: false
    },
    minWidth: typeof props.size?.minWidth === 'number' ? props.size.minWidth : 180,
    minHeight: typeof props.size?.minHeight === 'number' ? props.size.minHeight : 120,
    maxWidth: typeof props.size?.maxWidth === 'number' ? props.size.maxWidth : window.innerWidth * 0.8,
    maxHeight: typeof props.size?.maxHeight === 'number' ? props.size.maxHeight : window.innerHeight * 0.8,
    storageKey: `floating-panel-${props.id}`,
    onStateChange: (state) => {
      // Notify parent of position changes
      props.onDrag?.({
        top: state.y,
        left: state.x,
        zIndex: props.position.zIndex
      });
      
      // Notify parent of size changes
      props.onResize?.({
        width: state.width,
        height: state.height
      });
    }
  });

  // Handle panel visibility - only call onShow/onHide for actual show/hide, not minimize
  // Minimized panels should remain visible with just the body hidden

  // Handle escape key to close panel
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape" && config.closable) {
      props.onHide?.();
    }
  };

  createEffect(() => {
    if (config.closable) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  });

  const handleReset = () => {
    panel.resetPosition();
  };

  const panelClasses = `floating-panel-advanced theme-${config.theme} ${panel.isDragging() ? 'dragging' : ''} ${panel.isResizing() ? 'resizing' : ''} ${panel.isMinimized() ? 'minimized' : ''}`;
  const panelStyle = { ...panel.style(), ...props.style };
  
  console.log('🦦> Panel rendering details:', {
    id: props.id,
    classes: panelClasses,
    style: panelStyle,
    isMinimized: panel.isMinimized(),
    panelState: panel.panelState()
  });

  return (
    <div
      class={panelClasses}
      style={panelStyle}
      tabIndex={config.closable ? 0 : -1}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`panel-title-${props.id}`}
    >
      <div class="floating-panel-content">
        <div class="panel-header">
          <div
            class="panel-drag-handle"
            onMouseDown={e => {
              e.stopPropagation();
              panel.handleMouseDown(e, 'drag');
            }}
            onPointerDown={e => e.stopPropagation()}
            title={t('floating-panel.dragToMovePanel')}
          >
            <span 
              class="drag-icon" 
              innerHTML={getIcon("menu")?.outerHTML || ""}
            />
            <span class="panel-title">{`Panel ${props.id}`}</span>
          </div>
          <div class="panel-controls">
            <button
              class="panel-control-btn"
              onClick={() => {
                console.log('🦦> Minimize/expand button clicked for panel:', props.id, 'currently minimized:', panel.isMinimized());
                panel.toggleMinimized();
                console.log('🦦> Panel state after toggle:', panel.panelState());
              }}
              title={panel.isMinimized() ? 'Expand panel' : 'Minimize panel'}
            >
              <span 
                innerHTML={(panel.isMinimized() ? getIcon("expand")?.outerHTML : getIcon("collapse")?.outerHTML) || ""}
              />
            </button>
            <button
              class="panel-control-btn"
              onClick={handleReset}
              title={t('floating-panel.resetPanelPosition')}
            >
                <span 
                  innerHTML={getIcon("refresh")?.outerHTML || ""}
                />
            </button>
            {config.closable && (
              <button
                class="panel-control-btn"
                onClick={() => props.onHide?.()}
                title={t('floating-panel.closePanel')}
              >
                <span 
                  innerHTML={getIcon("close")?.outerHTML || ""}
                />
              </button>
            )}
          </div>
        </div>
        
        {!panel.isMinimized() && (
          <div class="floating-panel-body">
            {props.children}
          </div>
        )}
      </div>
      
      {config.resizable && (
        <div 
          class="floating-panel-resize-handle"
          onMouseDown={e => {
            console.log('🦦> Resize handle clicked for panel:', props.id);
            e.stopPropagation();
            panel.handleMouseDown(e, 'resize');
          }}
          title={t('floating-panel.dragToResizePanel')}
        />
      )}
    </div>
  );
};

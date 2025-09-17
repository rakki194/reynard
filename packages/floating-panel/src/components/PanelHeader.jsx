/**
 * PanelHeader Component
 *
 * Ported from Yipyap's panel header with drag functionality.
 * Provides drag handle, minimize/maximize, and reset controls.
 */
import { getIcon } from "reynard-fluent-icons";
export const PanelHeader = (props) => {
    return (<div class="panel-header">
      <div class="panel-drag-handle" onMouseDown={(e) => {
            e.stopPropagation();
            props.panel.handleMouseDown(e, "drag");
        }} onPointerDown={(e) => e.stopPropagation()} title="Drag to move panel">
        <span class="drag-icon">{getIcon("menu")}</span>
        <span class="panel-title">{props.title}</span>
      </div>
      <div class="panel-controls">
        <button class="panel-control-btn" onClick={() => props.panel.toggleMinimized()} title={props.panel.isMinimized() ? "Expand panel" : "Minimize panel"}>
          {props.panel.isMinimized()
            ? getIcon("chevron-down")
            : getIcon("chevron-up")}
        </button>
        {props.onReset && (<button class="panel-control-btn" onClick={props.onReset} title="Reset panel position">
            {getIcon("refresh")}
          </button>)}
      </div>
    </div>);
};

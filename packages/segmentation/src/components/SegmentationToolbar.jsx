/**
 * Segmentation Toolbar Component
 *
 * Comprehensive toolbar for segmentation editor with zoom, pan, and editing controls.
 * Features sophisticated UI patterns inspired by the Reynard caption system.
 */
import { createSignal, createEffect, Show } from "solid-js";
import { getIcon } from "reynard-fluent-icons";
import "./SegmentationToolbar.css";
/**
 * Segmentation Toolbar Component with comprehensive controls
 */
export const SegmentationToolbar = props => {
    const [zoom, setZoom] = createSignal(props.state.zoom);
    const [panOffset, setPanOffset] = createSignal(props.state.panOffset);
    const [showAdvanced, setShowAdvanced] = createSignal(false);
    // Update local state when props change
    createEffect(() => {
        setZoom(props.state.zoom);
        setPanOffset(props.state.panOffset);
    });
    // Handle zoom change
    const handleZoomChange = (newZoom) => {
        setZoom(newZoom);
        props.onZoomChange?.(newZoom);
    };
    // Handle pan change
    const handlePanChange = (newOffset) => {
        setPanOffset(newOffset);
        props.onPanChange?.(newOffset);
    };
    // Zoom controls
    const zoomIn = () => {
        const newZoom = Math.min(zoom() * 1.2, 5);
        handleZoomChange(newZoom);
    };
    const zoomOut = () => {
        const newZoom = Math.max(zoom() / 1.2, 0.1);
        handleZoomChange(newZoom);
    };
    const resetZoom = () => {
        handleZoomChange(1);
    };
    const fitToScreen = () => {
        // This would need canvas dimensions to implement properly
        handleZoomChange(1);
        handlePanChange({ x: 0, y: 0 });
    };
    // Pan controls
    const panUp = () => {
        handlePanChange({ x: panOffset().x, y: panOffset().y - 50 });
    };
    const panDown = () => {
        handlePanChange({ x: panOffset().x, y: panOffset().y + 50 });
    };
    const panLeft = () => {
        handlePanChange({ x: panOffset().x - 50, y: panOffset().y });
    };
    const panRight = () => {
        handlePanChange({ x: panOffset().x + 50, y: panOffset().y });
    };
    const resetPan = () => {
        handlePanChange({ x: 0, y: 0 });
    };
    // Config toggle handlers
    const toggleGrid = () => {
        props.onConfigChange?.({ showGrid: !props.config.showGrid });
    };
    const toggleVertices = () => {
        props.onConfigChange?.({ showVertices: !props.config.showVertices });
    };
    const toggleEdges = () => {
        props.onConfigChange?.({ showEdges: !props.config.showEdges });
    };
    const toggleFill = () => {
        props.onConfigChange?.({ showFill: !props.config.showFill });
    };
    const toggleBoundingBox = () => {
        props.onConfigChange?.({ showBoundingBox: !props.config.showBoundingBox });
    };
    return (<div class={`segmentation-toolbar ${props.class || ""}`}>
      {/* Main controls */}
      <div class="segmentation-toolbar-section">
        <button class="segmentation-toolbar-button" onClick={props.onToggleEditor} title="Toggle Editor">
          {getIcon("Edit")}
        </button>
      </div>

      {/* Zoom controls */}
      <div class="segmentation-toolbar-section">
        <button class="segmentation-toolbar-button" onClick={zoomOut} title="Zoom Out">
          {getIcon("ZoomOut")}
        </button>

        <span class="segmentation-toolbar-zoom-display">{Math.round(zoom() * 100)}%</span>

        <button class="segmentation-toolbar-button" onClick={zoomIn} title="Zoom In">
          {getIcon("ZoomIn")}
        </button>

        <button class="segmentation-toolbar-button" onClick={resetZoom} title="Reset Zoom">
          {getIcon("ZoomToFit")}
        </button>

        <button class="segmentation-toolbar-button" onClick={fitToScreen} title="Fit to Screen">
          {getIcon("FullScreen")}
        </button>
      </div>

      {/* Pan controls */}
      <div class="segmentation-toolbar-section">
        <button class="segmentation-toolbar-button" onClick={panUp} title="Pan Up">
          {getIcon("ChevronUp")}
        </button>

        <div class="segmentation-toolbar-pan-controls">
          <button class="segmentation-toolbar-button" onClick={panLeft} title="Pan Left">
            {getIcon("ChevronLeft")}
          </button>

          <button class="segmentation-toolbar-button" onClick={resetPan} title="Reset Pan">
            {getIcon("Home")}
          </button>

          <button class="segmentation-toolbar-button" onClick={panRight} title="Pan Right">
            {getIcon("ChevronRight")}
          </button>
        </div>

        <button class="segmentation-toolbar-button" onClick={panDown} title="Pan Down">
          {getIcon("ChevronDown")}
        </button>
      </div>

      {/* View options */}
      <div class="segmentation-toolbar-section">
        <button class={`segmentation-toolbar-button ${props.config.showGrid ? "active" : ""}`} onClick={toggleGrid} title="Toggle Grid">
          {getIcon("Grid")}
        </button>

        <button class={`segmentation-toolbar-button ${props.config.showVertices ? "active" : ""}`} onClick={toggleVertices} title="Toggle Vertices">
          {getIcon("Circle")}
        </button>

        <button class={`segmentation-toolbar-button ${props.config.showEdges ? "active" : ""}`} onClick={toggleEdges} title="Toggle Edges">
          {getIcon("Line")}
        </button>

        <button class={`segmentation-toolbar-button ${props.config.showFill ? "active" : ""}`} onClick={toggleFill} title="Toggle Fill">
          {getIcon("Shape")}
        </button>

        <button class={`segmentation-toolbar-button ${props.config.showBoundingBox ? "active" : ""}`} onClick={toggleBoundingBox} title="Toggle Bounding Box">
          {getIcon("Rectangle")}
        </button>
      </div>

      {/* Advanced controls toggle */}
      <div class="segmentation-toolbar-section">
        <button class={`segmentation-toolbar-button ${showAdvanced() ? "active" : ""}`} onClick={() => setShowAdvanced(!showAdvanced())} title="Advanced Controls">
          {getIcon("Settings")}
        </button>
      </div>

      {/* Advanced controls */}
      <Show when={showAdvanced()}>
        <div class="segmentation-toolbar-section segmentation-toolbar-advanced">
          <div class="segmentation-toolbar-control-group">
            <label class="segmentation-toolbar-label">Grid Size:</label>
            <input type="range" min="10" max="50" value={props.config.gridSize} onChange={e => props.onConfigChange?.({ gridSize: parseInt(e.target.value) })} class="segmentation-toolbar-slider"/>
            <span class="segmentation-toolbar-value">{props.config.gridSize}px</span>
          </div>

          <div class="segmentation-toolbar-control-group">
            <label class="segmentation-toolbar-label">Vertex Size:</label>
            <input type="range" min="4" max="16" value={props.config.vertexSize} onChange={e => props.onConfigChange?.({ vertexSize: parseInt(e.target.value) })} class="segmentation-toolbar-slider"/>
            <span class="segmentation-toolbar-value">{props.config.vertexSize}px</span>
          </div>

          <div class="segmentation-toolbar-control-group">
            <label class="segmentation-toolbar-label">Edge Thickness:</label>
            <input type="range" min="1" max="8" value={props.config.edgeThickness} onChange={e => props.onConfigChange?.({
            edgeThickness: parseInt(e.target.value),
        })} class="segmentation-toolbar-slider"/>
            <span class="segmentation-toolbar-value">{props.config.edgeThickness}px</span>
          </div>

          <div class="segmentation-toolbar-control-group">
            <label class="segmentation-toolbar-label">Fill Opacity:</label>
            <input type="range" min="0" max="1" step="0.1" value={props.config.fillOpacity} onChange={e => props.onConfigChange?.({
            fillOpacity: parseFloat(e.target.value),
        })} class="segmentation-toolbar-slider"/>
            <span class="segmentation-toolbar-value">{Math.round(props.config.fillOpacity * 100)}%</span>
          </div>
        </div>
      </Show>

      {/* Status display */}
      <div class="segmentation-toolbar-section segmentation-toolbar-status">
        <span class="segmentation-toolbar-status-item">Zoom: {Math.round(zoom() * 100)}%</span>
        <span class="segmentation-toolbar-status-item">
          Pan: ({Math.round(panOffset().x)}, {Math.round(panOffset().y)})
        </span>
        <Show when={props.state.mousePosition}>
          <span class="segmentation-toolbar-status-item">
            Mouse: ({Math.round(props.state.mousePosition.x)}, {Math.round(props.state.mousePosition.y)})
          </span>
        </Show>
        <Show when={props.state.selectedSegmentation}>
          <span class="segmentation-toolbar-status-item">Selected: {props.state.selectedSegmentation}</span>
        </Show>
      </div>
    </div>);
};

/**
 * Editor Canvas Component
 *
 * Handles canvas rendering and drawing overlay
 */
import { createSignal, onMount, onCleanup } from "solid-js";
export const EditorCanvas = props => {
    const { imageInfo, config, containerWidth, containerHeight, boundingBoxes, selectedBoxId, onBoxSelect, onBoxCreate, onBoxUpdate, onBoxDelete, onEditingStart, onEditingEnd, onEditingCancel, className = "", } = props;
    const [canvasRef, setCanvasRef] = createSignal(null);
    onMount(() => {
        const canvas = canvasRef();
        if (canvas) {
            // Initialize canvas with image
            const ctx = canvas.getContext("2d");
            if (ctx) {
                // Set up canvas for drawing
                ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
                ctx.strokeStyle = "#007acc";
                ctx.lineWidth = 2;
            }
        }
    });
    onCleanup(() => {
        // Cleanup canvas resources
    });
    return (<div class={`canvas-container ${className}`}>
      <img src={imageInfo.src} alt={imageInfo.alt || "Bounding box editor canvas"} class="editor-image" role="img" aria-label="Bounding box editor canvas" style={{
            width: `${containerWidth}px`,
            height: `${containerHeight}px`,
        }}/>
      <canvas ref={setCanvasRef} class="bounding-box-canvas" width={containerWidth} height={containerHeight} style={{
            position: "absolute",
            top: 0,
            left: 0,
            pointerEvents: "auto",
        }}/>
    </div>);
};

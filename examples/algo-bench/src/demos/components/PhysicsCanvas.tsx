import { Component } from "solid-js";

export interface PhysicsCanvasProps {
  width: number;
  height: number;
  onMouseMove: (e: MouseEvent) => void;
  onMouseDown: (e: MouseEvent) => void;
  onMouseUp: (e: MouseEvent) => void;
  onClick: (e: MouseEvent) => void;
  onCanvasRef: (canvas: HTMLCanvasElement) => void;
}

/**
 * Canvas component for physics simulation rendering
 * Provides the HTML5 canvas element with mouse event handlers
 */
export const PhysicsCanvas: Component<PhysicsCanvasProps> = props => {
  const handleCanvasRef = (canvas: HTMLCanvasElement) => {
    props.onCanvasRef(canvas);
  };

  return (
    <div class="demo-canvas-container">
      <canvas
        ref={canvas => handleCanvasRef(canvas)}
        width={props.width}
        height={props.height}
        onMouseMove={e => props.onMouseMove(e)}
        onMouseDown={e => props.onMouseDown(e)}
        onMouseUp={e => props.onMouseUp(e)}
        onClick={e => props.onClick(e)}
        class="demo-canvas"
      />
      <div class="canvas-overlay">
        <p>Click to add objects • Drag to move objects • Yellow lines show velocity</p>
      </div>
    </div>
  );
};

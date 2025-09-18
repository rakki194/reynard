/**
 * Mouse interaction utilities for canvas-based interactions
 */

/**
 * Get mouse position relative to canvas element
 */
export function getCanvasMousePosition(event: MouseEvent, canvas: HTMLCanvasElement): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}

/**
 * Create mouse move handler that updates position signal
 */
export function createMouseMoveHandler(setMousePos: (pos: { x: number; y: number }) => void) {
  return (e: MouseEvent, canvas: HTMLCanvasElement) => {
    const pos = getCanvasMousePosition(e, canvas);
    setMousePos(pos);
  };
}

/**
 * Create mouse click handler that calls callback with position
 */
export function createMouseClickHandler(onAddObject: (x: number, y: number) => void) {
  return (e: MouseEvent, canvas: HTMLCanvasElement) => {
    const pos = getCanvasMousePosition(e, canvas);
    onAddObject(pos.x, pos.y);
  };
}

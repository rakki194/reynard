import { createSignal, type Accessor } from "solid-js";

export interface MousePosition {
  x: number;
  y: number;
}

/**
 * Mouse position tracking composable
 * Handles mouse movement and position calculation
 */
export function useMousePosition(canvasRef: Accessor<HTMLCanvasElement | undefined>) {
  const [mousePos, setMousePos] = createSignal<MousePosition>({ x: 0, y: 0 });

  const updateMousePosition = (e: MouseEvent) => {
    const canvas = canvasRef();
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });
  };

  return {
    mousePos,
    updateMousePosition,
  };
}

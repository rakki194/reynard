import { onCleanup } from "solid-js";
import type { MovementInput } from "../types/maze";

/**
 * Composable for handling keyboard input and game controls
 * Manages key state tracking and event listeners for player movement
 */
export function useGameControls() {
  const keys: { [key: string]: boolean } = {};

  const onKeyDown = (event: KeyboardEvent) => {
    keys[event.code] = true;
  };

  const onKeyUp = (event: KeyboardEvent) => {
    keys[event.code] = false;
  };

  const setupControls = () => {
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    // Store keys for game loop
    (window as any).mazeKeys = keys;
  };

  const cleanupControls = () => {
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("keyup", onKeyUp);
  };

  const getMovementInput = (): MovementInput => {
    const moveSpeed = 0.1;
    let deltaX = 0;
    let deltaZ = 0;

    if (keys["KeyW"] || keys["ArrowUp"]) {
      deltaZ -= moveSpeed;
    }
    if (keys["KeyS"] || keys["ArrowDown"]) {
      deltaZ += moveSpeed;
    }
    if (keys["KeyA"] || keys["ArrowLeft"]) {
      deltaX -= moveSpeed;
    }
    if (keys["KeyD"] || keys["ArrowRight"]) {
      deltaX += moveSpeed;
    }

    return { deltaX, deltaZ };
  };

  // Auto-cleanup on component unmount
  onCleanup(cleanupControls);

  return {
    setupControls,
    getMovementInput,
    keys,
  };
}

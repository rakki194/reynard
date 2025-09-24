/**
 * 🦊 Simple Animation State Composable
 * 
 * No unnecessary abstractions - just direct, simple animation state
 */

import { createSignal, createMemo, onCleanup } from "solid-js";
import type { EasingType } from "../types";
import { createSimpleAnimation } from "../utils/SimplifiedAnimationLoop";

export interface SimpleAnimationStateOptions {
  initial?: boolean;
  duration?: number;
  easing?: EasingType;
  onStart?: () => void;
  onComplete?: () => void;
  onUpdate?: (progress: number) => void;
}

export interface SimpleAnimationStateReturn {
  isActive: () => boolean;
  isCompleted: () => boolean;
  progress: () => number;
  start: () => void;
  stop: () => void;
  toggle: () => void;
  reset: () => void;
}

export function useSimpleAnimationState(
  options: SimpleAnimationStateOptions = {}
): SimpleAnimationStateReturn {
  const {
    initial = false,
    duration = 300,
    easing = "easeInOut",
    onStart,
    onComplete,
    onUpdate,
  } = options;

  const [isActive, setIsActive] = createSignal(initial);
  const [isCompleted, setIsCompleted] = createSignal(initial);
  const [progress, setProgress] = createSignal(initial ? 1 : 0);

  let cleanupFunction: (() => void) | null = null;

  const start = (): void => {
    if (isActive()) return;

    setIsActive(true);
    setIsCompleted(false);
    setProgress(0);
    onStart?.();

    cleanupFunction = createSimpleAnimation(
      duration,
      easing,
      (animProgress) => {
        setProgress(animProgress);
        onUpdate?.(animProgress);
      },
      () => {
        setIsActive(false);
        setIsCompleted(true);
        setProgress(1);
        onComplete?.();
      }
    );
  };

  const stop = (): void => {
    if (cleanupFunction) {
      cleanupFunction();
      cleanupFunction = null;
    }
    setIsActive(false);
  };

  const toggle = (): void => {
    if (isActive()) {
      stop();
    } else {
      start();
    }
  };

  const reset = (): void => {
    stop();
    setIsCompleted(false);
    setProgress(0);
  };

  // Cleanup on unmount
  onCleanup(() => {
    stop();
  });

  return {
    isActive,
    isCompleted,
    progress,
    start,
    stop,
    toggle,
    reset,
  };
}

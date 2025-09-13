/**
 * Animation Timing
 *
 * Timing utilities for staggered animations.
 */

import type { AnimationConfig } from "./AnimationConfig.js";

/**
 * Calculate stagger delay for a given index
 */
export function calculateStaggerDelay(
  index: number,
  totalItems: number,
  config: AnimationConfig,
): number {
  const { baseDelay, staggerStep, maxDelay, direction } = config;

  let delay = baseDelay;

  switch (direction) {
    case "forward":
      delay += index * staggerStep;
      break;
    case "reverse":
      delay += (totalItems - 1 - index) * staggerStep;
      break;
    case "center-out":
      const center = Math.floor(totalItems / 2);
      const distance = Math.abs(index - center);
      delay += distance * staggerStep;
      break;
  }

  return Math.min(delay, maxDelay);
}

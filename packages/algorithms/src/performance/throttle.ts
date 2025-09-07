/**
 * Throttling and Debouncing Utilities
 *
 * Function throttling and debouncing utilities for performance optimization.
 *
 * @module algorithms/performance/throttle
 */

import type { ThrottleOptions, DebounceOptions } from './types';

/**
 * Throttle function execution
 */
export function throttle<T extends (...args: any[]) => any>(func: T, wait: number, options: ThrottleOptions = {}): T {
  let timeoutId: number | null = null;
  let lastExecTime = 0;
  let lastArgs: any[] | null = null;

  const { leading = true, trailing = true, maxWait } = options;

  return ((...args: any[]) => {
    const now = Date.now();
    const timeSinceLastExec = now - lastExecTime;

    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }

    if (leading && timeSinceLastExec >= wait) {
      lastExecTime = now;
      return func(...args);
    }

    if (trailing) {
      lastArgs = args;
      const delay = maxWait ? Math.min(wait, maxWait - timeSinceLastExec) : wait;

      timeoutId = window.setTimeout(() => {
        if (lastArgs) {
          lastExecTime = Date.now();
          func(...lastArgs);
          lastArgs = null;
        }
      }, delay);
    }
  }) as T;
}

/**
 * Debounce function execution
 */
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number, options: DebounceOptions = {}): T {
  let timeoutId: number | null = null;
  let lastExecTime = 0;
  let lastArgs: any[] | null = null;

  const { leading = false, trailing = true, maxWait } = options;

  return ((...args: any[]) => {
    const now = Date.now();
    const timeSinceLastExec = now - lastExecTime;

    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }

    if (leading && timeSinceLastExec >= wait) {
      lastExecTime = now;
      return func(...args);
    }

    if (trailing) {
      lastArgs = args;
      const delay = maxWait ? Math.min(wait, maxWait - timeSinceLastExec) : wait;

      timeoutId = window.setTimeout(() => {
        if (lastArgs) {
          lastExecTime = Date.now();
          func(...lastArgs);
          lastArgs = null;
        }
      }, delay);
    }
  }) as T;
}

/**
 * Rate Limiting Utilities
 * Functions for debouncing and throttling operations
 */

/**
 * Debounces an async function
 *
 * @param fn - Async function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 *
 * @example
 * const debouncedSave = debounce(saveData, 500);
 */
export function debounce<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let pendingPromise: Promise<ReturnType<T>> | null = null;
  let resolvePending: ((value: ReturnType<T>) => void) | null = null;
  let rejectPending: ((error: any) => void) | null = null;
  let currentArgs: Parameters<T> | null = null;

  return (...args: Parameters<T>): Promise<ReturnType<T>> => {
    // Store the latest arguments
    currentArgs = args;

    // Cancel previous timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // If there's no pending promise, create a new one
    if (!pendingPromise) {
      pendingPromise = new Promise<ReturnType<T>>((resolve, reject) => {
        resolvePending = resolve;
        rejectPending = reject;
      });
    }

    timeoutId = setTimeout(async () => {
      // Use the latest arguments
      const argsToUse = currentArgs!;

      try {
        const result = await fn(...argsToUse);
        if (resolvePending) {
          resolvePending(result);
        }
      } catch (error) {
        if (rejectPending) {
          rejectPending(error);
        }
      } finally {
        // Clean up
        pendingPromise = null;
        resolvePending = null;
        rejectPending = null;
        timeoutId = null;
        currentArgs = null;
      }
    }, delay);

    return pendingPromise;
  };
}

/**
 * Throttles an async function
 *
 * @param fn - Async function to throttle
 * @param delay - Minimum delay between executions
 * @returns Throttled function
 *
 * This function implements leading-edge throttling, meaning only the first call
 * in a burst executes immediately, and subsequent calls are completely ignored
 * until the delay period passes.
 */
export function throttle<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => Promise<ReturnType<T> | void> {
  let lastExecuted = 0;
  let isThrottled = false;

  return async (...args: Parameters<T>): Promise<ReturnType<T> | void> => {
    const now = Date.now();

    if (!isThrottled || now - lastExecuted >= delay) {
      lastExecuted = now;
      isThrottled = true;

      // Reset throttled flag after delay
      setTimeout(() => {
        isThrottled = false;
      }, delay);

      return await fn(...args);
    }

    // If we're in a throttled period, return a resolved promise with no value
    // This ensures the function is never called during the throttled period
    return Promise.resolve();
  };
}

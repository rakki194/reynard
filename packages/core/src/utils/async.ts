/**
 * Async Utilities
 * Helpful utilities for async operations, promises, and timing
 */

/**
 * Creates a promise that resolves after a specified delay
 *
 * @param ms - The delay in milliseconds
 * @returns Promise that resolves after the delay
 *
 * @example
 * await sleep(1000); // Wait 1 second
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Creates a promise that resolves after a delay with a value
 *
 * @param value - The value to resolve with
 * @param ms - The delay in milliseconds
 * @returns Promise that resolves with the value after the delay
 */
export function delay<T>(value: T, ms: number): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

/**
 * Timeout wrapper for promises
 *
 * @param promise - The promise to wrap
 * @param ms - Timeout in milliseconds
 * @param errorMessage - Custom error message for timeout
 * @returns Promise that rejects if timeout is reached
 *
 * @example
 * const result = await withTimeout(fetch('/api/data'), 5000);
 */
export function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  errorMessage: string = "Operation timed out"
): Promise<T> {
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(errorMessage)), ms);
  });

  return Promise.race([promise, timeout]);
}

/**
 * Retry a promise-returning function with exponential backoff
 *
 * @param fn - Function that returns a promise
 * @param maxRetries - Maximum number of retry attempts
 * @param baseDelay - Base delay in milliseconds (doubles with each retry)
 * @returns Promise that resolves/rejects after all retries
 *
 * @example
 * const result = await retry(() => fetch('/api/data'), 3);
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === maxRetries) {
        throw lastError;
      }

      // Exponential backoff: baseDelay * 2^attempt
      const delayMs = baseDelay * Math.pow(2, attempt);
      await sleep(delayMs);
    }
  }

  throw lastError!;
}

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
  let timeoutId: NodeJS.Timeout | null = null;
  let pendingPromise: Promise<ReturnType<T>> | null = null;

  return (...args: Parameters<T>): Promise<ReturnType<T>> => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    if (!pendingPromise) {
      pendingPromise = new Promise((resolve, reject) => {
        timeoutId = setTimeout(async () => {
          try {
            const result = await fn(...args);
            resolve(result);
          } catch (error) {
            reject(error);
          } finally {
            pendingPromise = null;
            timeoutId = null;
          }
        }, delay);
      });
    }

    return pendingPromise;
  };
}

/**
 * Throttles an async function
 *
 * @param fn - Async function to throttle
 * @param delay - Minimum delay between executions
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => Promise<ReturnType<T> | void> {
  let lastExecuted = 0;
  let pendingPromise: Promise<ReturnType<T>> | null = null;

  return async (...args: Parameters<T>): Promise<ReturnType<T> | void> => {
    const now = Date.now();

    if (now - lastExecuted >= delay) {
      lastExecuted = now;
      return await fn(...args);
    }

    if (!pendingPromise) {
      pendingPromise = new Promise((resolve) => {
        setTimeout(async () => {
          lastExecuted = Date.now();
          const result = await fn(...args);
          pendingPromise = null;
          resolve(result);
        }, delay - (now - lastExecuted));
      });
    }

    return pendingPromise;
  };
}

/**
 * Executes promises in batches with a maximum concurrency
 *
 * @param promises - Array of promise-returning functions
 * @param batchSize - Maximum number of concurrent promises
 * @returns Promise that resolves when all batches complete
 *
 * @example
 * const urls = ['url1', 'url2', 'url3', 'url4'];
 * const fetchFunctions = urls.map(url => () => fetch(url));
 * const results = await batchExecute(fetchFunctions, 2);
 */
export async function batchExecute<T>(
  promises: Array<() => Promise<T>>,
  batchSize: number = 5
): Promise<T[]> {
  const results: T[] = [];
  
  for (let i = 0; i < promises.length; i += batchSize) {
    const batch = promises.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(fn => fn()));
    results.push(...batchResults);
  }

  return results;
}

/**
 * Maps over an array with limited concurrency
 *
 * @param items - Array of items to process
 * @param mapper - Async function to apply to each item
 * @param concurrency - Maximum number of concurrent operations
 * @returns Promise that resolves with mapped results
 */
export async function mapWithConcurrency<T, U>(
  items: T[],
  mapper: (item: T, index: number) => Promise<U>,
  concurrency: number = 5
): Promise<U[]> {
  const results: U[] = new Array(items.length);
  const executing: Promise<void>[] = [];

  for (let i = 0; i < items.length; i++) {
    const promise = mapper(items[i], i).then(result => {
      results[i] = result;
    });

    executing.push(promise);

    if (executing.length >= concurrency) {
      await Promise.race(executing);
      executing.splice(executing.findIndex(p => p === promise), 1);
    }
  }

  await Promise.all(executing);
  return results;
}

/**
 * Polls a condition until it becomes true or timeout is reached
 *
 * @param condition - Function that returns a promise or boolean
 * @param interval - Polling interval in milliseconds
 * @param timeout - Maximum time to wait in milliseconds
 * @returns Promise that resolves when condition is true
 */
export async function poll(
  condition: () => Promise<boolean> | boolean,
  interval: number = 1000,
  timeout: number = 30000
): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return;
    }
    await sleep(interval);
  }

  throw new Error("Polling timeout reached");
}

/**
 * Creates a memoized version of an async function
 *
 * @param fn - Async function to memoize
 * @param keyGenerator - Function to generate cache key from arguments
 * @returns Memoized function
 */
export function memoizeAsync<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, Promise<ReturnType<T>>>();

  return ((...args: Parameters<T>): Promise<ReturnType<T>> => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const promise = fn(...args);
    cache.set(key, promise);

    // Clean up cache on error
    promise.catch(() => cache.delete(key));

    return promise;
  }) as T;
}

/**
 * Waits for the next event loop tick
 */
export function nextTick(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0));
}

/**
 * Waits for the next animation frame (browser only)
 */
export function nextFrame(): Promise<number> {
  return new Promise(resolve => {
    if (typeof requestAnimationFrame !== "undefined") {
      requestAnimationFrame(() => resolve(Date.now()));
    } else {
      setTimeout(() => resolve(Date.now()), 16); // ~60fps fallback
    }
  });
}

/**
 * Creates a cancelable promise
 */
export interface CancelablePromise<T> extends Promise<T> {
  cancel: () => void;
  isCanceled: () => boolean;
}

export function makeCancelable<T>(promise: Promise<T>): CancelablePromise<T> {
  let isCanceled = false;

  const wrappedPromise = new Promise<T>((resolve, reject) => {
    promise
      .then(value => {
        if (!isCanceled) {
          resolve(value);
        }
      })
      .catch(error => {
        if (!isCanceled) {
          reject(error);
        }
      });
  }) as CancelablePromise<T>;

  wrappedPromise.cancel = () => {
    isCanceled = true;
  };

  wrappedPromise.isCanceled = () => isCanceled;

  return wrappedPromise;
}

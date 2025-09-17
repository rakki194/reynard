/**
 * Throttling and Debouncing Utilities
 *
 * Function throttling and debouncing utilities for performance optimization.
 *
 * @module algorithms/performance/throttle
 */
/**
 * Throttle function execution
 */
export function throttle(func, wait, options = {}) {
    let timeoutId = null;
    let lastExecTime = 0;
    let lastArgs = null;
    let lastResult;
    const { leading = true, trailing = true, maxWait } = options;
    const throttled = ((...args) => {
        const now = performance.now();
        const timeSinceLastExec = now - lastExecTime;
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }
        if (leading && timeSinceLastExec >= wait) {
            lastExecTime = now;
            lastResult = func(...args);
            return lastResult;
        }
        if (trailing) {
            lastArgs = args;
            const delay = maxWait
                ? Math.min(wait, maxWait - timeSinceLastExec)
                : wait;
            timeoutId = window.setTimeout(() => {
                if (lastArgs) {
                    lastExecTime = performance.now();
                    lastResult = func(...lastArgs);
                    lastArgs = null;
                }
            }, delay);
        }
        return lastResult;
    });
    throttled.cancel = () => {
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }
        lastArgs = null;
    };
    throttled.flush = () => {
        if (lastArgs) {
            lastExecTime = performance.now();
            lastResult = func(...lastArgs);
            lastArgs = null;
            return lastResult;
        }
        return lastResult;
    };
    return throttled;
}
/**
 * Debounce function execution
 */
export function debounce(func, wait, options = {}) {
    let timeoutId = null;
    let lastExecTime = 0;
    let lastArgs = null;
    let lastResult;
    const { leading = false, trailing = true, maxWait } = options;
    const debounced = ((...args) => {
        const now = performance.now();
        const timeSinceLastExec = now - lastExecTime;
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }
        if (leading && timeSinceLastExec >= wait) {
            lastExecTime = now;
            lastResult = func(...args);
            return lastResult;
        }
        if (trailing) {
            lastArgs = args;
            const delay = maxWait
                ? Math.min(wait, maxWait - timeSinceLastExec)
                : wait;
            timeoutId = window.setTimeout(() => {
                if (lastArgs) {
                    lastExecTime = performance.now();
                    lastResult = func(...lastArgs);
                    lastArgs = null;
                }
            }, delay);
        }
        return lastResult;
    });
    debounced.cancel = () => {
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }
        lastArgs = null;
    };
    debounced.flush = () => {
        if (lastArgs) {
            lastExecTime = performance.now();
            lastResult = func(...lastArgs);
            lastArgs = null;
            return lastResult;
        }
        return lastResult;
    };
    return debounced;
}

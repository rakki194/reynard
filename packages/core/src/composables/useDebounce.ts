/**
 * Debounce composable - debounced reactive values
 * Delays updates to a value until after a specified delay
 */

import { createSignal, createEffect } from 'solid-js';

/**
 * Debounces a reactive value
 */
export const useDebounce = <T>(value: () => T, delay: number) => {
  const [debouncedValue, setDebouncedValue] = createSignal<T>(value());

  createEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value());
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  });

  return debouncedValue;
};

/**
 * Debounces a function call
 */
export const useDebouncedCallback = <TArgs extends unknown[]>(
  callback: (...args: TArgs) => void,
  delay: number
) => {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: TArgs) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => callback(...args), delay);
  };
};

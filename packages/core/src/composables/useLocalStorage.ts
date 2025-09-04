/**
 * LocalStorage composable - reactive localStorage with SolidJS
 * Provides persistent reactive state synchronized with localStorage
 */

import { createSignal, createEffect } from 'solid-js';

export interface UseLocalStorageOptions<T> {
  /** Default value if key doesn't exist */
  defaultValue: T;
  /** Custom serializer */
  serializer?: {
    read: (value: string) => T;
    write: (value: T) => string;
  };
  /** Storage event listener */
  syncAcrossTabs?: boolean;
}

const defaultSerializer = {
  read: JSON.parse,
  write: JSON.stringify,
};

/**
 * Reactive localStorage hook
 */
export const useLocalStorage = <T>(
  key: string,
  options: UseLocalStorageOptions<T>
) => {
  const { defaultValue, serializer = defaultSerializer, syncAcrossTabs = true } = options;

  // Get initial value from localStorage
  const getInitialValue = (): T => {
    if (typeof window === 'undefined') return defaultValue;
    
    try {
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue;
      return serializer.read(item);
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  };

  const [value, setValue] = createSignal<T>(getInitialValue());

  // Update localStorage when value changes
  createEffect(() => {
    const currentValue = value();
    
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(key, serializer.write(currentValue));
    } catch (error) {
      console.warn(`Error writing to localStorage key "${key}":`, error);
    }
  });

  // Listen for storage events (when changed in other tabs)
  if (typeof window !== 'undefined' && syncAcrossTabs) {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setValue(serializer.read(e.newValue));
        } catch (error) {
          console.warn(`Error parsing storage event for key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Cleanup on component unmount would be handled by the consuming component
  }

  const remove = () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
    setValue(() => defaultValue);
  };

  return [value, setValue, remove] as const;
};

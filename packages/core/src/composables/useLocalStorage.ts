/**
 * LocalStorage composable - reactive localStorage with SolidJS
 * Provides persistent reactive state synchronized with localStorage
 */

import { createSignal, createEffect, onCleanup } from "solid-js";

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

// Safe JSON parser that prevents XSS attacks
const safeJsonParse = (value: string): any => {
  try {
    // Basic validation to prevent prototype pollution and XSS
    if (typeof value !== "string" || value.length > 1000000) {
      // 1MB limit
      throw new Error("Invalid JSON input");
    }

    // Check for dangerous patterns
    if (
      value.includes("__proto__") ||
      value.includes("constructor") ||
      value.includes("prototype")
    ) {
      throw new Error("Potentially dangerous JSON detected");
    }

    return JSON.parse(value);
  } catch (error) {
    console.warn("Failed to parse JSON from localStorage:", error);
    throw error;
  }
};

const defaultSerializer = {
  read: safeJsonParse,
  write: JSON.stringify,
};

/**
 * Reactive localStorage hook
 */
export const useLocalStorage = <T>(
  key: string,
  options: UseLocalStorageOptions<T>,
) => {
  const {
    defaultValue,
    serializer = defaultSerializer,
    syncAcrossTabs = true,
  } = options;

  // Validate key input
  if (!key || typeof key !== "string" || key.trim() === "") {
    throw new Error("useLocalStorage key must be a non-empty string");
  }

  // Get initial value from localStorage
  const getInitialValue = (): T => {
    if (typeof window === "undefined") return defaultValue;

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

    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(key, serializer.write(currentValue));
    } catch (error) {
      console.warn(`Error writing to localStorage key "${key}":`, error);
    }
  });

  // Storage event handler with proper cleanup
  let handleStorageChange: ((e: StorageEvent) => void) | null = null;

  if (typeof window !== "undefined" && syncAcrossTabs) {
    handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setValue(serializer.read(e.newValue));
        } catch (error) {
          console.warn(`Error parsing storage event for key "${key}":`, error);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
  }

  // Cleanup function
  const cleanup = () => {
    if (handleStorageChange && typeof window !== "undefined") {
      window.removeEventListener("storage", handleStorageChange);
      handleStorageChange = null;
    }
  };

  // Register cleanup
  onCleanup(cleanup);

  const remove = () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(key);
    setValue(() => defaultValue);
  };

  return [value, setValue, remove, cleanup] as const;
};

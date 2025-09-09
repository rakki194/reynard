import { createSignal, createEffect, onCleanup } from "solid-js";

export interface LocalStorageOptions {
  defaultValue?: any;
  serializer?: {
    read: (value: string) => any;
    write: (value: any) => string;
  };
  syncAcrossTabs?: boolean;
}

/**
 * Local storage composable with reactive updates and cross-tab synchronization
 *
 * @param key Storage key
 * @param options Configuration options
 * @returns Signal with storage value and setter
 */
export function useLocalStorage(
  key: string,
  options: LocalStorageOptions = {},
) {
  const {
    defaultValue,
    serializer = {
      read: (value: string) => {
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      },
      write: (value: any) => JSON.stringify(value),
    },
    syncAcrossTabs = true,
  } = options;

  // Read initial value from localStorage
  const readStorage = (): any => {
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return defaultValue;
      }
      return serializer.read(item);
    } catch {
      return defaultValue;
    }
  };

  const [storedValue, setStoredValue] = createSignal(readStorage());

  // Write to localStorage
  const setValue = (value: any) => {
    try {
      const serializedValue = serializer.write(value);
      localStorage.setItem(key, serializedValue);
      setStoredValue(value);
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error);
    }
  };

  // Remove from localStorage
  const removeValue = () => {
    try {
      localStorage.removeItem(key);
      setStoredValue(defaultValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  };

  // Handle storage events for cross-tab synchronization
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === key && e.storageArea === localStorage) {
      if (e.newValue === null) {
        setStoredValue(defaultValue);
      } else {
        try {
          setStoredValue(serializer.read(e.newValue));
        } catch {
          setStoredValue(defaultValue);
        }
      }
    }
  };

  // Set up cross-tab synchronization
  if (syncAcrossTabs) {
    createEffect(() => {
      window.addEventListener("storage", handleStorageChange);

      onCleanup(() => {
        window.removeEventListener("storage", handleStorageChange);
      });
    });
  }

  return [storedValue, setValue, removeValue] as const;
}

/**
 * Session storage composable with reactive updates
 *
 * @param key Storage key
 * @param options Configuration options
 * @returns Signal with storage value and setter
 */
export function useSessionStorage(
  key: string,
  options: Omit<LocalStorageOptions, "syncAcrossTabs"> = {},
) {
  const {
    defaultValue,
    serializer = {
      read: (value: string) => {
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      },
      write: (value: any) => JSON.stringify(value),
    },
  } = options;

  // Read initial value from sessionStorage
  const readStorage = (): any => {
    try {
      const item = sessionStorage.getItem(key);
      if (item === null) {
        return defaultValue;
      }
      return serializer.read(item);
    } catch {
      return defaultValue;
    }
  };

  const [storedValue, setStoredValue] = createSignal(readStorage());

  // Write to sessionStorage
  const setValue = (value: any) => {
    try {
      const serializedValue = serializer.write(value);
      sessionStorage.setItem(key, serializedValue);
      setStoredValue(value);
    } catch (error) {
      console.error(`Error writing to sessionStorage key "${key}":`, error);
    }
  };

  // Remove from sessionStorage
  const removeValue = () => {
    try {
      sessionStorage.removeItem(key);
      setStoredValue(defaultValue);
    } catch (error) {
      console.error(`Error removing sessionStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue, removeValue] as const;
}

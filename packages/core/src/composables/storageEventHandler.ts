/**
 * Storage event handling utilities for cross-tab synchronization
 */

import { Setter } from "solid-js";
import type { Serializer } from "./localStorageSerializer";
import { i18n } from 'reynard-i18n';

export interface StorageEventHandler<_T = unknown> {
  handleStorageChange: (e: StorageEvent) => void;
  cleanup: () => void;
}

/**
 * Creates a storage event handler for cross-tab synchronization
 */
export const createStorageEventHandler = <T>(
  key: string,
  setValue: Setter<T>,
  serializer: Serializer<T>
): StorageEventHandler<T> => {
  let handleStorageChange: ((e: StorageEvent) => void) | null = null;

  if (typeof window !== "undefined") {
    handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setValue(() => serializer.read(e.newValue!));
        } catch (error) {
          console.warn(i18n.t('core.storage.error-parsing-storage-event') + ` "${key}":`, error);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
  }

  const cleanup = () => {
    if (handleStorageChange && typeof window !== "undefined") {
      window.removeEventListener("storage", handleStorageChange);
      handleStorageChange = null;
    }
  };

  return {
    handleStorageChange: handleStorageChange || (() => {}),
    cleanup,
  };
};

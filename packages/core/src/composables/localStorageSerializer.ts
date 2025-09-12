/**
 * Safe JSON serialization utilities for localStorage
 * Prevents XSS attacks and prototype pollution
 */

import { i18n } from "reynard-i18n";

export interface Serializer<T = unknown> {
  read: (value: string) => T;
  write: (value: T) => string;
}

// Type for JSON-serializable values
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

// Safe JSON parser that prevents XSS attacks
const safeJsonParse = <T = unknown>(value: string): T => {
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
      throw new Error(
        i18n.t("core.storage.potentially-dangerous-json-detected"),
      );
    }

    return JSON.parse(value) as T;
  } catch (error) {
    console.warn(
      i18n.t("core.storage.failed-to-parse-json-from-localstorage"),
      error,
    );
    throw error;
  }
};

export const defaultSerializer: Serializer<unknown> = {
  read: <T = unknown>(value: string): T => safeJsonParse<T>(value),
  write: JSON.stringify,
};

/**
 * Namespace loading functionality for Reynard framework
 * Handles dynamic namespace loading and optimization
 */

import type { LanguageCode } from "../types";
import { loadNamespace } from "../loaders";

/**
 * Creates namespace loading functionality
 */
export function createNamespaceLoader(locale: () => LanguageCode, optimizedLoader?: any) {
  const loadNamespaceFunc = async <T = any>(namespace: string): Promise<T> => {
    const currentLocale = locale();
    if (optimizedLoader) {
      return optimizedLoader.loadNamespace(currentLocale, namespace) as Promise<T>;
    }
    return loadNamespace<T>(currentLocale, namespace);
  };

  return {
    loadNamespace: loadNamespaceFunc,
  };
}

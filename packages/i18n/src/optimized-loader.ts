/**
 * Optimized loader utilities for tree-shaking and performance
 * Provides helpers for loading only used namespaces
 */

import type { LanguageCode } from "./types";
import { loadNamespace } from "./namespace-loader";
import { loadTranslationsWithCache } from "./translation-loader";

// Tree-shaking helper - only load used namespaces
export const createOptimizedLoader = (usedNamespaces: string[]) => {
  return {
    loadNamespace: async <T = unknown>(locale: LanguageCode, namespace: string): Promise<T> => {
      if (!usedNamespaces.includes(namespace)) {
        console.warn(`Namespace ${namespace} not in used namespaces list. Consider adding it to optimize bundle size.`);
      }
      return loadNamespace<T>(locale, namespace);
    },
    loadFull: (locale: LanguageCode) => loadTranslationsWithCache(locale)
  };
};

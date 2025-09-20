/**
 * Optimized loader utilities for tree-shaking and performance
 * Provides helpers for loading only used namespaces
 */

import type { LanguageCode } from "../../types";
import { loadNamespace } from "../namespace/namespace-loader";
import { loadTranslationModuleCore } from "./LoaderCore";

// Tree-shaking helper - only load used namespaces
export const createOptimizedLoader = (usedNamespaces: string[]) => {
  return {
    loadNamespace: async <T = unknown>(locale: LanguageCode, namespace: string): Promise<T> => {
      if (!usedNamespaces.includes(namespace)) {
        console.warn(`Namespace ${namespace} not in used namespaces list. Consider adding it to optimize bundle size.`);
      }
      return loadNamespace<T>(locale, namespace);
    },
    loadFull: (locale: LanguageCode) =>
      loadTranslationModuleCore(locale, () =>
        Promise.resolve({
          default: {
            common: {},
            themes: {},
            core: {},
            components: {},
            gallery: {},
            charts: {},
            auth: {},
            chat: {},
            monaco: {},
          } as any,
        })
      ),
  };
};

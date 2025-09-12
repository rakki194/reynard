/**
 * Feature Registry Core
 *
 * Core functionality for the feature registry.
 */

import { createSignal } from "solid-js";
import type { FeatureDefinition } from "./types.js";

export interface FeatureRegistryCore {
  functionalities: ReturnType<typeof createSignal<Map<string, FeatureDefinition>>>;
  getFunctionalities: () => Map<string, FeatureDefinition>;
  setFunctionalities: (value: Map<string, FeatureDefinition>) => void;
}

/**
 * Create feature registry core
 */
export function createFeatureRegistryCore(): FeatureRegistryCore {
  const functionalities = createSignal<Map<string, FeatureDefinition>>(new Map());
  const getFunctionalities = () => functionalities[0]();
  const setFunctionalities = (value: Map<string, FeatureDefinition>) => functionalities[1](value);

  return {
    functionalities,
    getFunctionalities,
    setFunctionalities,
  };
}


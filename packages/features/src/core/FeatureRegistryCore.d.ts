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
export declare function createFeatureRegistryCore(): FeatureRegistryCore;

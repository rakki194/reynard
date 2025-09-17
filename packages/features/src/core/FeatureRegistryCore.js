/**
 * Feature Registry Core
 *
 * Core functionality for the feature registry.
 */
import { createSignal } from "solid-js";
/**
 * Create feature registry core
 */
export function createFeatureRegistryCore() {
    const functionalities = createSignal(new Map());
    const getFunctionalities = () => functionalities[0]();
    const setFunctionalities = (value) => functionalities[1](value);
    return {
        functionalities,
        getFunctionalities,
        setFunctionalities,
    };
}

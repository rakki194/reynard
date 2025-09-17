/**
 * NLWeb Health Actions
 *
 * Health management for the NLWeb composable.
 */
import { NLWebState } from "./useNLWebState.js";
/**
 * Create health action
 */
export declare function createHealthAction(state: NLWebState, baseUrl: string, requestTimeout: number): () => Promise<void>;
/**
 * Create configuration action
 */
export declare function createConfigurationAction(state: NLWebState, baseUrl: string, requestTimeout: number): () => Promise<void>;

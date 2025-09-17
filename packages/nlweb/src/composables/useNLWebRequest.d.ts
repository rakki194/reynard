/**
 * NLWeb Request Utilities
 *
 * Request utilities for the NLWeb composable.
 */
import { NLWebState } from "./useNLWebState.js";
/**
 * Make HTTP request with timeout
 */
export declare function makeNLWebRequest<T>(endpoint: string, baseUrl: string, requestTimeout: number, options?: RequestInit): Promise<T>;
/**
 * Handle API error
 */
export declare function handleAPIError(state: NLWebState, error: unknown, defaultMessage: string): void;

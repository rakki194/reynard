/**
 * NLWeb Router Cache
 *
 * Cache management for the NLWeb router.
 */
import { NLWebSuggestionRequest, NLWebSuggestionResponse } from "../types/index.js";
export interface CacheEntry {
    response: NLWebSuggestionResponse;
    timestamp: number;
}
export interface NLWebRouterCache {
    get: (key: string) => CacheEntry | undefined;
    set: (key: string, entry: CacheEntry) => void;
    generateCacheKey: (request: NLWebSuggestionRequest) => string;
    isCacheValid: (timestamp: number) => boolean;
    cleanup: () => void;
}
/**
 * Create NLWeb router cache
 */
export declare function createNLWebRouterCache(cacheTtl: number, maxCacheSize: number): NLWebRouterCache;

/**
 * NLWeb Router Cache
 *
 * Cache management for the NLWeb router.
 */
/**
 * Create NLWeb router cache
 */
export function createNLWebRouterCache(cacheTtl, maxCacheSize) {
    const cache = new Map();
    const get = (key) => {
        return cache.get(key);
    };
    const set = (key, entry) => {
        // Remove oldest entries if cache is full
        if (cache.size >= maxCacheSize) {
            const oldestKey = cache.keys().next().value;
            if (oldestKey) {
                cache.delete(oldestKey);
            }
        }
        cache.set(key, entry);
    };
    const generateCacheKey = (request) => {
        const key = `${request.query}:${JSON.stringify(request.context)}:${request.maxSuggestions}`;
        return btoa(key).replace(/[^a-zA-Z0-9]/g, "");
    };
    const isCacheValid = (timestamp) => {
        return Date.now() - timestamp < cacheTtl;
    };
    const cleanup = () => {
        for (const [key, entry] of cache.entries()) {
            if (!isCacheValid(entry.timestamp)) {
                cache.delete(key);
            }
        }
    };
    return {
        get,
        set,
        generateCacheKey,
        isCacheValid,
        cleanup,
    };
}

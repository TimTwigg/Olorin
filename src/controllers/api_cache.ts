import { deepCopy } from "@src/controllers/utils";

class APICacheEntry {
    timestamp: Date;
    data: any;

    constructor(data: any) {
        this.timestamp = new Date();
        this.data = data;
    }
}

/**
 * Cache entry validity period in seconds.
 */
const CACHE_AGING = import.meta.env.VITE_CACHE_AGING ? Number(import.meta.env.VITE_CACHE_AGING) : 600; // Default to 5 minutes

/**
 * Cache for API functions to avoid redundant calls.
 */
var FUNCTION_CACHE = new Map<string, APICacheEntry>()

/**
 * Excluded routes from caching.
 */
const CACHE_EXCLUDED_ROUTES = [
    "/encounter",
    "/support",
    "/campaign",
    "/campaign/",
    "/player",
    "/player/",
]

/**
 * Functions that are cacheable.
 */
const CACHEABLE_FUNCTIONS = [
    "request",
]

/**
 * Create a cache key based on the function name and its arguments.
 * 
 * @param func - the function name to create a cache key for
 * @param args - the arguments to include in the cache key
 * 
 * @returns string - the generated cache key
 */
function createCacheKey(func: string, args: any[]): string {
    return func + "::" + JSON.stringify(args);
}

/**
 * Get the route from a cache key.
 * 
 * @param cache_key - the cache key to extract the route from
 * 
 * @returns string - the extracted route
 */
function getRouteFromCacheKey(cache_key: string): string {
    const parts = cache_key.split("::");
    if (parts.length > 1) {
        let args = JSON.parse(parts[1]);
        return args[0] || "";
    }
    return "";
}

/** Check if a function is cacheable.
 * 
 * @param func - the function name to check
 * 
 * @returns boolean - true if the function is cacheable, false otherwise
 */
function isCacheableFunction(func: string): boolean {
    return CACHEABLE_FUNCTIONS.includes(func);
}

/**
 * Check if a route is cacheable.
 * 
 * @param route - the route to check
 * 
 * @returns boolean - true if the route is cacheable, false otherwise
 */
function isCacheableRoute(route: string): boolean {
    return !CACHE_EXCLUDED_ROUTES.some((excludedRoute) => route === excludedRoute);
}

/**
 * Retrieve data from the cache if available and not expired.
 * 
 * @param cache_key - the key to check in the cache
 * 
 * @returns APICacheEntry | null - the cached entry if available and valid, otherwise null
 */
function checkCache(cache_key: string): APICacheEntry | null {
    if (FUNCTION_CACHE.has(cache_key) && isCacheableRoute(getRouteFromCacheKey(cache_key))) {
        const entry = FUNCTION_CACHE.get(cache_key);
        if (entry) {
            const now = new Date();
            const age = (now.getTime() - entry.timestamp.getTime()) / 1000;
            if (age < CACHE_AGING) {
                if (import.meta.env.DEV) console.log(`Cache hit for key: ${cache_key}, age: ${age} s`);
                return deepCopy(entry);
            } else {
                if (import.meta.env.DEV) console.log(`Cache expired for key: ${cache_key}, age: ${age} s`);
                FUNCTION_CACHE.delete(cache_key);
            }
        }
    }
    return null;
}

/**
 * Set a cache entry with the given key and data.
 * 
 * @param cache_key - the key to set in the cache
 * @param data - the data to store in the cache
 */
function setCacheEntry(cache_key: string, data: any): void {
    FUNCTION_CACHE.set(cache_key, new APICacheEntry(data));
}

export {
    APICacheEntry,
    createCacheKey,
    isCacheableFunction,
    isCacheableRoute,
    checkCache,
    setCacheEntry
}
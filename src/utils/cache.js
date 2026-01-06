/**
 * Cache utility for storing API responses and reducing redundant requests
 */

class CacheManager {
    constructor() {
        this.cache = new Map();
        this.expiryTimes = new Map();
        this.defaultTTL = 5 * 60 * 1000; // 5 minutes default
    }

    /**
     * Generate a cache key from URL and params
     */
    generateKey(url, params = {}) {
        const paramString = JSON.stringify(params);
        return `${url}:${paramString}`;
    }

    /**
     * Set a value in cache with optional TTL
     */
    set(key, value, ttl = this.defaultTTL) {
        this.cache.set(key, value);
        this.expiryTimes.set(key, Date.now() + ttl);
        console.log(`💾 [CACHE] Stored: ${key} (TTL: ${ttl}ms)`);
    }

    /**
     * Get a value from cache if not expired
     */
    get(key) {
        const expiry = this.expiryTimes.get(key);

        if (!expiry || Date.now() > expiry) {
            // Expired or doesn't exist
            this.delete(key);
            console.log(`❌ [CACHE] Miss: ${key}`);
            return null;
        }

        console.log(`✅ [CACHE] Hit: ${key}`);
        return this.cache.get(key);
    }

    /**
     * Delete a specific cache entry
     */
    delete(key) {
        this.cache.delete(key);
        this.expiryTimes.delete(key);
    }

    /**
     * Clear all cache entries
     */
    clear() {
        this.cache.clear();
        this.expiryTimes.clear();
        console.log('🗑️ [CACHE] Cleared all entries');
    }

    /**
     * Clear cache entries matching a pattern
     */
    clearPattern(pattern) {
        const regex = new RegExp(pattern);
        let cleared = 0;

        for (const key of this.cache.keys()) {
            if (regex.test(key)) {
                this.delete(key);
                cleared++;
            }
        }

        console.log(`🗑️ [CACHE] Cleared ${cleared} entries matching: ${pattern}`);
    }

    /**
     * Get cache statistics
     */
    getStats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }
}

// Create singleton instance
const cacheManager = new CacheManager();

export default cacheManager;

// Cache TTL presets (in milliseconds)
export const CacheTTL = {
    SHORT: 1 * 60 * 1000,      // 1 minute
    MEDIUM: 5 * 60 * 1000,     // 5 minutes
    LONG: 15 * 60 * 1000,      // 15 minutes
    VERY_LONG: 60 * 60 * 1000, // 1 hour
    STATIC: 24 * 60 * 60 * 1000 // 24 hours (for images, etc.)
};

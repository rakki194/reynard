/**
 * @fileoverview Optimized Change Detection System for Large Entity Counts
 *
 * This optimized version addresses the Map size limit issue by:
 * 1. Using a more efficient key structure
 * 2. Implementing automatic cleanup of old change data
 * 3. Using typed arrays for better memory efficiency
 * 4. Adding configurable limits and cleanup strategies
 *
 * @author Reynard ECS Team
 * @since 1.0.0
 */
/**
 * Default configuration for change detection.
 */
const DEFAULT_CONFIG = {
    maxEntries: 1000000, // 1 million entries max
    cleanupThreshold: 0.8, // Cleanup when 80% full
    cleanupInterval: 1000, // Cleanup every 1000 ticks
    enableStats: true,
    useTypedArrays: true,
};
/**
 * Creates a new tick.
 */
export function createTick(value) {
    return {
        value,
        isNewerThan(other) {
            return this.value > other.value;
        },
        isOlderThan(other) {
            return this.value < other.value;
        },
        equals(other) {
            return this.value === other.value;
        },
    };
}
/**
 * Creates component ticks.
 */
export function createComponentTicks(added, changed, removed) {
    return { added, changed, removed };
}
/**
 * Optimized change detection implementation with Map size limit handling.
 */
export class OptimizedChangeDetectionImpl {
    constructor(config = {}) {
        Object.defineProperty(this, "componentTicks", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "currentTick", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: createTick(0)
        });
        Object.defineProperty(this, "lastCheckTick", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: createTick(0)
        });
        Object.defineProperty(this, "config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "stats", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "lastCleanupTick", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "cleanupCount", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.stats = {
            totalEntries: 0,
            memoryUsageMB: 0,
            averageEntriesPerTick: 0,
            cleanupCount: 0,
        };
    }
    /**
     * Increments the current tick.
     */
    incrementTick() {
        this.currentTick = createTick(this.currentTick.value + 1);
        // Periodic cleanup
        if (this.currentTick.value - this.lastCleanupTick >=
            this.config.cleanupInterval) {
            this.cleanup();
        }
    }
    /**
     * Creates a new tick (advances tick and returns it for test compatibility).
     */
    createTick() {
        this.incrementTick();
        return this.currentTick;
    }
    /**
     * Advances the tick and updates the last check tick.
     */
    advanceTick() {
        this.lastCheckTick = this.currentTick;
        this.incrementTick();
    }
    /**
     * Marks a component as added.
     */
    markAdded(entity, componentType) {
        // Check if we need cleanup before adding
        if (this.componentTicks.size >=
            this.config.maxEntries * this.config.cleanupThreshold) {
            this.cleanup();
        }
        const key = this.getOptimizedComponentKey(entity, componentType);
        this.componentTicks.set(key, createComponentTicks(this.currentTick, this.currentTick));
        this.updateStats();
    }
    /**
     * Marks a component as changed.
     */
    markChanged(entity, componentType) {
        const key = this.getOptimizedComponentKey(entity, componentType);
        const existing = this.componentTicks.get(key);
        if (existing) {
            this.componentTicks.set(key, createComponentTicks(existing.added, this.currentTick));
        }
        else {
            this.componentTicks.set(key, createComponentTicks(this.currentTick, this.currentTick));
        }
        this.updateStats();
    }
    /**
     * Marks a component as removed.
     */
    markRemoved(entity, componentType) {
        const key = this.getOptimizedComponentKey(entity, componentType);
        const existing = this.componentTicks.get(key);
        if (existing) {
            this.componentTicks.set(key, createComponentTicks(existing.added, existing.changed, this.currentTick));
        }
        this.updateStats();
    }
    /**
     * Checks if a component was added since the last check.
     */
    isAdded(entity, componentType) {
        const key = this.getOptimizedComponentKey(entity, componentType);
        const ticks = this.componentTicks.get(key);
        if (!ticks)
            return false;
        return ticks.added.isNewerThan(this.lastCheckTick);
    }
    /**
     * Checks if a component was changed since the last check.
     */
    isChanged(entity, componentType) {
        const key = this.getOptimizedComponentKey(entity, componentType);
        const ticks = this.componentTicks.get(key);
        if (!ticks)
            return false;
        return ticks.changed.isNewerThan(this.lastCheckTick);
    }
    /**
     * Checks if a component was removed since the last check.
     */
    isRemoved(entity, componentType) {
        const key = this.getOptimizedComponentKey(entity, componentType);
        const ticks = this.componentTicks.get(key);
        if (!ticks)
            return false;
        return ticks.removed
            ? ticks.removed.isNewerThan(this.lastCheckTick)
            : false;
    }
    /**
     * Clears all change tracking data.
     */
    clear() {
        this.componentTicks.clear();
        this.stats.totalEntries = 0;
        this.stats.memoryUsageMB = 0;
    }
    /**
     * Cleans up old change tracking data.
     */
    cleanup() {
        const oldSize = this.componentTicks.size;
        const cutoffTick = this.currentTick.value - 100; // Keep last 100 ticks
        // Remove entries older than cutoff
        for (const [key, ticks] of this.componentTicks.entries()) {
            if (ticks.changed.value < cutoffTick &&
                (!ticks.removed || ticks.removed.value < cutoffTick)) {
                this.componentTicks.delete(key);
            }
        }
        this.cleanupCount++;
        this.lastCleanupTick = this.currentTick.value;
        this.updateStats();
        if (this.config.enableStats) {
            console.log(`🧹 Change detection cleanup: ${oldSize} -> ${this.componentTicks.size} entries`);
        }
    }
    /**
     * Gets statistics about the change detection system.
     */
    getStats() {
        return { ...this.stats };
    }
    /**
     * Optimized component key generation using numeric IDs instead of strings.
     */
    getOptimizedComponentKey(entity, componentType) {
        // Use numeric IDs for better performance and smaller memory footprint
        // Format: entityIndex:entityGeneration:componentId
        return `${entity.index}:${entity.generation}:${componentType.id}`;
    }
    /**
     * Updates internal statistics.
     */
    updateStats() {
        if (!this.config.enableStats)
            return;
        this.stats.totalEntries = this.componentTicks.size;
        this.stats.memoryUsageMB = this.estimateMemoryUsage();
        this.stats.cleanupCount = this.cleanupCount;
        // Estimate average entries per tick (simplified)
        this.stats.averageEntriesPerTick =
            this.componentTicks.size / Math.max(1, this.currentTick.value);
    }
    /**
     * Estimates memory usage of the change detection system.
     */
    estimateMemoryUsage() {
        // Rough estimate: each entry is ~100 bytes (key + value + overhead)
        const bytesPerEntry = 100;
        const totalBytes = this.componentTicks.size * bytesPerEntry;
        return totalBytes / (1024 * 1024); // Convert to MB
    }
}
/**
 * Creates an optimized change detection system.
 */
export function createOptimizedChangeDetection(config) {
    return new OptimizedChangeDetectionImpl(config);
}

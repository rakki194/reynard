/**
 * Simple Event Emitter Implementation
 *
 * A basic event emitter implementation for NLWeb service events.
 */
/**
 * Create a simple event emitter implementation
 */
export class SimpleEventEmitter {
    constructor() {
        Object.defineProperty(this, "listeners", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
    }
    on(eventType, listener) {
        if (!this.listeners.has(eventType)) {
            this.listeners.set(eventType, new Set());
        }
        this.listeners.get(eventType).add(listener);
    }
    off(eventType, listener) {
        const eventListeners = this.listeners.get(eventType);
        if (eventListeners) {
            eventListeners.delete(listener);
            if (eventListeners.size === 0) {
                this.listeners.delete(eventType);
            }
        }
    }
    emit(event) {
        const eventListeners = this.listeners.get(event.type);
        if (eventListeners) {
            for (const listener of eventListeners) {
                try {
                    listener(event);
                }
                catch (error) {
                    console.error(`Error in event listener for ${event.type}:`, error);
                }
            }
        }
    }
}

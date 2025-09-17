/**
 * Simple Event Manager
 *
 * Handles event emission and listener management for annotation services.
 */
export class SimpleEventManager {
    constructor() {
        Object.defineProperty(this, "listeners", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
    }
    addEventListener(listener) {
        this.listeners.push(listener);
    }
    removeEventListener(listener) {
        const index = this.listeners.indexOf(listener);
        if (index >= 0) {
            this.listeners.splice(index, 1);
        }
    }
    emitEvent(event) {
        this.listeners.forEach((listener) => {
            try {
                listener(event);
            }
            catch (error) {
                console.error("Error in event listener:", error);
            }
        });
    }
}

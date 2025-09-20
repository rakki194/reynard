/**
 * Simple Event Emitter Implementation
 *
 * A basic event emitter implementation for NLWeb service events.
 */

import type { NLWebEvent, NLWebEventEmitter, NLWebEventListener } from "../types/index.js";

/**
 * Create a simple event emitter implementation
 */
export class SimpleEventEmitter implements NLWebEventEmitter {
  private listeners = new Map<NLWebEvent["type"], Set<NLWebEventListener>>();

  on(eventType: NLWebEvent["type"], listener: NLWebEventListener): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(listener);
  }

  off(eventType: NLWebEvent["type"], listener: NLWebEventListener): void {
    const eventListeners = this.listeners.get(eventType);
    if (eventListeners) {
      eventListeners.delete(listener);
      if (eventListeners.size === 0) {
        this.listeners.delete(eventType);
      }
    }
  }

  emit(event: NLWebEvent): void {
    const eventListeners = this.listeners.get(event.type);
    if (eventListeners) {
      for (const listener of eventListeners) {
        try {
          listener(event);
        } catch (error) {
          console.error(`Error in event listener for ${event.type}:`, error);
        }
      }
    }
  }
}

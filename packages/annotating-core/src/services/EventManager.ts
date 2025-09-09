/**
 * Simple Event Manager
 *
 * Handles event emission and listener management for annotation services.
 */

import { AnyAnnotationEvent } from "../types/index.js";

export class SimpleEventManager {
  private listeners: Array<(event: AnyAnnotationEvent) => void> = [];

  addEventListener(listener: (event: AnyAnnotationEvent) => void): void {
    this.listeners.push(listener);
  }

  removeEventListener(listener: (event: AnyAnnotationEvent) => void): void {
    const index = this.listeners.indexOf(listener);
    if (index >= 0) {
      this.listeners.splice(index, 1);
    }
  }

  emitEvent(event: AnyAnnotationEvent): void {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        console.error("Error in event listener:", error);
      }
    });
  }
}

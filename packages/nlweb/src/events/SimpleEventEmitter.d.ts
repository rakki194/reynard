/**
 * Simple Event Emitter Implementation
 *
 * A basic event emitter implementation for NLWeb service events.
 */
import type { NLWebEvent, NLWebEventEmitter, NLWebEventListener } from "../types/index.js";
/**
 * Create a simple event emitter implementation
 */
export declare class SimpleEventEmitter implements NLWebEventEmitter {
    private listeners;
    on(eventType: NLWebEvent["type"], listener: NLWebEventListener): void;
    off(eventType: NLWebEvent["type"], listener: NLWebEventListener): void;
    emit(event: NLWebEvent): void;
}

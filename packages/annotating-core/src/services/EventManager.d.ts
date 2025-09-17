/**
 * Simple Event Manager
 *
 * Handles event emission and listener management for annotation services.
 */
import { AnyAnnotationEvent } from "../types/index.js";
export declare class SimpleEventManager {
    private listeners;
    addEventListener(listener: (event: AnyAnnotationEvent) => void): void;
    removeEventListener(listener: (event: AnyAnnotationEvent) => void): void;
    emitEvent(event: AnyAnnotationEvent): void;
}

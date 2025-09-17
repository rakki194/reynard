/**
 * Canvas Event Handlers for BoundingBoxEditor
 *
 * Orchestrates all canvas interaction events by delegating to specialized handlers:
 * - Mouse events handled by mouseHandlers
 * - Object events handled by objectHandlers
 */
import { setupMouseHandlers } from "./mouseHandlers";
import { setupObjectHandlers } from "./objectHandlers";
export function setupCanvasEventHandlers(canvas, config) {
    // Setup mouse event handlers
    setupMouseHandlers(canvas, config);
    // Setup object event handlers
    setupObjectHandlers(canvas, config);
}

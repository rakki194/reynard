/**
 * Core validation types and interfaces for the Reynard validation system
 */
// ============================================================================
// Validation Error Class
// ============================================================================
export class ValidationError extends Error {
    constructor(message, context) {
        super(message);
        Object.defineProperty(this, "context", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "field", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "value", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "constraint", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.name = "ValidationError";
        this.context = context;
        this.field = context.field;
        this.value = context.value;
        this.constraint = context.constraint;
    }
}

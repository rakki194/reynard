/**
 * Error and Validation Types
 *
 * Defines types for error handling, validation results, and custom
 * error classes within the Reynard framework.
 */
export class AIError extends Error {
    constructor(message, code, context) {
        super(message);
        Object.defineProperty(this, "code", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: code
        });
        Object.defineProperty(this, "context", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: context
        });
        this.name = "AIError";
    }
}
export class ModelError extends AIError {
    constructor(message, modelName, context) {
        super(message, "MODEL_ERROR", { modelName, ...context });
        Object.defineProperty(this, "modelName", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: modelName
        });
        this.name = "ModelError";
    }
}
export class ServiceError extends AIError {
    constructor(message, serviceName, context) {
        super(message, "SERVICE_ERROR", { serviceName, ...context });
        Object.defineProperty(this, "serviceName", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: serviceName
        });
        this.name = "ServiceError";
    }
}

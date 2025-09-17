/**
 * Error Types and Classification System
 * Comprehensive error type definitions for the Reynard error boundary system
 */
export var ErrorSeverity;
(function (ErrorSeverity) {
    ErrorSeverity["LOW"] = "low";
    ErrorSeverity["MEDIUM"] = "medium";
    ErrorSeverity["HIGH"] = "high";
    ErrorSeverity["CRITICAL"] = "critical";
})(ErrorSeverity || (ErrorSeverity = {}));
export var ErrorCategory;
(function (ErrorCategory) {
    ErrorCategory["RENDERING"] = "rendering";
    ErrorCategory["NETWORK"] = "network";
    ErrorCategory["VALIDATION"] = "validation";
    ErrorCategory["AUTHENTICATION"] = "authentication";
    ErrorCategory["PERMISSION"] = "permission";
    ErrorCategory["RESOURCE"] = "resource";
    ErrorCategory["TIMEOUT"] = "timeout";
    ErrorCategory["UNKNOWN"] = "unknown";
})(ErrorCategory || (ErrorCategory = {}));

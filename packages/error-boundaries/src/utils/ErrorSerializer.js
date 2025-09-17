/**
 * Error Serialization Utilities
 * Safe error serialization for reporting and storage
 */
/**
 * Safely serialize an error for reporting
 */
export function serializeError(error) {
    return {
        name: error.name || "Error",
        message: error.message || "Unknown error",
        stack: error.stack || undefined,
    };
}
/**
 * Safely serialize error context
 */
export function serializeErrorContext(context) {
    return {
        componentStack: context.componentStack,
        errorBoundaryId: context.errorBoundaryId,
        timestamp: context.timestamp,
        userAgent: context.userAgent,
        url: context.url,
        userId: context.userId,
        sessionId: context.sessionId,
        severity: context.severity,
        category: context.category,
        recoverable: context.recoverable,
        metadata: sanitizeMetadata(context.metadata),
        errorBoundaryStack: context.errorBoundaryStack,
    };
}
/**
 * Sanitize metadata to remove sensitive information
 */
function sanitizeMetadata(metadata) {
    const sanitized = {};
    for (const [key, value] of Object.entries(metadata)) {
        // Skip sensitive keys
        if (isSensitiveKey(key)) {
            continue;
        }
        // Sanitize sensitive values
        if (typeof value === "string" && isSensitiveValue(value)) {
            sanitized[key] = "[REDACTED]";
        }
        else if (typeof value === "object" && value !== null) {
            sanitized[key] = sanitizeMetadata(value);
        }
        else {
            sanitized[key] = value;
        }
    }
    return sanitized;
}
/**
 * Check if a key is sensitive
 */
function isSensitiveKey(key) {
    const sensitiveKeys = [
        "password",
        "token",
        "secret",
        "key",
        "auth",
        "credential",
        "private",
        "sensitive",
    ];
    return sensitiveKeys.some((sensitive) => key.toLowerCase().includes(sensitive));
}
/**
 * Check if a value contains sensitive information
 */
function isSensitiveValue(value) {
    const sensitivePatterns = [
        /password/i,
        /token/i,
        /secret/i,
        /key/i,
        /auth/i,
        /credential/i,
        /private/i,
        /sensitive/i,
        /bearer\s+/i,
        /basic\s+/i,
    ];
    return sensitivePatterns.some((pattern) => pattern.test(value));
}
/**
 * Create error report from error and context
 */
export function createErrorReport(error, context, userReport) {
    return {
        id: generateReportId(),
        error: serializeError(error),
        context: serializeErrorContext(context),
        timestamp: Date.now(),
        userAgent: context.userAgent,
        url: context.url,
        userId: context.userId,
        sessionId: context.sessionId,
        userReport,
    };
}
/**
 * Generate unique report ID
 */
function generateReportId() {
    return `error-report-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
/**
 * Serialize error report for transmission
 */
export function serializeErrorReport(report) {
    try {
        return JSON.stringify(report, null, 2);
    }
    catch (error) {
        // Fallback serialization if JSON.stringify fails
        return JSON.stringify({
            id: report.id,
            error: {
                name: report.error.name,
                message: report.error.message,
            },
            timestamp: report.timestamp,
            url: report.url,
        });
    }
}
/**
 * Deserialize error report from string
 */
export function deserializeErrorReport(serialized) {
    try {
        return JSON.parse(serialized);
    }
    catch (error) {
        console.warn("Failed to deserialize error report:", error);
        return null;
    }
}

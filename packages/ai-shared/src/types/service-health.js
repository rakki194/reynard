/**
 * Service Health and Status Types
 *
 * Defines types for monitoring service health, status, and performance metrics
 * across AI/ML services in the Reynard framework.
 */
export var ServiceStatus;
(function (ServiceStatus) {
    ServiceStatus["STOPPED"] = "stopped";
    ServiceStatus["STARTING"] = "starting";
    ServiceStatus["RUNNING"] = "running";
    ServiceStatus["STOPPING"] = "stopping";
    ServiceStatus["ERROR"] = "error";
    ServiceStatus["UNKNOWN"] = "unknown";
})(ServiceStatus || (ServiceStatus = {}));
export var ServiceHealth;
(function (ServiceHealth) {
    ServiceHealth["HEALTHY"] = "healthy";
    ServiceHealth["DEGRADED"] = "degraded";
    ServiceHealth["UNHEALTHY"] = "unhealthy";
    ServiceHealth["UNKNOWN"] = "unknown";
})(ServiceHealth || (ServiceHealth = {}));

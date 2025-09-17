/**
 * Service Management Types
 *
 * Core types for the service management system including service lifecycle,
 * health monitoring, dependency management, and service registry.
 */
export var ServiceStatus;
(function (ServiceStatus) {
    ServiceStatus["STOPPED"] = "stopped";
    ServiceStatus["STARTING"] = "starting";
    ServiceStatus["RUNNING"] = "running";
    ServiceStatus["STOPPING"] = "stopping";
    ServiceStatus["ERROR"] = "error";
})(ServiceStatus || (ServiceStatus = {}));
export var ServiceHealth;
(function (ServiceHealth) {
    ServiceHealth["HEALTHY"] = "healthy";
    ServiceHealth["DEGRADED"] = "degraded";
    ServiceHealth["UNHEALTHY"] = "unhealthy";
    ServiceHealth["UNKNOWN"] = "unknown";
})(ServiceHealth || (ServiceHealth = {}));

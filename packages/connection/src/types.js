// Core connection types and enums for the frontend connection manager
export var ConnectionState;
(function (ConnectionState) {
    ConnectionState["DISCONNECTED"] = "disconnected";
    ConnectionState["CONNECTING"] = "connecting";
    ConnectionState["CONNECTED"] = "connected";
    ConnectionState["DISCONNECTING"] = "disconnecting";
    ConnectionState["ERROR"] = "error";
    ConnectionState["DEGRADED"] = "degraded";
})(ConnectionState || (ConnectionState = {}));
export var ConnectionType;
(function (ConnectionType) {
    ConnectionType["INTERNET"] = "internet";
    ConnectionType["BACKEND"] = "backend";
    ConnectionType["AUTHENTICATION"] = "authentication";
    ConnectionType["SERVICE"] = "service";
    ConnectionType["REALTIME"] = "realtime";
    ConnectionType["FILESYSTEM"] = "filesystem";
    ConnectionType["HTTP"] = "http";
    ConnectionType["WEBSOCKET"] = "websocket";
    ConnectionType["SSE"] = "sse";
    ConnectionType["DATABASE"] = "database";
    ConnectionType["EXTERNAL"] = "external";
})(ConnectionType || (ConnectionType = {}));
export var ConnectionHealth;
(function (ConnectionHealth) {
    ConnectionHealth["HEALTHY"] = "healthy";
    ConnectionHealth["DEGRADED"] = "degraded";
    ConnectionHealth["UNHEALTHY"] = "unhealthy";
    ConnectionHealth["UNKNOWN"] = "unknown";
})(ConnectionHealth || (ConnectionHealth = {}));
export var SecurityLevel;
(function (SecurityLevel) {
    SecurityLevel["NONE"] = "none";
    SecurityLevel["BASIC"] = "basic";
    SecurityLevel["ENHANCED"] = "enhanced";
    SecurityLevel["MAXIMUM"] = "maximum";
})(SecurityLevel || (SecurityLevel = {}));
export var RecoveryStrategy;
(function (RecoveryStrategy) {
    RecoveryStrategy["NONE"] = "none";
    RecoveryStrategy["RECONNECT"] = "reconnect";
    RecoveryStrategy["RECONNECT_BACKOFF"] = "reconnect_backoff";
    RecoveryStrategy["FALLBACK"] = "fallback";
    RecoveryStrategy["GRACEFUL_DEGRADATION"] = "graceful_degradation";
})(RecoveryStrategy || (RecoveryStrategy = {}));

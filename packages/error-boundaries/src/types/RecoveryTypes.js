/**
 * Recovery Types and Strategy System
 * Comprehensive recovery strategy definitions for error handling
 */
export var RecoveryActionType;
(function (RecoveryActionType) {
    RecoveryActionType["RETRY"] = "retry";
    RecoveryActionType["RESET"] = "reset";
    RecoveryActionType["FALLBACK"] = "fallback";
    RecoveryActionType["REDIRECT"] = "redirect";
    RecoveryActionType["RELOAD"] = "reload";
    RecoveryActionType["CUSTOM"] = "custom";
})(RecoveryActionType || (RecoveryActionType = {}));

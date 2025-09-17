/**
 * Core enums for Reynard annotation system
 *
 * This module defines the fundamental enums used throughout
 * the annotation system for backend integration.
 */
export declare enum CaptionType {
    CAPTION = "caption",
    TAGS = "tags",
    E621 = "e621",
    TOML = "toml"
}
export declare enum ModelCategory {
    LIGHTWEIGHT = "lightweight",// Fast, small models (JTP2, WDV3)
    HEAVY = "heavy"
}
export declare enum ModelStatus {
    AVAILABLE = "available",
    LOADING = "loading",
    LOADED = "loaded",
    UNAVAILABLE = "unavailable",
    ERROR = "error",
    DOWNLOADING = "downloading"
}
export declare enum OperationStatus {
    IDLE = "idle",
    GENERATING = "generating",
    SUCCESS = "success",
    ERROR = "error",
    CANCELLED = "cancelled"
}
export declare enum ErrorType {
    MODEL_LOADING = "model_loading",
    MODEL_DOWNLOAD = "model_download",
    CAPTION_GENERATION = "caption_generation",
    VALIDATION = "validation",
    NETWORK = "network",
    TIMEOUT = "timeout",
    UNKNOWN = "unknown"
}

/**
 * Core enums for Reynard annotation system
 *
 * This module defines the fundamental enums used throughout
 * the annotation system for backend integration.
 */

// CaptionType is imported from reynard-ai-shared to maintain consistency

export enum ModelCategory {
  LIGHTWEIGHT = "lightweight", // Fast, small models (JTP2, WDV3)
  HEAVY = "heavy", // Large, slow models (JoyCaption, Florence2)
}

export enum ModelStatus {
  AVAILABLE = "available",
  LOADING = "loading",
  LOADED = "loaded",
  UNAVAILABLE = "unavailable",
  ERROR = "error",
  DOWNLOADING = "downloading",
}

export enum OperationStatus {
  IDLE = "idle",
  GENERATING = "generating",
  SUCCESS = "success",
  ERROR = "error",
  CANCELLED = "cancelled",
}

export enum ErrorType {
  MODEL_LOADING = "model_loading",
  MODEL_DOWNLOAD = "model_download",
  CAPTION_GENERATION = "caption_generation",
  VALIDATION = "validation",
  NETWORK = "network",
  TIMEOUT = "timeout",
  UNKNOWN = "unknown",
}

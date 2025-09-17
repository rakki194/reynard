/**
 * Model Management Types
 *
 * Defines types for managing AI/ML models, their configurations, and lifecycle
 * operations within the Reynard framework.
 */
export var ModelStatus;
(function (ModelStatus) {
    ModelStatus["NOT_LOADED"] = "not_loaded";
    ModelStatus["LOADING"] = "loading";
    ModelStatus["LOADED"] = "loaded";
    ModelStatus["UNLOADING"] = "unloading";
    ModelStatus["ERROR"] = "error";
})(ModelStatus || (ModelStatus = {}));
export var ModelType;
(function (ModelType) {
    ModelType["CAPTION"] = "caption";
    ModelType["EMBEDDING"] = "embedding";
    ModelType["DIFFUSION"] = "diffusion";
    ModelType["TTS"] = "tts";
    ModelType["LLM"] = "llm";
    ModelType["VISION"] = "vision";
})(ModelType || (ModelType = {}));

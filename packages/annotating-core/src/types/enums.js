/**
 * Core enums for Reynard annotation system
 *
 * This module defines the fundamental enums used throughout
 * the annotation system for backend integration.
 */
export var CaptionType;
(function (CaptionType) {
    CaptionType["CAPTION"] = "caption";
    CaptionType["TAGS"] = "tags";
    CaptionType["E621"] = "e621";
    CaptionType["TOML"] = "toml";
})(CaptionType || (CaptionType = {}));
export var ModelCategory;
(function (ModelCategory) {
    ModelCategory["LIGHTWEIGHT"] = "lightweight";
    ModelCategory["HEAVY"] = "heavy";
})(ModelCategory || (ModelCategory = {}));
export var ModelStatus;
(function (ModelStatus) {
    ModelStatus["AVAILABLE"] = "available";
    ModelStatus["LOADING"] = "loading";
    ModelStatus["LOADED"] = "loaded";
    ModelStatus["UNAVAILABLE"] = "unavailable";
    ModelStatus["ERROR"] = "error";
    ModelStatus["DOWNLOADING"] = "downloading";
})(ModelStatus || (ModelStatus = {}));
export var OperationStatus;
(function (OperationStatus) {
    OperationStatus["IDLE"] = "idle";
    OperationStatus["GENERATING"] = "generating";
    OperationStatus["SUCCESS"] = "success";
    OperationStatus["ERROR"] = "error";
    OperationStatus["CANCELLED"] = "cancelled";
})(OperationStatus || (OperationStatus = {}));
export var ErrorType;
(function (ErrorType) {
    ErrorType["MODEL_LOADING"] = "model_loading";
    ErrorType["MODEL_DOWNLOAD"] = "model_download";
    ErrorType["CAPTION_GENERATION"] = "caption_generation";
    ErrorType["VALIDATION"] = "validation";
    ErrorType["NETWORK"] = "network";
    ErrorType["TIMEOUT"] = "timeout";
    ErrorType["UNKNOWN"] = "unknown";
})(ErrorType || (ErrorType = {}));

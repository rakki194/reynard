/**
 * Caption Generation Types
 *
 * Defines types for image caption generation, including tasks, results,
 * and post-processing rules within the Reynard framework.
 */
export var CaptionType;
(function (CaptionType) {
    CaptionType["TAGS"] = "tags";
    CaptionType["CAPTION"] = "caption";
    CaptionType["DESCRIPTION"] = "description";
    CaptionType["E621"] = "e621";
    CaptionType["TOML"] = "toml";
})(CaptionType || (CaptionType = {}));

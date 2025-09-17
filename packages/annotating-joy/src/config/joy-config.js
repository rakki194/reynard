/**
 * JoyCaption Configuration
 *
 * Configuration schema and defaults for the JoyCaption generator.
 * This package now only provides configuration - actual generation
 * is handled by the FastAPI backend.
 */
export const JOY_CAPTION_CONFIG_SCHEMA = {
    type: "object",
    properties: {
        language: {
            type: "string",
            enum: ["en", "es", "fr", "de", "ja", "zh", "auto"],
            default: "auto",
            description: "Language for caption generation",
        },
        style: {
            type: "string",
            enum: ["descriptive", "concise", "detailed", "artistic"],
            default: "descriptive",
            description: "Caption style",
        },
        max_length: {
            type: "integer",
            minimum: 10,
            maximum: 500,
            default: 200,
            description: "Maximum caption length",
        },
        include_emotions: {
            type: "boolean",
            default: true,
            description: "Include emotional descriptions",
        },
        include_actions: {
            type: "boolean",
            default: true,
            description: "Include action descriptions",
        },
        include_environment: {
            type: "boolean",
            default: true,
            description: "Include environmental context",
        },
    },
    additionalProperties: false,
};
export const JOY_CAPTION_DEFAULT_CONFIG = {
    language: "auto",
    style: "descriptive",
    max_length: 200,
    include_emotions: true,
    include_actions: true,
    include_environment: true,
};
export const JOY_CAPTION_METADATA = {
    name: "joycaption",
    description: "JoyCaption - Large language model for detailed image captioning with multilingual support",
    version: "1.0.0",
    caption_type: "caption",
    model_category: "heavy",
    model_path: "microsoft/joycaption",
    model_size: "~2GB",
    supported_formats: ["jpg", "jpeg", "png", "webp"],
    max_resolution: "1024x1024",
    average_processing_time: "3-8 seconds",
    memory_usage: "~4GB VRAM",
    specialized_for: ["general", "multilingual", "detailed_descriptions"],
    supported_languages: ["en", "es", "fr", "de", "ja", "zh"],
    accuracy: "90%+ for general content",
};
export const JOY_CAPTION_FEATURES = [
    "multilingual_support",
    "detailed_descriptions",
    "emotional_analysis",
    "action_recognition",
    "environmental_context",
    "style_variations",
    "configurable_length",
    "high_quality_output",
];

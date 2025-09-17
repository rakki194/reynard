/**
 * JoyCaption Configuration
 *
 * Configuration schema and defaults for the JoyCaption generator.
 * This package now only provides configuration - actual generation
 * is handled by the FastAPI backend.
 */
export declare const JOY_CAPTION_CONFIG_SCHEMA: {
    type: string;
    properties: {
        language: {
            type: string;
            enum: string[];
            default: string;
            description: string;
        };
        style: {
            type: string;
            enum: string[];
            default: string;
            description: string;
        };
        max_length: {
            type: string;
            minimum: number;
            maximum: number;
            default: number;
            description: string;
        };
        include_emotions: {
            type: string;
            default: boolean;
            description: string;
        };
        include_actions: {
            type: string;
            default: boolean;
            description: string;
        };
        include_environment: {
            type: string;
            default: boolean;
            description: string;
        };
    };
    additionalProperties: boolean;
};
export declare const JOY_CAPTION_DEFAULT_CONFIG: {
    language: string;
    style: string;
    max_length: number;
    include_emotions: boolean;
    include_actions: boolean;
    include_environment: boolean;
};
export declare const JOY_CAPTION_METADATA: {
    name: string;
    description: string;
    version: string;
    caption_type: string;
    model_category: string;
    model_path: string;
    model_size: string;
    supported_formats: string[];
    max_resolution: string;
    average_processing_time: string;
    memory_usage: string;
    specialized_for: string[];
    supported_languages: string[];
    accuracy: string;
};
export declare const JOY_CAPTION_FEATURES: string[];

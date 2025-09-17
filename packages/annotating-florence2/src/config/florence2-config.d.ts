/**
 * Florence2 Configuration
 *
 * Configuration schema and defaults for the Florence2 generator.
 * This package now only provides configuration - actual generation
 * is handled by the FastAPI backend.
 */
export declare const FLORENCE2_CONFIG_SCHEMA: {
    type: string;
    properties: {
        task: {
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
        num_beams: {
            type: string;
            minimum: number;
            maximum: number;
            default: number;
            description: string;
        };
        temperature: {
            type: string;
            minimum: number;
            maximum: number;
            default: number;
            description: string;
        };
        include_objects: {
            type: string;
            default: boolean;
            description: string;
        };
        include_relationships: {
            type: string;
            default: boolean;
            description: string;
        };
    };
    additionalProperties: boolean;
};
export declare const FLORENCE2_DEFAULT_CONFIG: {
    task: string;
    max_length: number;
    num_beams: number;
    temperature: number;
    include_objects: boolean;
    include_relationships: boolean;
};
export declare const FLORENCE2_METADATA: {
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
    accuracy: string;
};
export declare const FLORENCE2_FEATURES: string[];

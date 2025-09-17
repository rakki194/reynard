/**
 * WDv3 Configuration
 *
 * Configuration schema and defaults for the WDv3 generator.
 * This package now only provides configuration - actual generation
 * is handled by the FastAPI backend.
 */
export declare const WDV3_CONFIG_SCHEMA: {
    type: string;
    properties: {
        threshold: {
            type: string;
            minimum: number;
            maximum: number;
            default: number;
            description: string;
        };
        force_cpu: {
            type: string;
            default: boolean;
            description: string;
        };
        batch_size: {
            type: string;
            minimum: number;
            maximum: number;
            default: number;
            description: string;
        };
        max_tags: {
            type: string;
            minimum: number;
            maximum: number;
            default: number;
            description: string;
        };
        include_ratings: {
            type: string;
            default: boolean;
            description: string;
        };
        include_character_tags: {
            type: string;
            default: boolean;
            description: string;
        };
        include_artist_tags: {
            type: string;
            default: boolean;
            description: string;
        };
        include_style_tags: {
            type: string;
            default: boolean;
            description: string;
        };
    };
    additionalProperties: boolean;
};
export declare const WDV3_DEFAULT_CONFIG: {
    threshold: number;
    force_cpu: boolean;
    batch_size: number;
    max_tags: number;
    include_ratings: boolean;
    include_character_tags: boolean;
    include_artist_tags: boolean;
    include_style_tags: boolean;
};
export declare const WDV3_METADATA: {
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
export declare const WDV3_FEATURES: string[];

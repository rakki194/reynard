/**
 * Generator Configuration Types for Caption Generation
 *
 * Defines specific configuration options for each caption generator type.
 * These types are based on the actual backend implementations and provide
 * type safety for generator-specific parameters.
 */
export interface BaseGeneratorConfig {
    max_length?: number;
    temperature?: number;
    force_cpu?: boolean;
}
export interface JoyCaptionConfig extends BaseGeneratorConfig {
    top_p?: number;
    repetition_penalty?: number;
    model_name?: string;
    caption_type?: "descriptive" | "tags" | "detailed";
}
export interface Florence2Config extends BaseGeneratorConfig {
    task?: "caption" | "dense_caption" | "region_caption";
    model_name?: string;
}
export interface JTP2Config extends BaseGeneratorConfig {
    threshold?: number;
    batch_size?: number;
    model_path?: string;
    tags_path?: string;
}
export interface WDv3Config extends BaseGeneratorConfig {
    gen_threshold?: number;
    char_threshold?: number;
    architecture?: "vit" | "swinv2" | "convnext";
}
export type GeneratorConfig = JoyCaptionConfig | Florence2Config | JTP2Config | WDv3Config;

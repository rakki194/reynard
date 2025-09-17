/**
 * AI Metadata Extractor Component
 *
 * Integrates with Reynard's AI services to extract and enhance metadata
 * from downloaded gallery content. Provides intelligent content analysis,
 * tagging, and organization features.
 */
export interface AIMetadataRequest {
    download_id: string;
    content_type: "image" | "video" | "mixed";
    extract_tags?: boolean;
    extract_captions?: boolean;
    extract_objects?: boolean;
    extract_text?: boolean;
    extract_colors?: boolean;
    extract_emotions?: boolean;
    custom_prompts?: string[];
}
export interface AIMetadataResult {
    download_id: string;
    content_type: string;
    tags: string[];
    captions: string[];
    objects: Array<{
        name: string;
        confidence: number;
        bounding_box?: [number, number, number, number];
    }>;
    extracted_text: string[];
    dominant_colors: Array<{
        color: string;
        percentage: number;
    }>;
    emotions: Array<{
        emotion: string;
        confidence: number;
    }>;
    custom_analysis: Array<{
        prompt: string;
        result: string;
        confidence: number;
    }>;
    processing_time: number;
    created_at: string;
}
export interface MetadataExtractionJob {
    id: string;
    download_id: string;
    status: "pending" | "processing" | "completed" | "failed";
    progress: number;
    created_at: string;
    completed_at?: string;
    error?: string;
    result?: AIMetadataResult;
}
export declare function AIMetadataExtractor(): any;

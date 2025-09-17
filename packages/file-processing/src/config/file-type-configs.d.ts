/**
 * File type configuration definitions for the Reynard File Processing system.
 *
 * This module defines the configuration mappings for different file types
 * and their processing capabilities.
 */
/**
 * File type configuration mapping
 */
export declare const FILE_TYPE_CONFIGS: ({
    extensions: Set<string>;
    category: "image";
    isSupported: boolean;
    capabilities: {
        thumbnail: boolean;
        metadata: boolean;
        content: boolean;
        ocr: (ext: string) => boolean;
    };
} | {
    extensions: Set<string>;
    category: "video";
    isSupported: boolean;
    capabilities: {
        thumbnail: boolean;
        metadata: boolean;
        content: boolean;
        ocr: boolean;
    };
} | {
    extensions: Set<string>;
    category: "audio";
    isSupported: boolean;
    capabilities: {
        thumbnail: boolean;
        metadata: boolean;
        content: boolean;
        ocr: boolean;
    };
} | {
    extensions: Set<string>;
    category: "text";
    isSupported: boolean;
    capabilities: {
        thumbnail: boolean;
        metadata: boolean;
        content: boolean;
        ocr: boolean;
    };
} | {
    extensions: Set<string>;
    category: "code";
    isSupported: boolean;
    capabilities: {
        thumbnail: boolean;
        metadata: boolean;
        content: boolean;
        ocr: boolean;
    };
} | {
    extensions: Set<string>;
    category: "document";
    isSupported: boolean;
    capabilities: {
        thumbnail: boolean;
        metadata: boolean;
        content: (ext: string) => ext is ".txt" | ".pdf";
        ocr: boolean;
    };
} | {
    extensions: Set<string>;
    category: "other";
    isSupported: boolean;
    capabilities: {
        thumbnail: boolean;
        metadata: boolean;
        content: boolean;
        ocr: boolean;
    };
} | {
    extensions: Set<string>;
    category: "archive";
    isSupported: boolean;
    capabilities: {
        thumbnail: boolean;
        metadata: boolean;
        content: boolean;
        ocr: boolean;
    };
})[];

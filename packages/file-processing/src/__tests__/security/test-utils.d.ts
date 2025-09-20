/**
 * Security Test Utilities
 * Shared utilities for security test modules
 */
import { FileProcessingPipeline } from "../../processing-pipeline";
/**
 * Mock File object for testing
 */
export declare const createMockFile: (name: string, size: number, type: string) => File;
/**
 * Create a standard FileProcessingPipeline for testing
 */
export declare const createTestPipeline: (config?: Partial<{
    maxFileSize: number;
    defaultThumbnailSize: [number, number];
}>) => FileProcessingPipeline;
/**
 * Common test file configurations
 */
export declare const TEST_FILES: {
    readonly SAFE: {
        readonly PDF: File;
        readonly IMAGE_JPG: File;
        readonly IMAGE_PNG: File;
        readonly TEXT: File;
    };
    readonly DANGEROUS: {
        readonly TRAVERSAL: File;
        readonly PATH_SEPARATOR: File;
        readonly HTACCESS: File;
        readonly WEB_CONFIG: File;
        readonly EMPTY_NAME: File;
        readonly ZERO_SIZE: File;
    };
    readonly EXECUTABLE: {
        readonly EXE: File;
        readonly BAT: File;
        readonly CMD: File;
        readonly COM: File;
        readonly SCR: File;
        readonly MSI: File;
    };
    readonly COMPRESSED: {
        readonly ZIP: File;
        readonly RAR: File;
        readonly SEVEN_Z: File;
        readonly TAR: File;
        readonly GZ: File;
    };
    readonly UNSUPPORTED: {
        readonly JS: File;
        readonly CSS: File;
        readonly HTML: File;
    };
};

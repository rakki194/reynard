/**
 * Directory scanning utilities for the file processing pipeline.
 *
 * Handles directory listing and file discovery operations.
 */
import { ProcessingOptions, ProcessingResult, DirectoryListing } from "../types";
export declare class DirectoryScanner {
    /**
     * Scan directory contents
     */
    scanDirectory(path: string, _options?: ProcessingOptions): Promise<ProcessingResult<DirectoryListing>>;
}

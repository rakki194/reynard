/**
 * File information utilities for thumbnail generation.
 *
 * Provides utilities for extracting file metadata and determining
 * file characteristics needed for thumbnail processing.
 */
import { ProcessingResult } from "../../types";
export interface FileInfo {
    name: string;
    size: number;
    type: string;
}
/**
 * Get file information from File object or URL string
 */
export declare function getFileInfo(file: File | string): Promise<ProcessingResult<FileInfo>>;
/**
 * Get file extension from filename
 */
export declare function getFileExtension(filename: string): string;

/**
 * File type information resolution for the Reynard File Processing system.
 *
 * This module handles the logic for determining file type information,
 * capabilities, and processing support based on file extensions.
 */
import { FileTypeInfo } from "../types";
/**
 * Get file type information for a given extension
 */
export declare function getFileTypeInfo(extension: string): FileTypeInfo;

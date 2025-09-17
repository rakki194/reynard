/**
 * Document color utilities for thumbnail generation.
 *
 * Provides color schemes for different document types.
 */
export interface DocumentColors {
    primary: string;
    secondary: string;
}
/**
 * Get colors for different document types
 */
export declare function getDocumentColors(documentType: string): DocumentColors;

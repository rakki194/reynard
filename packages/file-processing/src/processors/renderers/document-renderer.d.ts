/**
 * Document icon renderer for thumbnail generation.
 *
 * Handles drawing document icons with type-specific styling.
 */
export interface DocumentRenderOptions {
    documentType?: string;
}
/**
 * Draw document icon based on document type
 */
export declare function drawDocumentIcon(ctx: CanvasRenderingContext2D, width: number, height: number, options?: DocumentRenderOptions): void;

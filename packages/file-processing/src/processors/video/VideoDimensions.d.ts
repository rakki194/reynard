/**
 * Video Dimension Calculation Utilities.
 *
 * Handles aspect ratio calculations and dimension scaling for video thumbnails.
 */
export interface DimensionResult {
    width: number;
    height: number;
    x: number;
    y: number;
}
export declare class VideoDimensions {
    /**
     * Calculate dimensions maintaining aspect ratio
     */
    static calculateDimensions(sourceWidth: number, sourceHeight: number, targetWidth: number, targetHeight: number, maintainAspectRatio?: boolean): DimensionResult;
    /**
     * Calculate optimal capture time for thumbnail
     */
    static calculateCaptureTime(duration: number, customTime?: number): number;
}

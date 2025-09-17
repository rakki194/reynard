/**
 * Video Dimension Calculation Utilities.
 *
 * Handles aspect ratio calculations and dimension scaling for video thumbnails.
 */
export class VideoDimensions {
    /**
     * Calculate dimensions maintaining aspect ratio
     */
    static calculateDimensions(sourceWidth, sourceHeight, targetWidth, targetHeight, maintainAspectRatio = true) {
        if (!maintainAspectRatio) {
            return {
                width: targetWidth,
                height: targetHeight,
                x: 0,
                y: 0,
            };
        }
        const sourceRatio = sourceWidth / sourceHeight;
        const targetRatio = targetWidth / targetHeight;
        let width, height;
        if (sourceRatio > targetRatio) {
            // Source is wider - fit to width
            width = targetWidth;
            height = targetWidth / sourceRatio;
        }
        else {
            // Source is taller - fit to height
            height = targetHeight;
            width = targetHeight * sourceRatio;
        }
        // Center the video frame
        const x = (targetWidth - width) / 2;
        const y = (targetHeight - height) / 2;
        return { width, height, x, y };
    }
    /**
     * Calculate optimal capture time for thumbnail
     */
    static calculateCaptureTime(duration, customTime) {
        if (customTime !== undefined) {
            return Math.min(customTime, duration);
        }
        return Math.min(duration / 2, 5);
    }
}

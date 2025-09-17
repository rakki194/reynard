/**
 * Coordinate transformation utilities
 *
 * Provides functions to convert between image coordinates and display coordinates,
 * essential for annotation editing across different viewport sizes and zoom levels.
 */
import type { ImageInfo, DisplayCoordinates, ImageCoordinates, BoundingBox } from "../types";
/**
 * Calculate the display area for an image within a container
 */
export declare function calculateImageDisplayArea(containerWidth: number, containerHeight: number, imageInfo: ImageInfo): {
    imageDisplayWidth: number;
    imageDisplayHeight: number;
    imageOffsetX: number;
    imageOffsetY: number;
};
/**
 * Convert image coordinates to display coordinates
 */
export declare function imageToDisplayCoords(imageCoords: ImageCoordinates, imageInfo: ImageInfo, containerWidth: number, containerHeight: number): DisplayCoordinates;
/**
 * Convert display coordinates to image coordinates
 */
export declare function displayToImageCoords(displayCoords: DisplayCoordinates, imageInfo: ImageInfo, containerWidth: number, containerHeight: number): ImageCoordinates;
/**
 * Convert bounding box from image to display coordinates
 */
export declare function boundingBoxToDisplayCoords(box: BoundingBox, imageInfo: ImageInfo, containerWidth: number, containerHeight: number): BoundingBox;
/**
 * Convert bounding box from display to image coordinates
 */
export declare function boundingBoxToImageCoords(box: BoundingBox, imageInfo: ImageInfo, containerWidth: number, containerHeight: number): BoundingBox;
/**
 * Clamp coordinates to image bounds
 */
export declare function clampToImageBounds(coords: ImageCoordinates, imageInfo: ImageInfo): ImageCoordinates;
/**
 * Clamp bounding box to image bounds
 */
export declare function clampBoundingBoxToImage(box: BoundingBox, imageInfo: ImageInfo): BoundingBox;

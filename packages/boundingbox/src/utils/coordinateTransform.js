/**
 * Coordinate transformation utilities
 *
 * Provides functions to convert between image coordinates and display coordinates,
 * essential for annotation editing across different viewport sizes and zoom levels.
 */
/**
 * Calculate the display area for an image within a container
 */
export function calculateImageDisplayArea(containerWidth, containerHeight, imageInfo) {
    const imageAspectRatio = imageInfo.width / imageInfo.height;
    const containerAspectRatio = containerWidth / containerHeight;
    let imageDisplayWidth;
    let imageDisplayHeight;
    let imageOffsetX;
    let imageOffsetY;
    if (imageAspectRatio > containerAspectRatio) {
        // Image is wider than container
        imageDisplayWidth = containerWidth;
        imageDisplayHeight = containerWidth / imageAspectRatio;
        imageOffsetX = 0;
        imageOffsetY = (containerHeight - imageDisplayHeight) / 2;
    }
    else {
        // Image is taller than container
        imageDisplayHeight = containerHeight;
        imageDisplayWidth = containerHeight * imageAspectRatio;
        imageOffsetX = (containerWidth - imageDisplayWidth) / 2;
        imageOffsetY = 0;
    }
    return { imageDisplayWidth, imageDisplayHeight, imageOffsetX, imageOffsetY };
}
/**
 * Convert image coordinates to display coordinates
 */
export function imageToDisplayCoords(imageCoords, imageInfo, containerWidth, containerHeight) {
    const { imageDisplayWidth, imageDisplayHeight, imageOffsetX, imageOffsetY } = calculateImageDisplayArea(containerWidth, containerHeight, imageInfo);
    return {
        x: imageOffsetX + (imageCoords.x / imageInfo.width) * imageDisplayWidth,
        y: imageOffsetY + (imageCoords.y / imageInfo.height) * imageDisplayHeight,
        width: imageCoords.width
            ? (imageCoords.width / imageInfo.width) * imageDisplayWidth
            : undefined,
        height: imageCoords.height
            ? (imageCoords.height / imageInfo.height) * imageDisplayHeight
            : undefined,
    };
}
/**
 * Convert display coordinates to image coordinates
 */
export function displayToImageCoords(displayCoords, imageInfo, containerWidth, containerHeight) {
    const { imageDisplayWidth, imageDisplayHeight, imageOffsetX, imageOffsetY } = calculateImageDisplayArea(containerWidth, containerHeight, imageInfo);
    return {
        x: Math.round(((displayCoords.x - imageOffsetX) / imageDisplayWidth) * imageInfo.width),
        y: Math.round(((displayCoords.y - imageOffsetY) / imageDisplayHeight) *
            imageInfo.height),
        width: displayCoords.width
            ? Math.round((displayCoords.width / imageDisplayWidth) * imageInfo.width)
            : undefined,
        height: displayCoords.height
            ? Math.round((displayCoords.height / imageDisplayHeight) * imageInfo.height)
            : undefined,
    };
}
/**
 * Convert bounding box from image to display coordinates
 */
export function boundingBoxToDisplayCoords(box, imageInfo, containerWidth, containerHeight) {
    const displayCoords = imageToDisplayCoords({ x: box.x, y: box.y, width: box.width, height: box.height }, imageInfo, containerWidth, containerHeight);
    return {
        ...box,
        x: displayCoords.x,
        y: displayCoords.y,
        width: displayCoords.width,
        height: displayCoords.height,
    };
}
/**
 * Convert bounding box from display to image coordinates
 */
export function boundingBoxToImageCoords(box, imageInfo, containerWidth, containerHeight) {
    const imageCoords = displayToImageCoords({ x: box.x, y: box.y, width: box.width, height: box.height }, imageInfo, containerWidth, containerHeight);
    return {
        ...box,
        x: imageCoords.x,
        y: imageCoords.y,
        width: imageCoords.width,
        height: imageCoords.height,
    };
}
/**
 * Clamp coordinates to image bounds
 */
export function clampToImageBounds(coords, imageInfo) {
    const clampedWidth = coords.width
        ? Math.max(0, Math.min(coords.width, imageInfo.width))
        : undefined;
    const clampedHeight = coords.height
        ? Math.max(0, Math.min(coords.height, imageInfo.height))
        : undefined;
    const clampedX = Math.max(0, Math.min(coords.x, imageInfo.width - (clampedWidth || 0)));
    const clampedY = Math.max(0, Math.min(coords.y, imageInfo.height - (clampedHeight || 0)));
    return {
        x: clampedX,
        y: clampedY,
        width: clampedWidth,
        height: clampedHeight,
    };
}
/**
 * Clamp bounding box to image bounds
 */
export function clampBoundingBoxToImage(box, imageInfo) {
    const clampedCoords = clampToImageBounds({ x: box.x, y: box.y, width: box.width, height: box.height }, imageInfo);
    return {
        ...box,
        x: clampedCoords.x,
        y: clampedCoords.y,
        width: clampedCoords.width,
        height: clampedCoords.height,
    };
}

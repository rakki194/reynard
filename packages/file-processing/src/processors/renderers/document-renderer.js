/**
 * Document icon renderer for thumbnail generation.
 *
 * Handles drawing document icons with type-specific styling.
 */
import { getDocumentColors } from "../utils/document-colors";
/**
 * Draw document icon based on document type
 */
export function drawDocumentIcon(ctx, width, height, options = {}) {
    const size = Math.min(width, height) * 0.6;
    const x = (width - size) / 2;
    const y = (height - size) / 2;
    // Choose color based on document type
    const colors = getDocumentColors(options.documentType || "document");
    // Draw document shape
    ctx.fillStyle = colors.primary;
    ctx.fillRect(x, y, size * 0.8, size);
    // Draw folded corner
    ctx.fillStyle = colors.secondary;
    ctx.beginPath();
    ctx.moveTo(x + size * 0.8, y);
    ctx.lineTo(x + size, y + size * 0.2);
    ctx.lineTo(x + size * 0.8, y + size * 0.2);
    ctx.closePath();
    ctx.fill();
    // Draw lines representing text
    drawTextLines(ctx, x, y, size);
    // Add document type indicator if specified
    if (options.documentType && options.documentType !== "document") {
        drawDocumentTypeIndicator(ctx, x, y, size, options.documentType);
    }
}
/**
 * Draw text lines on document
 */
function drawTextLines(ctx, x, y, size) {
    ctx.fillStyle = "white";
    const lineHeight = size * 0.08;
    const lineSpacing = size * 0.12;
    for (let i = 0; i < 5; i++) {
        const lineY = y + size * 0.3 + i * lineSpacing;
        const lineWidth = size * 0.6 - i * 0.1;
        ctx.fillRect(x + size * 0.1, lineY, lineWidth, lineHeight);
    }
}
/**
 * Draw document type indicator
 */
function drawDocumentTypeIndicator(ctx, x, y, size, documentType) {
    // Draw small indicator in top-right corner
    const indicatorSize = size * 0.15;
    const indicatorX = x + size * 0.7;
    const indicatorY = y + size * 0.1;
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.beginPath();
    ctx.arc(indicatorX, indicatorY, indicatorSize / 2, 0, 2 * Math.PI);
    ctx.fill();
    // Draw document type abbreviation
    ctx.fillStyle = "white";
    ctx.font = `bold ${indicatorSize * 0.6}px Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const abbreviation = documentType.toUpperCase().slice(0, 2);
    ctx.fillText(abbreviation, indicatorX, indicatorY);
}

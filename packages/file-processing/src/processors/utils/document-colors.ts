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
export function getDocumentColors(documentType: string): DocumentColors {
  const colorMap: Record<string, DocumentColors> = {
    pdf: { primary: "#dc2626", secondary: "#b91c1c" }, // Red
    docx: { primary: "#2563eb", secondary: "#1d4ed8" }, // Blue
    txt: { primary: "#6b7280", secondary: "#4b5563" }, // Gray
    rtf: { primary: "#059669", secondary: "#047857" }, // Green
    odt: { primary: "#7c3aed", secondary: "#6d28d9" }, // Purple
    default: { primary: "#4285f4", secondary: "#3367d6" }, // Default blue
  };

  return colorMap[documentType] || colorMap.default;
}

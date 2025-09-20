/**
 * Utility functions for RAG Image Modal
 */

export const formatFileSize = (bytes?: number): string => {
  if (!bytes) return "Unknown";
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
};

export const formatDimensions = (dimensions?: { width: number; height: number }): string => {
  if (!dimensions) return "Unknown";
  return `${dimensions.width} × ${dimensions.height}`;
};

export const getScoreColor = (score: number): string => {
  if (score >= 0.8) return "success";
  if (score >= 0.6) return "warning";
  return "error";
};

export const getScoreLabel = (score: number): string => {
  if (score >= 0.9) return "Excellent";
  if (score >= 0.8) return "Very Good";
  if (score >= 0.7) return "Good";
  if (score >= 0.6) return "Fair";
  return "Poor";
};

export const downloadImage = (imagePath: string, imageId: string) => {
  const link = document.createElement("a");
  link.href = imagePath;
  link.download = imageId;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const copyToClipboard = async (text: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    console.error("Failed to copy to clipboard:", err);
    throw err;
  }
};

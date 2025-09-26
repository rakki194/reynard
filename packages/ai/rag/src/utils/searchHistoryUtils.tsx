/**
 * Search History Utility Functions
 *
 * Utility functions for formatting, colors, and icons in search history.
 */
import { Icon } from "reynard-primitives";
export const formatTimestamp = (timestamp: Date) => {
  const now = new Date();
  const diff = now.getTime() - timestamp.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return timestamp.toLocaleDateString();
};
export const getModalityIcon = (modality: any) => {
  const iconMap: Record<string, string> = {
    docs: "document",
    images: "image",
    code: "code",
    captions: "text",
  };
  return <Icon name={iconMap[modality] || "document"} />;
};
export const getModalityColor = (modality: any) => {
  const colorMap: Record<string, string> = {
    docs: "blue",
    images: "green",
    code: "purple",
    captions: "orange",
  };
  return colorMap[modality] || "blue";
};
export const getScoreColor = (score: number) => {
  if (score >= 0.8) return "success";
  if (score >= 0.6) return "warning";
  return "error";
};

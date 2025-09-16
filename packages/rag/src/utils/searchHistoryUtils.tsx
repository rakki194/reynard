/**
 * Search History Utility Functions
 *
 * Utility functions for formatting, colors, and icons in search history.
 */

import { getIcon as getIconFromRegistry } from "reynard-fluent-icons";
import type { RAGModality } from "../types";

// Helper function to get icon as JSX element
export const getIcon = (name: string) => {
  const icon = getIconFromRegistry(name);
  if (icon) {
    // Use the proper Reynard pattern for rendering SVG icons
    // eslint-disable-next-line solid/no-innerhtml
    return <div class="icon-wrapper" innerHTML={icon.outerHTML} />;
  }
  return null;
};

export const formatTimestamp = (timestamp: Date): string => {
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

export const getModalityIcon = (modality: RAGModality) => {
  const iconMap: Record<RAGModality, string> = {
    docs: "document",
    images: "image",
    code: "code",
    captions: "text",
  };
  return getIcon(iconMap[modality]);
};

export const getModalityColor = (modality: RAGModality): string => {
  const colorMap: Record<RAGModality, string> = {
    docs: "blue",
    images: "green",
    code: "purple",
    captions: "orange",
  };
  return colorMap[modality];
};

export const getScoreColor = (score: number): string => {
  if (score >= 0.8) return "success";
  if (score >= 0.6) return "warning";
  return "error";
};

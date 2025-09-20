/**
 * RAG Search Tab Configuration
 *
 * Centralized configuration for RAG search tabs
 * following Reynard modular conventions.
 */

import { getIcon as getIconFromRegistry } from "reynard-fluent-icons";
import type { TabItem } from "./types";

// Helper function to get icon as HTML element
const getIcon = (name: string): HTMLElement | null => {
  const icon = getIconFromRegistry(name);
  if (icon) {
    // Create a wrapper div and return the actual HTML element
    const wrapper = document.createElement("div");
    wrapper.innerHTML = icon.outerHTML;
    return wrapper.firstElementChild as HTMLElement;
  }
  return null;
};

/**
 * Creates the tab configuration for RAG search interface
 *
 * @returns Array of tab items with icons and labels
 */
export const createRAGTabConfig = (): TabItem[] => [
  { id: "search", label: "Search", icon: getIcon("search") },
  { id: "documents", label: "Documents", icon: getIcon("box") },
  { id: "upload", label: "Upload", icon: getIcon("upload") },
  { id: "settings", label: "Settings", icon: getIcon("settings") },
];

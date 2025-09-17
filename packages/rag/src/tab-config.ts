/**
 * RAG Search Tab Configuration
 *
 * Centralized configuration for RAG search tabs
 * following Reynard modular conventions.
 */

import { getIcon as getIconFromRegistry } from "reynard-fluent-icons";
import type { TabItem } from "./types";

// Helper function to get icon as JSX element
const getIcon = (name: string) => {
  const icon = getIconFromRegistry(name);
  if (icon) {
    const div = document.createElement("div");
    div.innerHTML = icon.outerHTML;
    return div.firstElementChild as HTMLElement;
  }
  return null;
};

/**
 * Creates the tab configuration for RAG search interface
 *
 * @param includeHistory Whether to include the history tab
 * @returns Array of tab items with icons and labels
 */
export const createRAGTabConfig = (includeHistory: boolean = false): TabItem[] => {
  const baseTabs: TabItem[] = [
    { id: "search", label: "Search", icon: getIcon("search") },
    { id: "documents", label: "Documents", icon: getIcon("box") },
    { id: "upload", label: "Upload", icon: getIcon("upload") },
    { id: "settings", label: "Settings", icon: getIcon("settings") },
  ];

  if (includeHistory) {
    baseTabs.splice(1, 0, {
      id: "history",
      label: "History",
      icon: getIcon("history"),
    });
  }

  return baseTabs;
};

/**
 * RAG Search Tab Configuration
 *
 * Centralized configuration for RAG search tabs
 * following Reynard modular conventions.
 */

import { Icon } from "reynard-primitives";
import type { TabItem } from "./types";

/**
 * Creates the tab configuration for RAG search interface
 *
 * @param includeHistory Whether to include the history tab
 * @returns Array of tab items with icons and labels
 */
export const createRAGTabConfig = (includeHistory: boolean = false): TabItem[] => {
  const baseTabs: TabItem[] = [
    { id: "search", label: "Search", icon: <Icon name="search" /> },
    { id: "documents", label: "Documents", icon: <Icon name="box" /> },
    { id: "upload", label: "Upload", icon: <Icon name="upload" /> },
    { id: "settings", label: "Settings", icon: <Icon name="settings" /> },
  ];

  if (includeHistory) {
    baseTabs.splice(1, 0, {
      id: "history",
      label: "History",
      icon: <Icon name="history" />,
    });
  }

  return baseTabs;
};

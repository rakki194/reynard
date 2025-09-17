/**
 * RAG Search Tab Configuration
 *
 * Centralized configuration for RAG search tabs
 * following Reynard modular conventions.
 */
import type { TabItem } from "./types";
/**
 * Creates the tab configuration for RAG search interface
 *
 * @param includeHistory Whether to include the history tab
 * @returns Array of tab items with icons and labels
 */
export declare const createRAGTabConfig: (includeHistory?: boolean) => TabItem[];

/**
 * Custom hook for breadcrumb navigation state management
 */

import { createSignal } from "solid-js";
import type { BreadcrumbNavigationState } from "./types";

export const useBreadcrumbState = () => {
  const [state, setState] = createSignal<BreadcrumbNavigationState>({
    expandedItems: new Set(),
    showFullPaths: false,
  });

  const toggleExpanded = (itemPath: string) => {
    setState(prev => {
      const newExpanded = new Set(prev.expandedItems);
      if (newExpanded.has(itemPath)) {
        newExpanded.delete(itemPath);
      } else {
        newExpanded.add(itemPath);
      }
      return { ...prev, expandedItems: newExpanded };
    });
  };

  const toggleFullPaths = () => {
    setState(prev => ({ ...prev, showFullPaths: !prev.showFullPaths }));
  };

  const isExpanded = (path: string) => state().expandedItems.has(path);

  return {
    state,
    toggleExpanded,
    toggleFullPaths,
    isExpanded,
  };
};

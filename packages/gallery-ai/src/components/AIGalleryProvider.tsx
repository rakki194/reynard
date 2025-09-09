/**
 * AIGalleryProvider Component
 *
 * Context provider for AI-enhanced gallery functionality.
 * Provides AI state and operations to child components.
 */

import { ParentComponent } from "solid-js";
import { useGalleryAI, AIGalleryContext } from "../composables/useGalleryAI";
import type { AIGalleryProviderProps } from "../types";

export const AIGalleryProvider: ParentComponent<AIGalleryProviderProps> = (
  props,
) => {
  // Create the AI gallery instance directly - SolidJS will track prop changes automatically
  const aiGallery = useGalleryAI({
    get initialConfig() {
      return props.initialConfig;
    },
    get callbacks() {
      return props.callbacks;
    },
    get persistState() {
      return props.persistState ?? true;
    },
    get storageKey() {
      return props.storageKey ?? "reynard-gallery-ai";
    },
  });

  return (
    <AIGalleryContext.Provider value={aiGallery} children={props.children} />
  );
};

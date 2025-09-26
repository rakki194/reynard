/**
 * Custom hook for visibility actions (save/reset)
 */

import { createSignal } from "solid-js";
import type { VisibilitySettings } from "./types";

export const useVisibilityActions = (
  localVisibility: () => VisibilitySettings,
  setLocalVisibility: (value: VisibilitySettings) => void,
  setHasChanges: (value: boolean) => void,
  onUpdateVisibility: () => (visibility: VisibilitySettings) => Promise<boolean>
) => {
  const [isLoading, setIsLoading] = createSignal(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const success = await onUpdateVisibility()(localVisibility());
      if (success) {
        setHasChanges(false);
      }
    } catch (error) {
      console.error("Failed to update visibility:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = (initialVisibility: () => VisibilitySettings) => {
    setLocalVisibility(initialVisibility());
    setHasChanges(false);
  };

  return {
    isLoading,
    handleSave,
    handleReset,
  };
};

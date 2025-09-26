/**
 * Custom hook for managing visibility state
 */

import { createSignal, createEffect } from "solid-js";
import type { VisibilitySettings } from "./types";
import { hasVisibilityChanges } from "./utils";
import { useVisibilityHandlers } from "./useVisibilityHandlers";
import { useVisibilityActions } from "./useVisibilityActions";

export const useVisibilityState = (
  initialVisibility: () => VisibilitySettings,
  onUpdateVisibility: () => (visibility: VisibilitySettings) => Promise<boolean>
) => {
  const [localVisibility, setLocalVisibility] = createSignal(initialVisibility());
  const [hasChanges, setHasChanges] = createSignal(false);

  // Reset local state when initial visibility changes
  createEffect(() => {
    setLocalVisibility(initialVisibility());
    setHasChanges(false);
  });

  // Track changes
  createEffect(() => {
    const current = localVisibility();
    const hasChangesValue = hasVisibilityChanges(current, initialVisibility());
    setHasChanges(hasChangesValue);
  });

  const { handlePublicToggle, handleScopeChange, handleRoleToggle, handleUserToggle } =
    useVisibilityHandlers(setLocalVisibility);

  const { isLoading, handleSave, handleReset } = useVisibilityActions(
    localVisibility,
    setLocalVisibility,
    setHasChanges,
    onUpdateVisibility
  );

  return {
    localVisibility,
    isLoading,
    hasChanges,
    handlePublicToggle,
    handleScopeChange,
    handleRoleToggle,
    handleUserToggle,
    handleSave: () => handleSave(),
    handleReset: () => handleReset(initialVisibility),
  };
};

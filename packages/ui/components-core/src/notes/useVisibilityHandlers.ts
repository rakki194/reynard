/**
 * Custom hook for visibility change handlers
 */

import type { VisibilitySettings } from "./types";

export const useVisibilityHandlers = (
  setLocalVisibility: (updater: (prev: VisibilitySettings) => VisibilitySettings) => void
) => {
  const handlePublicToggle = () => {
    setLocalVisibility(prev => ({
      ...prev,
      isPublic: !prev.isPublic,
    }));
  };

  const handleScopeChange = (newScope: string) => {
    setLocalVisibility(prev => ({
      ...prev,
      scope: newScope as "own" | "team" | "organization" | "global",
    }));
  };

  const handleRoleToggle = (roleId: string) => {
    setLocalVisibility(prev => ({
      ...prev,
      allowedRoles: prev.allowedRoles.includes(roleId)
        ? prev.allowedRoles.filter(id => id !== roleId)
        : [...prev.allowedRoles, roleId],
    }));
  };

  const handleUserToggle = (userId: string) => {
    setLocalVisibility(prev => ({
      ...prev,
      allowedUsers: prev.allowedUsers.includes(userId)
        ? prev.allowedUsers.filter(id => id !== userId)
        : [...prev.allowedUsers, userId],
    }));
  };

  return {
    handlePublicToggle,
    handleScopeChange,
    handleRoleToggle,
    handleUserToggle,
  };
};

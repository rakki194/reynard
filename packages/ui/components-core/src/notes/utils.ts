/**
 * Utility functions for role-based visibility components
 */

import type { VisibilitySettings } from "./types";

export const getScopeDescription = (scope: string): string => {
  switch (scope) {
    case "own":
      return "Only you can see this note";
    case "team":
      return "Your team members can see this note";
    case "organization":
      return "All organization members can see this note";
    case "global":
      return "Everyone can see this note";
    default:
      return "Unknown scope";
  }
};

export const getScopeIcon = (scope: string): string => {
  switch (scope) {
    case "own":
      return "person";
    case "team":
      return "people";
    case "organization":
      return "building";
    case "global":
      return "globe";
    default:
      return "shield";
  }
};

export const hasVisibilityChanges = (current: VisibilitySettings, original: VisibilitySettings): boolean => {
  return (
    current.isPublic !== original.isPublic ||
    JSON.stringify(current.allowedRoles.sort()) !== JSON.stringify(original.allowedRoles.sort()) ||
    JSON.stringify(current.allowedUsers.sort()) !== JSON.stringify(original.allowedUsers.sort()) ||
    current.scope !== original.scope
  );
};

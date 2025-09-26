/**
 * Types and interfaces for role-based visibility components
 */

export interface VisibilitySettings {
  isPublic: boolean;
  allowedRoles: string[];
  allowedUsers: string[];
  scope: "own" | "team" | "organization" | "global";
}

export interface Role {
  id: string;
  displayName: string;
  description?: string;
  level: number;
}

export interface User {
  id: string;
  username: string;
  displayName?: string;
  email: string;
}

export interface RoleBasedVisibilityProps {
  /** Current visibility settings */
  visibility: VisibilitySettings;
  /** Available roles for assignment */
  availableRoles: Role[];
  /** Available users for assignment */
  availableUsers: User[];
  /** Current user's roles */
  currentUserRoles: string[];
  /** Function to update visibility settings */
  onUpdateVisibility: (visibility: VisibilitySettings) => Promise<boolean>;
  /** Whether the user can modify visibility */
  canModifyVisibility: boolean;
}

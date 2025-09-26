/**
 * Visibility Controls Component
 *
 * Contains all the visibility control components.
 */

import { Component } from "solid-js";
import { PublicVisibilityToggle } from "./PublicVisibilityToggle";
import { ScopeSelector } from "./ScopeSelector";
import { RoleAccessList } from "./RoleAccessList";
import { UserAccessList } from "./UserAccessList";
import type { Role, User, VisibilitySettings } from "./types";

export interface VisibilityControlsProps {
  visibility: VisibilitySettings;
  availableRoles: Role[];
  availableUsers: User[];
  canModifyVisibility: boolean;
  onPublicToggle: () => void;
  onScopeChange: (scope: string) => void;
  onRoleToggle: (roleId: string) => void;
  onUserToggle: (userId: string) => void;
}

export const VisibilityControls: Component<VisibilityControlsProps> = props => {
  return (
    <>
      <PublicVisibilityToggle
        isPublic={props.visibility.isPublic}
        disabled={!props.canModifyVisibility}
        onChange={props.onPublicToggle}
      />

      <ScopeSelector
        scope={props.visibility.scope}
        disabled={!props.canModifyVisibility}
        onChange={props.onScopeChange}
      />

      <RoleAccessList
        roles={props.availableRoles}
        allowedRoles={props.visibility.allowedRoles}
        disabled={!props.canModifyVisibility}
        onRoleToggle={props.onRoleToggle}
      />

      <UserAccessList
        users={props.availableUsers}
        allowedUsers={props.visibility.allowedUsers}
        disabled={!props.canModifyVisibility}
        onUserToggle={props.onUserToggle}
      />
    </>
  );
};

export default VisibilityControls;

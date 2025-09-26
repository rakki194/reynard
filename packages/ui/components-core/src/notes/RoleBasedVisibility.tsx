/**
 * Role-Based Visibility Control Component
 *
 * This component provides controls for managing note visibility
 * based on user roles and permissions using the RBAC system.
 */

import { Component, splitProps } from "solid-js";
import { Card } from "reynard-primitives";
import { VisibilityControls } from "./VisibilityControls";
import { ActionButtons } from "./ActionButtons";
import { VisibilityHeader } from "./VisibilityHeader";
import { useVisibilityState } from "./useVisibilityState";
import type { RoleBasedVisibilityProps } from "./types";

export const RoleBasedVisibility: Component<RoleBasedVisibilityProps> = props => {
  const [local] = splitProps(props, [
    "visibility",
    "availableRoles",
    "availableUsers",
    "currentUserRoles",
    "onUpdateVisibility",
    "canModifyVisibility",
  ]);

  const {
    localVisibility,
    isLoading,
    hasChanges,
    handlePublicToggle,
    handleScopeChange,
    handleRoleToggle,
    handleUserToggle,
    handleSave,
    handleReset,
  } = useVisibilityState(
    () => local.visibility,
    () => local.onUpdateVisibility
  );

  return (
    <Card style={{ padding: "16px" }}>
      <VisibilityHeader />

      <VisibilityControls
        visibility={localVisibility()}
        availableRoles={local.availableRoles}
        availableUsers={local.availableUsers}
        canModifyVisibility={local.canModifyVisibility}
        onPublicToggle={handlePublicToggle}
        onScopeChange={handleScopeChange}
        onRoleToggle={handleRoleToggle}
        onUserToggle={handleUserToggle}
      />

      <ActionButtons
        hasChanges={hasChanges()}
        isLoading={isLoading()}
        canModify={local.canModifyVisibility}
        onReset={handleReset}
        onSave={handleSave}
      />
    </Card>
  );
};

export default RoleBasedVisibility;

/**
 * Permission Management Interface Component
 *
 * This component provides a comprehensive interface for managing
 * note permissions using the RBAC system. It allows users to view,
 * modify, and audit permission settings.
 */

import { Component, splitProps, createSignal, For, Show } from "solid-js";
import { Button, Card } from "reynard-primitives";
import { Icon } from "../icons/Icon";

export interface PermissionManagementProps {
  /** Note ID */
  noteId: string;
  /** Current permissions */
  permissions: Array<{
    id: string;
    userId: string;
    username: string;
    displayName?: string;
    email: string;
    permissionLevel: "viewer" | "editor" | "owner";
    grantedAt: string;
    grantedBy: string;
    isActive: boolean;
  }>;
  /** Available users for permission assignment */
  availableUsers: Array<{
    id: string;
    username: string;
    displayName?: string;
    email: string;
  }>;
  /** Permission audit log */
  auditLog: Array<{
    id: string;
    action: string;
    userId: string;
    username: string;
    permissionLevel?: string;
    timestamp: string;
    details: string;
  }>;
  /** Function to add permission */
  onAddPermission: (userId: string, permissionLevel: string) => Promise<boolean>;
  /** Function to update permission */
  onUpdatePermission: (permissionId: string, permissionLevel: string) => Promise<boolean>;
  /** Function to remove permission */
  onRemovePermission: (permissionId: string) => Promise<boolean>;
  /** Function to refresh permissions */
  onRefreshPermissions: () => Promise<void>;
  /** Whether the user can manage permissions */
  canManagePermissions: boolean;
  /** Loading state */
  isLoading: boolean;
}

export const PermissionManagement: Component<PermissionManagementProps> = props => {
  const [local] = splitProps(props, [
    "noteId",
    "permissions",
    "availableUsers",
    "auditLog",
    "onAddPermission",
    "onUpdatePermission",
    "onRemovePermission",
    "onRefreshPermissions",
    "canManagePermissions",
    "isLoading",
  ]);

  const [selectedUser, setSelectedUser] = createSignal<string>("");
  const [selectedPermission, setSelectedPermission] = createSignal<string>("viewer");
  const [isAdding, setIsAdding] = createSignal(false);
  const [isUpdating, setIsUpdating] = createSignal<string | null>(null);
  const [isRemoving, setIsRemoving] = createSignal<string | null>(null);

  const getPermissionColor = (level: string) => {
    switch (level) {
      case "viewer":
        return "brand";
      case "editor":
        return "success";
      case "owner":
        return "danger";
      default:
        return "neutral";
    }
  };

  const handleAddPermission = async () => {
    if (!selectedUser()) return;

    setIsAdding(true);
    try {
      const success = await local.onAddPermission(selectedUser(), selectedPermission());
      if (success) {
        setSelectedUser("");
        setSelectedPermission("viewer");
      }
    } catch (error) {
      console.error("Failed to add permission:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleUpdatePermission = async (permissionId: string, newLevel: string) => {
    setIsUpdating(permissionId);
    try {
      await local.onUpdatePermission(permissionId, newLevel);
    } catch (error) {
      console.error("Failed to update permission:", error);
    } finally {
      setIsUpdating(null);
    }
  };

  const handleRemovePermission = async (permissionId: string) => {
    setIsRemoving(permissionId);
    try {
      await local.onRemovePermission(permissionId);
    } catch (error) {
      console.error("Failed to remove permission:", error);
    } finally {
      setIsRemoving(null);
    }
  };

  // Filter out users who already have permissions
  const availableUsersToAdd = () =>
    local.availableUsers.filter(user => !local.permissions.some(perm => perm.userId === user.id));

  return (
    <div style={{ display: "flex", "flex-direction": "column", gap: "16px" }}>
      {/* Header */}
      <div style={{ display: "flex", "align-items": "center", "justify-content": "space-between" }}>
        <div style={{ display: "flex", "align-items": "center", gap: "8px" }}>
          <Icon name="shield" />
          <span style={{ "font-weight": "600", "font-size": "18px" }}>Permission Management</span>
        </div>
        <Button
          variant="secondary"
          onClick={local.onRefreshPermissions}
          disabled={local.isLoading}
          loading={local.isLoading}
        >
          <Icon name="history" />
          Refresh
        </Button>
      </div>

      {/* Add new permission */}
      <Show when={local.canManagePermissions}>
        <Card style={{ padding: "16px" }}>
          <span style={{ "font-weight": "500", "margin-bottom": "12px", display: "block" }}>Add New Permission</span>
          <div style={{ display: "flex", gap: "12px", "align-items": "end" }}>
            <div style={{ flex: 1 }}>
              <span style={{ "font-size": "12px", "margin-bottom": "4px", display: "block" }}>User</span>
              <select
                value={selectedUser()}
                onChange={e => setSelectedUser(e.currentTarget.value)}
                disabled={isAdding()}
                class="reynard-select"
              >
                <option value="">Select a user</option>
                <For each={availableUsersToAdd()}>
                  {user => (
                    <option value={user.id}>
                      {user.displayName || user.username} ({user.email})
                    </option>
                  )}
                </For>
              </select>
            </div>
            <div style={{ width: "120px" }}>
              <span style={{ "font-size": "12px", "margin-bottom": "4px", display: "block" }}>Permission</span>
              <select
                value={selectedPermission()}
                onChange={e => setSelectedPermission(e.currentTarget.value)}
                disabled={isAdding()}
                class="reynard-select"
              >
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
                <option value="owner">Owner</option>
              </select>
            </div>
            <Button
              variant="primary"
              onClick={handleAddPermission}
              disabled={!selectedUser() || isAdding()}
              loading={isAdding()}
            >
              <Icon name="add" />
              Add
            </Button>
          </div>
        </Card>
      </Show>

      {/* Current permissions table */}
      <Card style={{ padding: "16px" }}>
        <span style={{ "font-weight": "500", "margin-bottom": "12px", display: "block" }}>Current Permissions</span>
        <div class="reynard-table">
          <div class="reynard-table__header">
            <div class="reynard-table__row">
              <div class="reynard-table__cell">User</div>
              <div class="reynard-table__cell">Permission Level</div>
              <div class="reynard-table__cell">Granted At</div>
              <div class="reynard-table__cell">Granted By</div>
              <div class="reynard-table__cell">Status</div>
              <Show when={local.canManagePermissions}>
                <div class="reynard-table__cell">Actions</div>
              </Show>
            </div>
          </div>
          <div class="reynard-table__body">
            <For each={local.permissions}>
              {permission => (
                <div class="reynard-table__row">
                  <div class="reynard-table__cell">
                    <div>
                      <span style={{ "font-weight": "500" }}>{permission.displayName || permission.username}</span>
                      <div style={{ "font-size": "12px", color: "#605e5c" }}>{permission.email}</div>
                    </div>
                  </div>
                  <div class="reynard-table__cell">
                    <div style={{ display: "flex", "align-items": "center", gap: "8px" }}>
                      <span class={`reynard-badge reynard-badge--${getPermissionColor(permission.permissionLevel)}`}>
                        {permission.permissionLevel}
                      </span>
                      <Icon name="info" style={{ color: "#605e5c" }} />
                    </div>
                  </div>
                  <div class="reynard-table__cell">
                    <span style={{ "font-size": "12px" }}>{new Date(permission.grantedAt).toLocaleDateString()}</span>
                  </div>
                  <div class="reynard-table__cell">
                    <span style={{ "font-size": "12px" }}>{permission.grantedBy}</span>
                  </div>
                  <div class="reynard-table__cell">
                    <span class={`reynard-badge reynard-badge--${permission.isActive ? "success" : "neutral"}`}>
                      {permission.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <Show when={local.canManagePermissions}>
                    <div class="reynard-table__cell">
                      <div style={{ display: "flex", gap: "4px" }}>
                        <select
                          value={permission.permissionLevel}
                          onChange={e => handleUpdatePermission(permission.id, e.currentTarget.value)}
                          disabled={isUpdating() === permission.id}
                          class="reynard-select"
                          style={{ width: "100px" }}
                        >
                          <option value="viewer">Viewer</option>
                          <option value="editor">Editor</option>
                          <option value="owner">Owner</option>
                        </select>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemovePermission(permission.id)}
                          disabled={isRemoving() === permission.id}
                          loading={isRemoving() === permission.id}
                        >
                          <Icon name="delete" />
                        </Button>
                      </div>
                    </div>
                  </Show>
                </div>
              )}
            </For>
          </div>
        </div>
        <Show when={local.permissions.length === 0}>
          <div style={{ "text-align": "center", padding: "24px", color: "#605e5c" }}>
            <span>No permissions set</span>
          </div>
        </Show>
      </Card>

      {/* Audit log */}
      <Card style={{ padding: "16px" }}>
        <span style={{ "font-weight": "500", "margin-bottom": "12px", display: "block" }}>Permission Audit Log</span>
        <div class="reynard-table">
          <div class="reynard-table__header">
            <div class="reynard-table__row">
              <div class="reynard-table__cell">Action</div>
              <div class="reynard-table__cell">User</div>
              <div class="reynard-table__cell">Permission Level</div>
              <div class="reynard-table__cell">Timestamp</div>
              <div class="reynard-table__cell">Details</div>
            </div>
          </div>
          <div class="reynard-table__body">
            <For each={local.auditLog}>
              {entry => (
                <div class="reynard-table__row">
                  <div class="reynard-table__cell">
                    <span class="reynard-badge reynard-badge--neutral">{entry.action}</span>
                  </div>
                  <div class="reynard-table__cell">
                    <span style={{ "font-size": "12px" }}>{entry.username}</span>
                  </div>
                  <div class="reynard-table__cell">
                    <Show when={entry.permissionLevel}>
                      <span class={`reynard-badge reynard-badge--${getPermissionColor(entry.permissionLevel!)}`}>
                        {entry.permissionLevel}
                      </span>
                    </Show>
                  </div>
                  <div class="reynard-table__cell">
                    <span style={{ "font-size": "12px" }}>{new Date(entry.timestamp).toLocaleString()}</span>
                  </div>
                  <div class="reynard-table__cell">
                    <span style={{ "font-size": "12px" }}>{entry.details}</span>
                  </div>
                </div>
              )}
            </For>
          </div>
        </div>
        <Show when={local.auditLog.length === 0}>
          <div style={{ "text-align": "center", padding: "24px", color: "#605e5c" }}>
            <span>No audit log entries</span>
          </div>
        </Show>
      </Card>
    </div>
  );
};

export default PermissionManagement;

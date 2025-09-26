/**
 * RBAC Test Page
 *
 * This page demonstrates all three RBAC components with proper props
 * and real user interactions for testing state management.
 */

import { Component, createSignal, For, Show } from "solid-js";
import { Button, Card } from "reynard-primitives";
import { Tabs, TabPanel } from "reynard-components-core";
import { useAuth } from "reynard-auth";
import { useNotifications } from "reynard-core";

// Types for RBAC components
interface VisibilitySettings {
  isPublic: boolean;
  allowedRoles: string[];
  allowedUsers: string[];
  scope: "own" | "team" | "organization" | "global";
}

interface Role {
  id: string;
  displayName: string;
  description?: string;
  level: number;
}

interface User {
  id: string;
  username: string;
  displayName?: string;
  email: string;
}

interface Permission {
  id: string;
  userId: string;
  username: string;
  displayName?: string;
  email: string;
  permissionLevel: "viewer" | "editor" | "owner";
  grantedAt: string;
  grantedBy: string;
  isActive: boolean;
}

interface Collaborator {
  id: string;
  username: string;
  displayName?: string;
  email: string;
  permissionLevel: "viewer" | "editor" | "owner";
}

// Mock RBAC Components (simplified versions for testing)
const MockRoleBasedVisibility: Component<{
  visibility: VisibilitySettings;
  availableRoles: Role[];
  availableUsers: User[];
  currentUserRoles: string[];
  onUpdateVisibility: (visibility: VisibilitySettings) => Promise<boolean>;
  canModifyVisibility: boolean;
}> = props => {
  const [localVisibility, setLocalVisibility] = createSignal(props.visibility);
  const [isLoading, setIsLoading] = createSignal(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await props.onUpdateVisibility(localVisibility());
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card style={{ padding: "16px" }}>
      <h3 style={{ "margin-bottom": "16px" }}>🔒 Role-Based Visibility</h3>

      <div style={{ "margin-bottom": "12px" }}>
        <label style={{ display: "flex", "align-items": "center", gap: "8px" }}>
          <input
            type="checkbox"
            checked={localVisibility().isPublic}
            onChange={e => setLocalVisibility(prev => ({ ...prev, isPublic: e.currentTarget.checked }))}
          />
          Public Note
        </label>
      </div>

      <div style={{ "margin-bottom": "12px" }}>
        <label>Scope:</label>
        <select
          value={localVisibility().scope}
          onChange={e =>
            setLocalVisibility(prev => ({ ...prev, scope: e.currentTarget.value as VisibilitySettings["scope"] }))
          }
          style={{ "margin-left": "8px" }}
        >
          <option value="own">Own</option>
          <option value="team">Team</option>
          <option value="organization">Organization</option>
          <option value="global">Global</option>
        </select>
      </div>

      <div style={{ "margin-bottom": "12px" }}>
        <label>Allowed Roles:</label>
        <div style={{ display: "flex", gap: "8px", "margin-top": "4px" }}>
          <For each={props.availableRoles}>
            {role => (
              <label style={{ display: "flex", "align-items": "center", gap: "4px" }}>
                <input
                  type="checkbox"
                  checked={localVisibility().allowedRoles.includes(role.id)}
                  onChange={e => {
                    if (e.currentTarget.checked) {
                      setLocalVisibility(prev => ({
                        ...prev,
                        allowedRoles: [...prev.allowedRoles, role.id],
                      }));
                    } else {
                      setLocalVisibility(prev => ({
                        ...prev,
                        allowedRoles: prev.allowedRoles.filter(id => id !== role.id),
                      }));
                    }
                  }}
                />
                {role.displayName}
              </label>
            )}
          </For>
        </div>
      </div>

      <div style={{ display: "flex", gap: "8px", "justify-content": "flex-end" }}>
        <Button variant="primary" onClick={handleSave} disabled={isLoading()} loading={isLoading()}>
          Save Changes
        </Button>
      </div>
    </Card>
  );
};

const MockPermissionManagement: Component<{
  noteId: string;
  permissions: Permission[];
  availableUsers: User[];
  auditLog: any[];
  onAddPermission: (userId: string, permissionLevel: string) => Promise<boolean>;
  onUpdatePermission: (permissionId: string, permissionLevel: string) => Promise<boolean>;
  onRemovePermission: (permissionId: string) => Promise<boolean>;
  onRefreshPermissions: () => Promise<void>;
  canManagePermissions: boolean;
  isLoading: boolean;
}> = props => {
  const [selectedUser, setSelectedUser] = createSignal("");
  const [selectedPermission, setSelectedPermission] = createSignal<"viewer" | "editor" | "owner">("viewer");

  const handleAddPermission = async () => {
    if (!selectedUser()) return;
    await props.onAddPermission(selectedUser(), selectedPermission());
    setSelectedUser("");
    setSelectedPermission("viewer");
  };

  return (
    <div style={{ display: "flex", "flex-direction": "column", gap: "16px" }}>
      <Card style={{ padding: "16px" }}>
        <h3 style={{ "margin-bottom": "16px" }}>👥 Permission Management</h3>

        <div style={{ display: "flex", gap: "12px", "margin-bottom": "16px" }}>
          <select value={selectedUser()} onChange={e => setSelectedUser(e.currentTarget.value)} style={{ flex: 1 }}>
            <option value="">Select a user</option>
            <For each={props.availableUsers}>
              {user => (
                <option value={user.id}>
                  {user.displayName || user.username} ({user.email})
                </option>
              )}
            </For>
          </select>

          <select
            value={selectedPermission()}
            onChange={e => setSelectedPermission(e.currentTarget.value as "viewer" | "editor" | "owner")}
            style={{ width: "120px" }}
          >
            <option value="viewer">Viewer</option>
            <option value="editor">Editor</option>
            <option value="owner">Owner</option>
          </select>

          <Button variant="primary" onClick={handleAddPermission} disabled={!selectedUser()}>
            Add Permission
          </Button>
        </div>

        <div style={{ "margin-bottom": "16px" }}>
          <h4>Current Permissions:</h4>
          <For each={props.permissions}>
            {permission => (
              <div
                style={{
                  display: "flex",
                  "justify-content": "space-between",
                  "align-items": "center",
                  padding: "8px",
                  border: "1px solid #e1dfdd",
                  "border-radius": "4px",
                  "margin-bottom": "4px",
                }}
              >
                <span>
                  {permission.displayName || permission.username} - {permission.permissionLevel}
                </span>
                <div style={{ display: "flex", gap: "4px" }}>
                  <select
                    value={permission.permissionLevel}
                    onChange={e =>
                      props.onUpdatePermission(permission.id, e.currentTarget.value as "viewer" | "editor" | "owner")
                    }
                    style={{ width: "100px" }}
                  >
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                    <option value="owner">Owner</option>
                  </select>
                  <Button variant="ghost" size="sm" onClick={() => props.onRemovePermission(permission.id)}>
                    Remove
                  </Button>
                </div>
              </div>
            )}
          </For>
        </div>

        <Button variant="secondary" onClick={props.onRefreshPermissions} disabled={props.isLoading}>
          Refresh Permissions
        </Button>
      </Card>

      <Card style={{ padding: "16px" }}>
        <h4 style={{ "margin-bottom": "12px" }}>Audit Log:</h4>
        <For each={props.auditLog.slice(0, 5)}>
          {entry => (
            <div
              style={{
                padding: "8px",
                "border-bottom": "1px solid #e1dfdd",
                "font-size": "12px",
              }}
            >
              <strong>{entry.action}</strong> - {entry.username} - {new Date(entry.timestamp).toLocaleString()}
              <div style={{ color: "#605e5c" }}>{entry.details}</div>
            </div>
          )}
        </For>
      </Card>
    </div>
  );
};

const MockNoteSharingModal: Component<{
  isOpen: boolean;
  onClose: () => void;
  noteId: string;
  currentUserId: string;
  availableUsers: User[];
  collaborators: Collaborator[];
  onShareNote: (userId: string, permissionLevel: string) => Promise<boolean>;
  onRevokeAccess: (userId: string, username: string) => Promise<boolean>;
  onUpdatePermission: (userId: string, permissionLevel: string, username: string) => Promise<boolean>;
}> = props => {
  const [selectedUser, setSelectedUser] = createSignal("");
  const [selectedPermission, setSelectedPermission] = createSignal<"viewer" | "editor" | "owner">("viewer");

  const handleShareNote = async () => {
    if (!selectedUser()) return;
    await props.onShareNote(selectedUser(), selectedPermission());
    setSelectedUser("");
    setSelectedPermission("viewer");
  };

  return (
    <Show when={props.isOpen}>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          "background-color": "rgba(0, 0, 0, 0.5)",
          display: "flex",
          "align-items": "center",
          "justify-content": "center",
          "z-index": 1000,
        }}
      >
        <div
          style={{
            "background-color": "white",
            padding: "24px",
            "border-radius": "8px",
            "min-width": "500px",
            "max-width": "90vw",
            "max-height": "90vh",
            overflow: "auto",
          }}
        >
          <div
            style={{
              display: "flex",
              "justify-content": "space-between",
              "align-items": "center",
              "margin-bottom": "16px",
            }}
          >
            <h2>🔗 Share Note</h2>
            <Button variant="ghost" onClick={props.onClose}>
              ×
            </Button>
          </div>

          <div style={{ "margin-bottom": "16px" }}>
            <h3>Share with new user:</h3>
            <div style={{ display: "flex", gap: "12px", "margin-bottom": "12px" }}>
              <select value={selectedUser()} onChange={e => setSelectedUser(e.currentTarget.value)} style={{ flex: 1 }}>
                <option value="">Select a user</option>
                <For each={props.availableUsers.filter(u => !props.collaborators.some(c => c.id === u.id))}>
                  {user => (
                    <option value={user.id}>
                      {user.displayName || user.username} ({user.email})
                    </option>
                  )}
                </For>
              </select>

              <select
                value={selectedPermission()}
                onChange={e => setSelectedPermission(e.currentTarget.value as "viewer" | "editor" | "owner")}
                style={{ width: "120px" }}
              >
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
                <option value="owner">Owner</option>
              </select>

              <Button variant="primary" onClick={handleShareNote} disabled={!selectedUser()}>
                Share
              </Button>
            </div>
          </div>

          <div>
            <h3>Current collaborators:</h3>
            <For each={props.collaborators}>
              {collab => (
                <div
                  style={{
                    display: "flex",
                    "justify-content": "space-between",
                    "align-items": "center",
                    padding: "12px",
                    border: "1px solid #e1dfdd",
                    "border-radius": "4px",
                    "margin-bottom": "8px",
                  }}
                >
                  <div>
                    <div style={{ "font-weight": "bold" }}>{collab.displayName || collab.username}</div>
                    <div style={{ "font-size": "12px", color: "#605e5c" }}>{collab.email}</div>
                  </div>

                  <div style={{ display: "flex", gap: "8px", "align-items": "center" }}>
                    <select
                      value={collab.permissionLevel}
                      onChange={e =>
                        props.onUpdatePermission(
                          collab.id,
                          e.currentTarget.value as "viewer" | "editor" | "owner",
                          collab.username
                        )
                      }
                      style={{ width: "100px" }}
                    >
                      <option value="viewer">Viewer</option>
                      <option value="editor">Editor</option>
                      <option value="owner">Owner</option>
                    </select>

                    <Show when={collab.id !== props.currentUserId}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => props.onRevokeAccess(collab.id, collab.username)}
                      >
                        Revoke
                      </Button>
                    </Show>
                  </div>
                </div>
              )}
            </For>
          </div>

          <div style={{ display: "flex", "justify-content": "flex-end", "margin-top": "24px" }}>
            <Button variant="secondary" onClick={props.onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </Show>
  );
};

// Mock data for testing
const mockRoles: Role[] = [
  { id: "admin", displayName: "Administrator", description: "Full system access", level: 100 },
  { id: "editor", displayName: "Editor", description: "Can edit content", level: 50 },
  { id: "viewer", displayName: "Viewer", description: "Read-only access", level: 10 },
  { id: "guest", displayName: "Guest", description: "Limited access", level: 1 },
];

const mockUsers: User[] = [
  { id: "user1", username: "alice", displayName: "Alice Johnson", email: "alice@example.com" },
  { id: "user2", username: "bob", displayName: "Bob Smith", email: "bob@example.com" },
  { id: "user3", username: "charlie", displayName: "Charlie Brown", email: "charlie@example.com" },
  { id: "user4", username: "diana", displayName: "Diana Prince", email: "diana@example.com" },
];

const mockPermissions: Permission[] = [
  {
    id: "perm1",
    userId: "user1",
    username: "alice",
    displayName: "Alice Johnson",
    email: "alice@example.com",
    permissionLevel: "editor",
    grantedAt: "2024-01-15T10:30:00Z",
    grantedBy: "admin",
    isActive: true,
  },
  {
    id: "perm2",
    userId: "user2",
    username: "bob",
    displayName: "Bob Smith",
    email: "bob@example.com",
    permissionLevel: "viewer",
    grantedAt: "2024-01-16T14:20:00Z",
    grantedBy: "alice",
    isActive: true,
  },
];

const mockAuditLog = [
  {
    id: "audit1",
    action: "permission_granted",
    userId: "user1",
    username: "alice",
    permissionLevel: "editor",
    timestamp: "2024-01-15T10:30:00Z",
    details: "Granted editor permission to Alice Johnson",
  },
  {
    id: "audit2",
    action: "permission_granted",
    userId: "user2",
    username: "bob",
    permissionLevel: "viewer",
    timestamp: "2024-01-16T14:20:00Z",
    details: "Granted viewer permission to Bob Smith",
  },
  {
    id: "audit3",
    action: "visibility_changed",
    userId: "admin",
    username: "admin",
    timestamp: "2024-01-17T09:15:00Z",
    details: "Changed note visibility to team scope",
  },
];

const RBACTestPage: Component = () => {
  const { user: authUser } = useAuth();
  const { notify } = useNotifications();

  // State for RoleBasedVisibility component
  const [visibility, setVisibility] = createSignal<VisibilitySettings>({
    isPublic: false,
    allowedRoles: ["editor", "viewer"],
    allowedUsers: ["user1", "user2"],
    scope: "team",
  });

  // State for PermissionManagement component
  const [permissions, setPermissions] = createSignal<Permission[]>(mockPermissions);
  const [auditLog, setAuditLog] = createSignal(mockAuditLog);
  const [isLoading, setIsLoading] = createSignal(false);

  // State for NoteSharingModal component
  const [isSharingModalOpen, setIsSharingModalOpen] = createSignal(false);

  // State for Tabs component
  const [activeTab, setActiveTab] = createSignal("visibility");
  const [collaborators, setCollaborators] = createSignal<Collaborator[]>([
    {
      id: "user1",
      username: "alice",
      displayName: "Alice Johnson",
      email: "alice@example.com",
      permissionLevel: "editor",
    },
    {
      id: "user2",
      username: "bob",
      displayName: "Bob Smith",
      email: "bob@example.com",
      permissionLevel: "viewer",
    },
  ]);

  // Current user roles (mock)
  const currentUserRoles = ["admin", "editor"];

  // Handlers for RoleBasedVisibility
  const handleUpdateVisibility = async (newVisibility: VisibilitySettings): Promise<boolean> => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setVisibility(newVisibility);
      notify("Visibility settings updated successfully!", "success");
      return true;
    } catch (error) {
      notify("Failed to update visibility settings", "error");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Handlers for PermissionManagement
  const handleAddPermission = async (userId: string, permissionLevel: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));

      const user = mockUsers.find(u => u.id === userId);
      if (!user) return false;

      const newPermission: Permission = {
        id: `perm${Date.now()}`,
        userId,
        username: user.username,
        displayName: user.displayName,
        email: user.email,
        permissionLevel: permissionLevel as "viewer" | "editor" | "owner",
        grantedAt: new Date().toISOString(),
        grantedBy: authUser()?.username || "current_user",
        isActive: true,
      };

      setPermissions(prev => [...prev, newPermission]);

      // Add to audit log
      const auditEntry = {
        id: `audit${Date.now()}`,
        action: "permission_granted",
        userId,
        username: user.username,
        permissionLevel,
        timestamp: new Date().toISOString(),
        details: `Granted ${permissionLevel} permission to ${user.displayName || user.username}`,
      };
      setAuditLog(prev => [auditEntry, ...prev]);

      notify(`Permission granted to ${user.displayName || user.username}`, "success");
      return true;
    } catch (error) {
      notify("Failed to add permission", "error");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePermission = async (permissionId: string, permissionLevel: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600));

      setPermissions(prev =>
        prev.map(perm =>
          perm.id === permissionId
            ? { ...perm, permissionLevel: permissionLevel as "viewer" | "editor" | "owner" }
            : perm
        )
      );

      // Add to audit log
      const permission = permissions().find(p => p.id === permissionId);
      if (permission) {
        const auditEntry = {
          id: `audit${Date.now()}`,
          action: "permission_updated",
          userId: permission.userId,
          username: permission.username,
          permissionLevel,
          timestamp: new Date().toISOString(),
          details: `Updated permission for ${permission.displayName || permission.username} to ${permissionLevel}`,
        };
        setAuditLog(prev => [auditEntry, ...prev]);
      }

      notify("Permission updated successfully", "success");
      return true;
    } catch (error) {
      notify("Failed to update permission", "error");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemovePermission = async (permissionId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      const permission = permissions().find(p => p.id === permissionId);
      setPermissions(prev => prev.filter(perm => perm.id !== permissionId));

      // Add to audit log
      if (permission) {
        const auditEntry = {
          id: `audit${Date.now()}`,
          action: "permission_revoked",
          userId: permission.userId,
          username: permission.username,
          timestamp: new Date().toISOString(),
          details: `Revoked permission for ${permission.displayName || permission.username}`,
        };
        setAuditLog(prev => [auditEntry, ...prev]);
      }

      notify("Permission removed successfully", "success");
      return true;
    } catch (error) {
      notify("Failed to remove permission", "error");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshPermissions = async (): Promise<void> => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      notify("Permissions refreshed", "success");
    } catch (error) {
      notify("Failed to refresh permissions", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Handlers for NoteSharingModal
  const handleShareNote = async (userId: string, permissionLevel: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));

      const user = mockUsers.find(u => u.id === userId);
      if (!user) return false;

      const newCollaborator: Collaborator = {
        id: userId,
        username: user.username,
        displayName: user.displayName,
        email: user.email,
        permissionLevel: permissionLevel as "viewer" | "editor" | "owner",
      };

      setCollaborators(prev => [...prev, newCollaborator]);
      notify(`Note shared with ${user.displayName || user.username}`, "success");
      return true;
    } catch (error) {
      notify("Failed to share note", "error");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeAccess = async (userId: string, username: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      setCollaborators(prev => prev.filter(collab => collab.id !== userId));
      notify(`Access revoked for ${username}`, "success");
      return true;
    } catch (error) {
      notify("Failed to revoke access", "error");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePermissionModal = async (
    userId: string,
    permissionLevel: string,
    username: string
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600));

      setCollaborators(prev =>
        prev.map(collab =>
          collab.id === userId
            ? { ...collab, permissionLevel: permissionLevel as "viewer" | "editor" | "owner" }
            : collab
        )
      );

      notify(`Permission updated for ${username}`, "success");
      return true;
    } catch (error) {
      notify("Failed to update permission", "error");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: "24px", "max-width": "1200px", margin: "0 auto" }}>
      <div style={{ "margin-bottom": "32px" }}>
        <h1 style={{ "margin-bottom": "8px" }}>🛡️ RBAC Components Test Page</h1>
        <p style={{ color: "#605e5c", "margin-bottom": "16px" }}>
          Test all three RBAC components with real user interactions and state management.
        </p>
        <div style={{ display: "flex", gap: "12px", "align-items": "center" }}>
          <Button variant="primary" onClick={() => setIsSharingModalOpen(true)} disabled={isLoading()}>
            🔗 Open Sharing Modal
          </Button>
          <Show when={isLoading()}>
            <span style={{ color: "#0078D4" }}>Loading...</span>
          </Show>
        </div>
      </div>

      <Tabs
        items={[
          { id: "visibility", label: "Role-Based Visibility" },
          { id: "permissions", label: "Permission Management" },
          { id: "state", label: "Current State" },
        ]}
        activeTab={activeTab()}
        onTabChange={setActiveTab}
      >
        <TabPanel tabId="visibility" activeTab={activeTab()}>
          <div style={{ "margin-bottom": "24px" }}>
            <h2 style={{ "margin-bottom": "16px" }}>Visibility Controls</h2>
            <p style={{ color: "#605e5c", "margin-bottom": "16px" }}>
              Test the role-based visibility component with different permission levels.
            </p>
            <MockRoleBasedVisibility
              visibility={visibility()}
              availableRoles={mockRoles}
              availableUsers={mockUsers}
              currentUserRoles={currentUserRoles}
              onUpdateVisibility={handleUpdateVisibility}
              canModifyVisibility={true}
            />
          </div>
        </TabPanel>

        <TabPanel tabId="permissions" activeTab={activeTab()}>
          <div style={{ "margin-bottom": "24px" }}>
            <h2 style={{ "margin-bottom": "16px" }}>Permission Management</h2>
            <p style={{ color: "#605e5c", "margin-bottom": "16px" }}>
              Test the comprehensive permission management interface with audit logging.
            </p>
            <MockPermissionManagement
              noteId="test-note-123"
              permissions={permissions()}
              availableUsers={mockUsers}
              auditLog={auditLog()}
              onAddPermission={handleAddPermission}
              onUpdatePermission={handleUpdatePermission}
              onRemovePermission={handleRemovePermission}
              onRefreshPermissions={handleRefreshPermissions}
              canManagePermissions={true}
              isLoading={isLoading()}
            />
          </div>
        </TabPanel>

        <TabPanel tabId="state" activeTab={activeTab()}>
          <div style={{ "margin-bottom": "24px" }}>
            <h2 style={{ "margin-bottom": "16px" }}>Current State Debug</h2>
            <p style={{ color: "#605e5c", "margin-bottom": "16px" }}>
              View the current state of all components for debugging purposes.
            </p>

            <div style={{ display: "grid", gap: "16px", "grid-template-columns": "1fr 1fr" }}>
              <Card style={{ padding: "16px" }}>
                <h3 style={{ "margin-bottom": "12px" }}>Visibility Settings</h3>
                <pre
                  style={{
                    "background-color": "#f5f5f5",
                    padding: "12px",
                    "border-radius": "4px",
                    "font-size": "12px",
                    overflow: "auto",
                  }}
                >
                  {JSON.stringify(visibility(), null, 2)}
                </pre>
              </Card>

              <Card style={{ padding: "16px" }}>
                <h3 style={{ "margin-bottom": "12px" }}>Current Permissions</h3>
                <pre
                  style={{
                    "background-color": "#f5f5f5",
                    padding: "12px",
                    "border-radius": "4px",
                    "font-size": "12px",
                    overflow: "auto",
                  }}
                >
                  {JSON.stringify(permissions(), null, 2)}
                </pre>
              </Card>

              <Card style={{ padding: "16px" }}>
                <h3 style={{ "margin-bottom": "12px" }}>Collaborators</h3>
                <pre
                  style={{
                    "background-color": "#f5f5f5",
                    padding: "12px",
                    "border-radius": "4px",
                    "font-size": "12px",
                    overflow: "auto",
                  }}
                >
                  {JSON.stringify(collaborators(), null, 2)}
                </pre>
              </Card>

              <Card style={{ padding: "16px" }}>
                <h3 style={{ "margin-bottom": "12px" }}>Audit Log (Last 3)</h3>
                <pre
                  style={{
                    "background-color": "#f5f5f5",
                    padding: "12px",
                    "border-radius": "4px",
                    "font-size": "12px",
                    overflow: "auto",
                  }}
                >
                  {JSON.stringify(auditLog().slice(0, 3), null, 2)}
                </pre>
              </Card>
            </div>
          </div>
        </TabPanel>
      </Tabs>

      {/* Note Sharing Modal */}
      <MockNoteSharingModal
        isOpen={isSharingModalOpen()}
        onClose={() => setIsSharingModalOpen(false)}
        noteId="test-note-123"
        currentUserId={authUser()?.id || "current_user"}
        availableUsers={mockUsers}
        collaborators={collaborators()}
        onShareNote={handleShareNote}
        onRevokeAccess={handleRevokeAccess}
        onUpdatePermission={handleUpdatePermissionModal}
      />
    </div>
  );
};

export default RBACTestPage;

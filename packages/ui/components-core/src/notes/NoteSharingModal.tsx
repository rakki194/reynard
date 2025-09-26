/**
 * Note Sharing Modal Component
 *
 * This component provides a modal interface for sharing notes
 * with other users using the RBAC system. It allows users to
 * grant different permission levels and manage existing collaborations.
 */

import { Component, splitProps, createSignal, createEffect, For, Show } from "solid-js";
import { Button } from "reynard-primitives";
import { Modal } from "../Modal";
import { Icon } from "../icons/Icon";

export interface NoteSharingModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Function to close the modal */
  onClose: () => void;
  /** Note ID */
  noteId: string;
  /** Current user ID */
  currentUserId: string;
  /** Available users for sharing */
  availableUsers: Array<{
    id: string;
    username: string;
    displayName?: string;
    email: string;
  }>;
  /** Current collaborators */
  collaborators: Array<{
    id: string;
    username: string;
    displayName?: string;
    email: string;
    permissionLevel: "viewer" | "editor" | "owner";
  }>;
  /** Function to share note with user */
  onShareNote: (userId: string, permissionLevel: string) => Promise<boolean>;
  /** Function to revoke access */
  onRevokeAccess: (userId: string, username: string) => Promise<boolean>;
  /** Function to update permission level */
  onUpdatePermission: (userId: string, permissionLevel: string, username: string) => Promise<boolean>;
}

export const NoteSharingModal: Component<NoteSharingModalProps> = props => {
  const [local] = splitProps(props, [
    "isOpen",
    "onClose",
    "noteId",
    "currentUserId",
    "availableUsers",
    "collaborators",
    "onShareNote",
    "onRevokeAccess",
    "onUpdatePermission",
  ]);

  const [selectedUser, setSelectedUser] = createSignal<string>("");
  const [selectedPermission, setSelectedPermission] = createSignal<string>("viewer");
  const [isLoading, setIsLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [success, setSuccess] = createSignal<string | null>(null);

  createEffect(() => {
    if (local.isOpen) {
      setSelectedUser("");
      setSelectedPermission("viewer");
      setError(null);
      setSuccess(null);
    }
  });

  const handleShareNote = async () => {
    if (!selectedUser()) {
      setError("Please select a user to share with");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const success = await local.onShareNote(selectedUser(), selectedPermission());
      if (success) {
        setSuccess(`Note shared successfully with ${selectedUser()}`);
        setSelectedUser("");
        setSelectedPermission("viewer");
      } else {
        setError("Failed to share note. Please try again.");
      }
    } catch (err) {
      setError("An error occurred while sharing the note");
      console.error("Error sharing note:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeAccess = async (userId: string, username: string) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const success = await local.onRevokeAccess(userId, username);
      if (success) {
        setSuccess(`Access revoked for ${username}`);
      } else {
        setError("Failed to revoke access. Please try again.");
      }
    } catch (err) {
      setError("An error occurred while revoking access");
      console.error("Error revoking access:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePermission = async (userId: string, permissionLevel: string, username: string) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const success = await local.onUpdatePermission(userId, permissionLevel, username);
      if (success) {
        setSuccess(`Permission updated for ${username}`);
      } else {
        setError("Failed to update permission. Please try again.");
      }
    } catch (err) {
      setError("An error occurred while updating permission");
      console.error("Error updating permission:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getPermissionDescription = (level: string) => {
    switch (level) {
      case "viewer":
        return "Can view the note";
      case "editor":
        return "Can view and edit the note";
      case "owner":
        return "Can view, edit, and manage sharing";
      default:
        return "Unknown permission level";
    }
  };

  // Filter out users who are already collaborators
  const availableUsersToShare = () =>
    local.availableUsers.filter(user => !local.collaborators.some(collab => collab.id === user.id));

  return (
    <Modal open={local.isOpen} onClose={local.onClose} title="Share Note">
      <div style={{ padding: "24px", "min-width": "500px" }}>
        <div style={{ display: "flex", "align-items": "center", "margin-bottom": "16px" }}>
          <Icon name="shield" style={{ "margin-right": "8px" }} />
          <h2 style={{ margin: 0 }}>Share Note</h2>
        </div>

        <Show when={error()}>
          <div class="reynard-alert reynard-alert--error" style={{ "margin-bottom": "16px" }}>
            {error()}
          </div>
        </Show>

        <Show when={success()}>
          <div class="reynard-alert reynard-alert--success" style={{ "margin-bottom": "16px" }}>
            {success()}
          </div>
        </Show>

        {/* Share with new user */}
        <div style={{ "margin-bottom": "24px" }}>
          <h3 style={{ "margin-bottom": "12px" }}>Share with new user</h3>

          <div style={{ display: "flex", gap: "12px", "margin-bottom": "12px" }}>
            <select
              value={selectedUser()}
              onChange={e => setSelectedUser(e.currentTarget.value)}
              style={{ flex: 1 }}
              class="reynard-select"
            >
              <option value="">Select a user</option>
              <For each={availableUsersToShare()}>
                {user => (
                  <option value={user.id}>
                    {user.displayName || user.username} ({user.email})
                  </option>
                )}
              </For>
            </select>

            <select
              value={selectedPermission()}
              onChange={e => setSelectedPermission(e.currentTarget.value)}
              style={{ width: "120px" }}
              class="reynard-select"
            >
              <option value="viewer">Viewer</option>
              <option value="editor">Editor</option>
              <option value="owner">Owner</option>
            </select>

            <Button
              variant="primary"
              onClick={handleShareNote}
              disabled={!selectedUser() || isLoading()}
              loading={isLoading()}
            >
              <Icon name="people-add" />
              Share
            </Button>
          </div>

          <div style={{ "font-size": "12px", color: "#605e5c" }}>
            <Icon name="info" style={{ "margin-right": "4px" }} />
            {getPermissionDescription(selectedPermission())}
          </div>
        </div>

        {/* Current collaborators */}
        <div>
          <h3 style={{ "margin-bottom": "12px" }}>Current collaborators</h3>

          <Show
            when={local.collaborators.length > 0}
            fallback={<div style={{ color: "#605e5c", "font-style": "italic" }}>No collaborators yet</div>}
          >
            <div style={{ display: "flex", "flex-direction": "column", gap: "8px" }}>
              <For each={local.collaborators}>
                {collab => (
                  <div
                    style={{
                      display: "flex",
                      "align-items": "center",
                      "justify-content": "space-between",
                      padding: "12px",
                      border: "1px solid #e1dfdd",
                      "border-radius": "4px",
                      "background-color": "#faf9f8",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ "font-weight": "bold" }}>{collab.displayName || collab.username}</div>
                      <div style={{ "font-size": "12px", color: "#605e5c" }}>{collab.email}</div>
                    </div>

                    <div style={{ display: "flex", "align-items": "center", gap: "12px" }}>
                      <select
                        value={collab.permissionLevel}
                        onChange={e => handleUpdatePermission(collab.id, e.currentTarget.value, collab.username)}
                        disabled={isLoading()}
                        style={{ width: "100px" }}
                        class="reynard-select"
                      >
                        <option value="viewer">Viewer</option>
                        <option value="editor">Editor</option>
                        <option value="owner">Owner</option>
                      </select>

                      <div
                        style={{
                          width: "8px",
                          height: "8px",
                          "border-radius": "50%",
                          "background-color": "#605e5c",
                        }}
                      />

                      <Show when={collab.id !== local.currentUserId}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRevokeAccess(collab.id, collab.username)}
                          disabled={isLoading()}
                        >
                          <Icon name="person-delete" />
                          Revoke
                        </Button>
                      </Show>
                    </div>
                  </div>
                )}
              </For>
            </div>
          </Show>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", "justify-content": "flex-end", "margin-top": "24px" }}>
          <Button variant="secondary" onClick={local.onClose} disabled={isLoading()}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default NoteSharingModal;

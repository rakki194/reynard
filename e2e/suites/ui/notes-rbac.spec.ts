/**
 * Notes RBAC E2E Test Suite
 *
 * End-to-end tests for the RBAC-enabled notes system including
 * note sharing, permission management, and role-based visibility.
 *
 * 🦊 *whiskers twitch with RBAC precision* Tests the complete
 * role-based access control system for notes.
 */

import { test, expect, Page } from "@playwright/test";
import { createTestPage } from "../../modules/dom";

test.describe("Notes RBAC E2E Tests", () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await createTestPage(page, { path: "/e2e/fixtures/dom-test-page.html" });
  });

  test.afterEach(async () => {
    await page.close();
  });

  test("should render NoteSharingModal when opened", async () => {
    await page.setContent(`
      <div id="modal-container"></div>
      <script type="module">
        import { render } from "solid-js/web";
        import { createSignal } from "solid-js";
        import { NoteSharingModal } from "/packages/ui/components-core/src/notes/NoteSharingModal.tsx";

        const [isOpen, setIsOpen] = createSignal(true);

        const mockProps = {
          isOpen: isOpen(),
          onClose: () => setIsOpen(false),
          noteId: "note-123",
          currentUserId: "user-1",
          availableUsers: [
            {
              id: "user-2",
              username: "john_doe",
              displayName: "John Doe",
              email: "john@example.com"
            },
            {
              id: "user-3",
              username: "jane_smith",
              displayName: "Jane Smith",
              email: "jane@example.com"
            }
          ],
          collaborators: [
            {
              id: "collab-1",
              userId: "user-2",
              username: "john_doe",
              displayName: "John Doe",
              email: "john@example.com",
              permission: "read",
              role: "viewer",
              grantedAt: "2024-01-01T00:00:00Z",
              grantedBy: "user-1"
            }
          ],
          onShareNote: async (userId, permission) => {
            console.log("Sharing note with user:", userId, "permission:", permission);
            return true;
          },
          onRevokeAccess: async (userId) => {
            console.log("Revoking access for user:", userId);
            return true;
          },
          onUpdatePermission: async (userId, permission) => {
            console.log("Updating permission for user:", userId, "to:", permission);
            return true;
          }
        };

        render(() => (
          <NoteSharingModal {...mockProps} />
        ), document.getElementById("modal-container"));
      </script>
    `);

    // Wait for the modal to render
    await page.waitForTimeout(1000);

    // Check if the modal is visible
    await expect(page.locator("#modal-container")).toBeVisible();

    // Check for key modal elements
    await expect(page.locator("#modal-container")).toContainText("Share Note");
    await expect(page.locator("#modal-container")).toContainText("Add Collaborators");
    await expect(page.locator("#modal-container")).toContainText("Current Collaborators");

    // Check if existing collaborator is displayed
    await expect(page.locator("#modal-container")).toContainText("John Doe");
    await expect(page.locator("#modal-container")).toContainText("john@example.com");
  });

  test("should allow selecting users and sharing notes", async () => {
    await page.setContent(`
      <div id="modal-container"></div>
      <script type="module">
        import { render } from "solid-js/web";
        import { createSignal } from "solid-js";
        import { NoteSharingModal } from "/packages/ui/components-core/src/notes/NoteSharingModal.tsx";

        const [isOpen, setIsOpen] = createSignal(true);
        const [shareResult, setShareResult] = createSignal(null);

        const mockProps = {
          isOpen: isOpen(),
          onClose: () => setIsOpen(false),
          noteId: "note-123",
          currentUserId: "user-1",
          availableUsers: [
            {
              id: "user-2",
              username: "john_doe",
              displayName: "John Doe",
              email: "john@example.com"
            },
            {
              id: "user-3",
              username: "jane_smith",
              displayName: "Jane Smith",
              email: "jane@example.com"
            }
          ],
          collaborators: [],
          onShareNote: async (userId, permission) => {
            setShareResult({ userId, permission });
            console.log("Sharing note with user:", userId, "permission:", permission);
            return true;
          },
          onRevokeAccess: async (userId) => {
            console.log("Revoking access for user:", userId);
            return true;
          },
          onUpdatePermission: async (userId, permission) => {
            console.log("Updating permission for user:", userId, "to:", permission);
            return true;
          }
        };

        render(() => (
          <NoteSharingModal {...mockProps} />
        ), document.getElementById("modal-container"));
      </script>
    `);

    // Wait for the modal to render
    await page.waitForTimeout(1000);

    // Check if user selection dropdown is present
    const userSelect = page.locator("select").first();
    await expect(userSelect).toBeVisible();

    // Select a user from the dropdown
    await userSelect.selectOption("user-2");

    // Check if permission dropdown is present
    const permissionSelect = page.locator("select").nth(1);
    await expect(permissionSelect).toBeVisible();

    // Select a permission
    await permissionSelect.selectOption("read");

    // Click the share button
    const shareButton = page.locator('button:has-text("Share")');
    await expect(shareButton).toBeVisible();
    await shareButton.click();

    // Wait for the share operation to complete
    await page.waitForTimeout(500);

    // Verify the user was selected
    await expect(userSelect).toHaveValue("user-2");
  });

  test("should render RoleBasedVisibility component", async () => {
    await page.setContent(`
      <div id="visibility-container"></div>
      <script type="module">
        import { render } from "solid-js/web";
        import { createSignal } from "solid-js";
        import { RoleBasedVisibility } from "/packages/ui/components-core/src/notes/RoleBasedVisibility.tsx";

        const [visibility, setVisibility] = createSignal({
          isPublic: false,
          scope: "own",
          allowedRoles: ["admin", "user"],
          allowedUsers: ["user-2"]
        });

        const mockProps = {
          isPublic: visibility().isPublic,
          onPublicChange: (isPublic) => {
            setVisibility(prev => ({ ...prev, isPublic }));
          },
          scope: visibility().scope,
          onScopeChange: (scope) => {
            setVisibility(prev => ({ ...prev, scope }));
          },
          roles: [
            {
              id: "admin",
              name: "Admin",
              level: 4,
              description: "Administrator role"
            },
            {
              id: "user",
              name: "User",
              level: 2,
              description: "Regular user role"
            },
            {
              id: "guest",
              name: "Guest",
              level: 1,
              description: "Guest user role"
            }
          ],
          users: [
            {
              id: "user-2",
              name: "John Doe",
              email: "john@example.com",
              role: "user"
            },
            {
              id: "user-3",
              name: "Jane Smith",
              email: "jane@example.com",
              role: "admin"
            }
          ],
          onSave: async () => {
            console.log("Saving visibility settings");
            return true;
          },
          onReset: () => {
            console.log("Resetting visibility settings");
          },
          noteId: "note-123"
        };

        render(() => (
          <RoleBasedVisibility {...mockProps} />
        ), document.getElementById("visibility-container"));
      </script>
    `);

    // Wait for the component to render
    await page.waitForTimeout(1000);

    // Check if the component is visible
    await expect(page.locator("#visibility-container")).toBeVisible();

    // Check for key visibility elements
    await expect(page.locator("#visibility-container")).toContainText("Visibility Settings");
    await expect(page.locator("#visibility-container")).toContainText("Public Access");
    await expect(page.locator("#visibility-container")).toContainText("Access Scope");

    // Check if role hierarchy is displayed
    await expect(page.locator("#visibility-container")).toContainText("Admin");
    await expect(page.locator("#visibility-container")).toContainText("User");
    await expect(page.locator("#visibility-container")).toContainText("Guest");
  });

  test("should allow toggling public visibility", async () => {
    await page.setContent(`
      <div id="visibility-container"></div>
      <script type="module">
        import { render } from "solid-js/web";
        import { createSignal } from "solid-js";
        import { RoleBasedVisibility } from "/packages/ui/components-core/src/notes/RoleBasedVisibility.tsx";

        const [visibility, setVisibility] = createSignal({
          isPublic: false,
          scope: "own",
          allowedRoles: ["admin"],
          allowedUsers: []
        });

        const mockProps = {
          isPublic: visibility().isPublic,
          onPublicChange: (isPublic) => {
            setVisibility(prev => ({ ...prev, isPublic }));
            console.log("Public visibility changed to:", isPublic);
          },
          scope: visibility().scope,
          onScopeChange: (scope) => {
            setVisibility(prev => ({ ...prev, scope }));
          },
          roles: [
            {
              id: "admin",
              name: "Admin",
              level: 4,
              description: "Administrator role"
            }
          ],
          users: [],
          onSave: async () => true,
          onReset: () => {},
          noteId: "note-123"
        };

        render(() => (
          <RoleBasedVisibility {...mockProps} />
        ), document.getElementById("visibility-container"));
      </script>
    `);

    // Wait for the component to render
    await page.waitForTimeout(1000);

    // Find and click the public visibility checkbox
    const publicCheckbox = page.locator('input[type="checkbox"]').first();
    await expect(publicCheckbox).toBeVisible();

    // Click the checkbox
    await publicCheckbox.click();

    // Wait for the change to be applied
    await page.waitForTimeout(500);

    // Check that the checkbox is now checked
    await expect(publicCheckbox).toBeChecked();
  });

  test("should allow changing access scope", async () => {
    await page.setContent(`
      <div id="visibility-container"></div>
      <script type="module">
        import { render } from "solid-js/web";
        import { createSignal } from "solid-js";
        import { RoleBasedVisibility } from "/packages/ui/components-core/src/notes/RoleBasedVisibility.tsx";

        const [visibility, setVisibility] = createSignal({
          isPublic: false,
          scope: "own",
          allowedRoles: ["admin"],
          allowedUsers: []
        });

        const mockProps = {
          isPublic: visibility().isPublic,
          onPublicChange: (isPublic) => {
            setVisibility(prev => ({ ...prev, isPublic }));
          },
          scope: visibility().scope,
          onScopeChange: (scope) => {
            setVisibility(prev => ({ ...prev, scope }));
            console.log("Scope changed to:", scope);
          },
          roles: [
            {
              id: "admin",
              name: "Admin",
              level: 4,
              description: "Administrator role"
            }
          ],
          users: [],
          onSave: async () => true,
          onReset: () => {},
          noteId: "note-123"
        };

        render(() => (
          <RoleBasedVisibility {...mockProps} />
        ), document.getElementById("visibility-container"));
      </script>
    `);

    // Wait for the component to render
    await page.waitForTimeout(1000);

    // Find the scope select dropdown
    const scopeSelect = page.locator("select").first();
    await expect(scopeSelect).toBeVisible();

    // Change the scope from "own" to "team"
    await scopeSelect.selectOption("team");

    // Wait for the change to be applied
    await page.waitForTimeout(500);

    // Check that the scope was changed
    await expect(scopeSelect).toHaveValue("team");
  });

  test("should render PermissionManagement component", async () => {
    await page.setContent(`
      <div id="permission-container"></div>
      <script type="module">
        import { render } from "solid-js/web";
        import { createSignal } from "solid-js";
        import { PermissionManagement } from "/packages/ui/components-core/src/notes/PermissionManagement.tsx";

        const mockProps = {
          permissions: [
            {
              id: "perm-1",
              user: {
                id: "user-2",
                name: "John Doe",
                email: "john@example.com"
              },
              role: "admin",
              permissions: ["read", "write", "delete"],
              grantedAt: "2024-01-01T00:00:00Z",
              grantedBy: "system"
            },
            {
              id: "perm-2",
              user: {
                id: "user-3",
                name: "Jane Smith",
                email: "jane@example.com"
              },
              role: "user",
              permissions: ["read"],
              grantedAt: "2024-01-02T00:00:00Z",
              grantedBy: "user-1"
            }
          ],
          auditLog: [
            {
              id: "audit-1",
              action: "permission_granted",
              user: "John Doe",
              target: "Jane Smith",
              timestamp: "2024-01-02T00:00:00Z",
              details: "Granted read permission"
            },
            {
              id: "audit-2",
              action: "permission_revoked",
              user: "John Doe",
              target: "Bob Wilson",
              timestamp: "2024-01-01T00:00:00Z",
              details: "Revoked write permission"
            }
          ],
          onAddPermission: async (userId, role, permissions) => {
            console.log("Adding permission for user:", userId, "role:", role, "permissions:", permissions);
            return true;
          },
          onUpdatePermission: async (permissionId, updates) => {
            console.log("Updating permission:", permissionId, "updates:", updates);
            return true;
          },
          onRemovePermission: async (permissionId) => {
            console.log("Removing permission:", permissionId);
            return true;
          },
          onRefresh: async () => {
            console.log("Refreshing permissions");
          },
          noteId: "note-123"
        };

        render(() => (
          <PermissionManagement {...mockProps} />
        ), document.getElementById("permission-container"));
      </script>
    `);

    // Wait for the component to render
    await page.waitForTimeout(1000);

    // Check if the component is visible
    await expect(page.locator("#permission-container")).toBeVisible();

    // Check for key permission management elements
    await expect(page.locator("#permission-container")).toContainText("Permission Management");
    await expect(page.locator("#permission-container")).toContainText("Current Permissions");
    await expect(page.locator("#permission-container")).toContainText("Audit Log");

    // Check if existing permissions are displayed
    await expect(page.locator("#permission-container")).toContainText("John Doe");
    await expect(page.locator("#permission-container")).toContainText("Jane Smith");
    await expect(page.locator("#permission-container")).toContainText("admin");
    await expect(page.locator("#permission-container")).toContainText("user");
  });

  test("should allow adding new permissions", async () => {
    await page.setContent(`
      <div id="permission-container"></div>
      <script type="module">
        import { render } from "solid-js/web";
        import { createSignal } from "solid-js";
        import { PermissionManagement } from "/packages/ui/components-core/src/notes/PermissionManagement.tsx";

        const [permissions, setPermissions] = createSignal([]);
        const [addResult, setAddResult] = createSignal(null);

        const mockProps = {
          permissions: permissions(),
          auditLog: [],
          onAddPermission: async (userId, role, permissions) => {
            setAddResult({ userId, role, permissions });
            console.log("Adding permission for user:", userId, "role:", role, "permissions:", permissions);
            return true;
          },
          onUpdatePermission: async (permissionId, updates) => {
            console.log("Updating permission:", permissionId, "updates:", updates);
            return true;
          },
          onRemovePermission: async (permissionId) => {
            console.log("Removing permission:", permissionId);
            return true;
          },
          onRefresh: async () => {
            console.log("Refreshing permissions");
          },
          noteId: "note-123"
        };

        render(() => (
          <PermissionManagement {...mockProps} />
        ), document.getElementById("permission-container"));
      </script>
    `);

    // Wait for the component to render
    await page.waitForTimeout(1000);

    // Check if the add permission section is visible
    await expect(page.locator("#permission-container")).toContainText("Add New Permission");

    // Look for add permission button
    const addButton = page.locator('button:has-text("Add Permission")');
    await expect(addButton).toBeVisible();

    // Click the add button
    await addButton.click();

    // Wait for the add form to appear
    await page.waitForTimeout(500);

    // Check if the add form is visible
    await expect(page.locator("#permission-container")).toContainText("Add New Permission");
  });

  test("should display permission audit log", async () => {
    await page.setContent(`
      <div id="permission-container"></div>
      <script type="module">
        import { render } from "solid-js/web";
        import { createSignal } from "solid-js";
        import { PermissionManagement } from "/packages/ui/components-core/src/notes/PermissionManagement.tsx";

        const mockProps = {
          permissions: [],
          auditLog: [
            {
              id: "audit-1",
              action: "permission_granted",
              user: "John Doe",
              target: "Jane Smith",
              timestamp: "2024-01-02T00:00:00Z",
              details: "Granted read permission"
            },
            {
              id: "audit-2",
              action: "permission_revoked",
              user: "John Doe",
              target: "Bob Wilson",
              timestamp: "2024-01-01T00:00:00Z",
              details: "Revoked write permission"
            },
            {
              id: "audit-3",
              action: "permission_updated",
              user: "Admin User",
              target: "Alice Johnson",
              timestamp: "2024-01-03T00:00:00Z",
              details: "Updated permission from viewer to editor"
            }
          ],
          onAddPermission: async () => true,
          onUpdatePermission: async () => true,
          onRemovePermission: async () => true,
          onRefresh: async () => {},
          noteId: "note-123"
        };

        render(() => (
          <PermissionManagement {...mockProps} />
        ), document.getElementById("permission-container"));
      </script>
    `);

    // Wait for the component to render
    await page.waitForTimeout(1000);

    // Check if audit log is displayed
    await expect(page.locator("#permission-container")).toContainText("Audit Log");

    // Check if audit entries are displayed
    await expect(page.locator("#permission-container")).toContainText("permission_granted");
    await expect(page.locator("#permission-container")).toContainText("permission_revoked");
    await expect(page.locator("#permission-container")).toContainText("permission_updated");

    // Check if audit details are displayed
    await expect(page.locator("#permission-container")).toContainText("Granted read permission");
    await expect(page.locator("#permission-container")).toContainText("Revoked write permission");
    await expect(page.locator("#permission-container")).toContainText("Updated permission from viewer to editor");

    // Check if timestamps are displayed
    await expect(page.locator("#permission-container")).toContainText("2024-01-02");
    await expect(page.locator("#permission-container")).toContainText("2024-01-01");
    await expect(page.locator("#permission-container")).toContainText("2024-01-03");
  });

  test("should handle permission management without manage permissions", async () => {
    await page.setContent(`
      <div id="permission-container"></div>
      <script type="module">
        import { render } from "solid-js/web";
        import { createSignal } from "solid-js";
        import { PermissionManagement } from "/packages/ui/components-core/src/notes/PermissionManagement.tsx";

        const mockProps = {
          permissions: [
            {
              id: "perm-1",
              user: {
                id: "user-2",
                name: "John Doe",
                email: "john@example.com"
              },
              role: "admin",
              permissions: ["read", "write", "delete"],
              grantedAt: "2024-01-01T00:00:00Z",
              grantedBy: "system"
            }
          ],
          auditLog: [],
          onAddPermission: async () => true,
          onUpdatePermission: async () => true,
          onRemovePermission: async () => true,
          onRefresh: async () => {},
          noteId: "note-123",
          canManagePermissions: false
        };

        render(() => (
          <PermissionManagement {...mockProps} />
        ), document.getElementById("permission-container"));
      </script>
    `);

    // Wait for the component to render
    await page.waitForTimeout(1000);

    // Should show permissions but without management controls
    await expect(page.locator("#permission-container")).toContainText("John Doe");
    await expect(page.locator("#permission-container")).toContainText("admin");

    // Should not show add permission section
    await expect(page.locator("#permission-container")).not.toContainText("Add New Permission");
  });

  test("should handle visibility management without modify permissions", async () => {
    await page.setContent(`
      <div id="visibility-container"></div>
      <script type="module">
        import { render } from "solid-js/web";
        import { createSignal } from "solid-js";
        import { RoleBasedVisibility } from "/packages/ui/components-core/src/notes/RoleBasedVisibility.tsx";

        const [visibility, setVisibility] = createSignal({
          isPublic: false,
          scope: "own",
          allowedRoles: ["admin"],
          allowedUsers: []
        });

        const mockProps = {
          isPublic: visibility().isPublic,
          onPublicChange: (isPublic) => {
            setVisibility(prev => ({ ...prev, isPublic }));
          },
          scope: visibility().scope,
          onScopeChange: (scope) => {
            setVisibility(prev => ({ ...prev, scope }));
          },
          roles: [
            {
              id: "admin",
              name: "Admin",
              level: 4,
              description: "Administrator role"
            }
          ],
          users: [],
          onSave: async () => true,
          onReset: () => {},
          noteId: "note-123",
          canModifyVisibility: false
        };

        render(() => (
          <RoleBasedVisibility {...mockProps} />
        ), document.getElementById("visibility-container"));
      </script>
    `);

    // Wait for the component to render
    await page.waitForTimeout(1000);

    // Should show visibility controls but they should be disabled
    await expect(page.locator("#visibility-container")).toContainText("Visibility Settings");

    // Checkbox should be disabled
    const publicCheckbox = page.locator('input[type="checkbox"]').first();
    await expect(publicCheckbox).toBeDisabled();

    // Select should be disabled
    const scopeSelect = page.locator("select").first();
    await expect(scopeSelect).toBeDisabled();
  });

  test("should handle component interactions and state changes", async () => {
    await page.setContent(`
      <div id="test-container">
        <div id="modal-container"></div>
        <div id="visibility-container"></div>
        <div id="permission-container"></div>
      </div>
      <script type="module">
        import { render } from "solid-js/web";
        import { createSignal } from "solid-js";
        import { NoteSharingModal } from "/packages/ui/components-core/src/notes/NoteSharingModal.tsx";
        import { RoleBasedVisibility } from "/packages/ui/components-core/src/notes/RoleBasedVisibility.tsx";
        import { PermissionManagement } from "/packages/ui/components-core/src/notes/PermissionManagement.tsx";

        const [modalOpen, setModalOpen] = createSignal(true);
        const [visibility, setVisibility] = createSignal({
          isPublic: false,
          scope: "own",
          allowedRoles: ["admin"],
          allowedUsers: []
        });

        // NoteSharingModal props
        const modalProps = {
          isOpen: modalOpen(),
          onClose: () => setModalOpen(false),
          noteId: "note-123",
          currentUserId: "user-1",
          availableUsers: [
            {
              id: "user-2",
              username: "john_doe",
              displayName: "John Doe",
              email: "john@example.com"
            }
          ],
          collaborators: [],
          onShareNote: async () => true,
          onRevokeAccess: async () => true,
          onUpdatePermission: async () => true
        };

        // RoleBasedVisibility props
        const visibilityProps = {
          isPublic: visibility().isPublic,
          onPublicChange: (isPublic) => {
            setVisibility(prev => ({ ...prev, isPublic }));
          },
          scope: visibility().scope,
          onScopeChange: (scope) => {
            setVisibility(prev => ({ ...prev, scope }));
          },
          roles: [
            {
              id: "admin",
              name: "Admin",
              level: 4,
              description: "Administrator role"
            }
          ],
          users: [],
          onSave: async () => true,
          onReset: () => {},
          noteId: "note-123"
        };

        // PermissionManagement props
        const permissionProps = {
          permissions: [],
          auditLog: [],
          onAddPermission: async () => true,
          onUpdatePermission: async () => true,
          onRemovePermission: async () => true,
          onRefresh: async () => {},
          noteId: "note-123"
        };

        // Render all components
        render(() => (
          <NoteSharingModal {...modalProps} />
        ), document.getElementById("modal-container"));

        render(() => (
          <RoleBasedVisibility {...visibilityProps} />
        ), document.getElementById("visibility-container"));

        render(() => (
          <PermissionManagement {...permissionProps} />
        ), document.getElementById("permission-container"));
      </script>
    `);

    // Wait for all components to render
    await page.waitForTimeout(1000);

    // Verify all components are rendered
    await expect(page.locator("#modal-container")).toBeVisible();
    await expect(page.locator("#visibility-container")).toBeVisible();
    await expect(page.locator("#permission-container")).toBeVisible();

    // Test modal close functionality
    const closeButton = page.locator('button:has-text("Cancel"), button:has-text("Close")').first();
    if (await closeButton.isVisible()) {
      await closeButton.click();
      await page.waitForTimeout(500);
    }

    // Test visibility toggle
    const publicCheckbox = page.locator('input[type="checkbox"]').first();
    if (await publicCheckbox.isVisible()) {
      await publicCheckbox.click();
      await page.waitForTimeout(500);
      await expect(publicCheckbox).toBeChecked();
    }

    // Test scope change
    const scopeSelect = page.locator("select").first();
    if (await scopeSelect.isVisible()) {
      await scopeSelect.selectOption("team");
      await page.waitForTimeout(500);
      await expect(scopeSelect).toHaveValue("team");
    }
  });
});

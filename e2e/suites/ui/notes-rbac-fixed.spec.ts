/**
 * Fixed Notes RBAC E2E Test Suite
 *
 * End-to-end tests for the RBAC-enabled notes system with proper
 * Portal handling, CSS loading, and component mocking.
 */

import { test, expect, Page } from "@playwright/test";
import { createTestPage } from "../../modules/dom";

test.describe("Notes RBAC Fixed E2E Tests", () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await createTestPage(page, { path: "/e2e/fixtures/dom-test-page.html" });
  });

  test.afterEach(async () => {
    await page.close();
  });

  test("should render NoteSharingModal with proper Portal handling", async () => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>RBAC Component Test</title>
          <style>
            /* Basic CSS variables for components */
            :root {
              --reynard-spacing-xs: 0.25rem;
              --reynard-spacing-sm: 0.5rem;
              --reynard-spacing-md: 1rem;
              --reynard-spacing-lg: 1.5rem;
              --reynard-spacing-xl: 2rem;
              --reynard-size-sm: 2rem;
              --reynard-size-md: 2.5rem;
              --reynard-size-lg: 3rem;
              --reynard-radius-sm: 4px;
              --reynard-radius-md: 6px;
              --reynard-radius-lg: 8px;
              --reynard-radius-xl: 12px;
              --reynard-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
              --reynard-shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
              --reynard-shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
              --reynard-shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15);
              --reynard-font-size-sm: 0.875rem;
              --reynard-font-size-md: 1rem;
              --reynard-font-size-lg: 1.125rem;
              --reynard-font-weight-normal: 400;
              --reynard-font-weight-medium: 500;
              --reynard-font-weight-semibold: 600;
              --reynard-z-modal: 1000;
              --overlay-bg: rgba(0, 0, 0, 0.5);
              --overlay-backdrop: blur(4px);
              --card-bg: white;
              --border-color: #e5e7eb;
              --text-primary: #111827;
            }

            /* Modal styles */
            .reynard-modal {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              z-index: var(--reynard-z-modal);
              display: flex;
              align-items: center;
              justify-content: center;
              padding: var(--reynard-spacing-md);
            }

            .reynard-modal__backdrop {
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background-color: var(--overlay-bg);
              display: flex;
              align-items: center;
              justify-content: center;
              padding: var(--reynard-spacing-md);
            }

            .reynard-modal__content {
              background-color: var(--card-bg);
              border-radius: var(--reynard-radius-lg);
              box-shadow: var(--reynard-shadow-xl);
              display: flex;
              flex-direction: column;
              max-height: 90vh;
              overflow: hidden;
              position: relative;
              width: 100%;
              max-width: 500px;
            }

            .reynard-modal__header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: var(--reynard-spacing-lg);
              border-bottom: 1px solid var(--border-color);
            }

            .reynard-modal__title {
              margin: 0;
              font-size: var(--reynard-font-size-lg);
              font-weight: var(--reynard-font-weight-semibold);
              color: var(--text-primary);
            }

            .reynard-modal__body {
              flex: 1;
              padding: var(--reynard-spacing-lg);
              overflow-y: auto;
            }

            /* Button styles */
            .reynard-button {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              border-radius: var(--reynard-radius-md);
              font-size: var(--reynard-font-size-sm);
              font-weight: var(--reynard-font-weight-medium);
              padding: var(--reynard-spacing-sm) var(--reynard-spacing-md);
              border: 1px solid transparent;
              cursor: pointer;
              transition: all 0.2s;
            }

            .reynard-button--primary {
              background-color: #3b82f6;
              color: white;
            }

            .reynard-button--ghost {
              background-color: transparent;
              color: var(--text-primary);
            }

            .reynard-button:hover {
              opacity: 0.9;
            }

            /* Form styles */
            .reynard-form-group {
              margin-bottom: var(--reynard-spacing-md);
            }

            .reynard-label {
              display: block;
              margin-bottom: var(--reynard-spacing-xs);
              font-size: var(--reynard-font-size-sm);
              font-weight: var(--reynard-font-weight-medium);
              color: var(--text-primary);
            }

            .reynard-select {
              width: 100%;
              padding: var(--reynard-spacing-sm);
              border: 1px solid var(--border-color);
              border-radius: var(--reynard-radius-md);
              font-size: var(--reynard-font-size-sm);
            }

            /* Test container */
            #test-container {
              min-height: 100vh;
              padding: var(--reynard-spacing-lg);
            }
          </style>
        </head>
        <body>
          <div id="test-container">
            <div id="modal-container"></div>
          </div>
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
                  permissionLevel: "viewer"
                }
              ],
              onShareNote: async (userId, permissionLevel) => {
                console.log("Sharing note with user:", userId, "permission:", permissionLevel);
                return true;
              },
              onRevokeAccess: async (userId, username) => {
                console.log("Revoking access for user:", userId, username);
                return true;
              },
              onUpdatePermission: async (userId, permissionLevel, username) => {
                console.log("Updating permission for user:", userId, "to:", permissionLevel);
                return true;
              }
            };

            render(() => (
              <NoteSharingModal {...mockProps} />
            ), document.getElementById("modal-container"));
          </script>
        </body>
      </html>
    `);

    // Wait for the component to render
    await page.waitForTimeout(2000);

    // Check if the modal is rendered in the document (not in the container due to Portal)
    const modal = page.locator(".reynard-modal");
    await expect(modal).toBeVisible();

    // Check for key modal elements
    await expect(modal).toContainText("Share Note");
    await expect(modal).toContainText("Add Collaborators");
    await expect(modal).toContainText("Current Collaborators");

    // Check if existing collaborator is displayed
    await expect(modal).toContainText("John Doe");
    await expect(modal).toContainText("john@example.com");
  });

  test("should render RoleBasedVisibility component", async () => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>RBAC Component Test</title>
          <style>
            /* Basic CSS variables for components */
            :root {
              --reynard-spacing-xs: 0.25rem;
              --reynard-spacing-sm: 0.5rem;
              --reynard-spacing-md: 1rem;
              --reynard-spacing-lg: 1.5rem;
              --reynard-spacing-xl: 2rem;
              --reynard-radius-sm: 4px;
              --reynard-radius-md: 6px;
              --reynard-radius-lg: 8px;
              --reynard-font-size-sm: 0.875rem;
              --reynard-font-size-md: 1rem;
              --reynard-font-size-lg: 1.125rem;
              --reynard-font-weight-normal: 400;
              --reynard-font-weight-medium: 500;
              --reynard-font-weight-semibold: 600;
              --card-bg: white;
              --border-color: #e5e7eb;
              --text-primary: #111827;
            }

            /* Card styles */
            .reynard-card {
              background-color: var(--card-bg);
              border: 1px solid var(--border-color);
              border-radius: var(--reynard-radius-lg);
              padding: var(--reynard-spacing-lg);
              margin-bottom: var(--reynard-spacing-md);
            }

            .reynard-card__title {
              margin: 0 0 var(--reynard-spacing-md) 0;
              font-size: var(--reynard-font-size-lg);
              font-weight: var(--reynard-font-weight-semibold);
              color: var(--text-primary);
            }

            /* Form styles */
            .reynard-form-group {
              margin-bottom: var(--reynard-spacing-md);
            }

            .reynard-label {
              display: block;
              margin-bottom: var(--reynard-spacing-xs);
              font-size: var(--reynard-font-size-sm);
              font-weight: var(--reynard-font-weight-medium);
              color: var(--text-primary);
            }

            .reynard-checkbox {
              margin-right: var(--reynard-spacing-sm);
            }

            .reynard-select {
              width: 100%;
              padding: var(--reynard-spacing-sm);
              border: 1px solid var(--border-color);
              border-radius: var(--reynard-radius-md);
              font-size: var(--reynard-font-size-sm);
            }

            /* Button styles */
            .reynard-button {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              border-radius: var(--reynard-radius-md);
              font-size: var(--reynard-font-size-sm);
              font-weight: var(--reynard-font-weight-medium);
              padding: var(--reynard-spacing-sm) var(--reynard-spacing-md);
              border: 1px solid transparent;
              cursor: pointer;
              transition: all 0.2s;
              background-color: #3b82f6;
              color: white;
            }

            .reynard-button:hover {
              opacity: 0.9;
            }

            /* Test container */
            #test-container {
              min-height: 100vh;
              padding: var(--reynard-spacing-lg);
            }
          </style>
        </head>
        <body>
          <div id="test-container">
            <div id="visibility-container"></div>
          </div>
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
        </body>
      </html>
    `);

    // Wait for the component to render
    await page.waitForTimeout(2000);

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

  test("should render PermissionManagement component", async () => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>RBAC Component Test</title>
          <style>
            /* Basic CSS variables for components */
            :root {
              --reynard-spacing-xs: 0.25rem;
              --reynard-spacing-sm: 0.5rem;
              --reynard-spacing-md: 1rem;
              --reynard-spacing-lg: 1.5rem;
              --reynard-spacing-xl: 2rem;
              --reynard-radius-sm: 4px;
              --reynard-radius-md: 6px;
              --reynard-radius-lg: 8px;
              --reynard-font-size-sm: 0.875rem;
              --reynard-font-size-md: 1rem;
              --reynard-font-size-lg: 1.125rem;
              --reynard-font-weight-normal: 400;
              --reynard-font-weight-medium: 500;
              --reynard-font-weight-semibold: 600;
              --card-bg: white;
              --border-color: #e5e7eb;
              --text-primary: #111827;
            }

            /* Card styles */
            .reynard-card {
              background-color: var(--card-bg);
              border: 1px solid var(--border-color);
              border-radius: var(--reynard-radius-lg);
              padding: var(--reynard-spacing-lg);
              margin-bottom: var(--reynard-spacing-md);
            }

            .reynard-card__title {
              margin: 0 0 var(--reynard-spacing-md) 0;
              font-size: var(--reynard-font-size-lg);
              font-weight: var(--reynard-font-weight-semibold);
              color: var(--text-primary);
            }

            /* Form styles */
            .reynard-form-group {
              margin-bottom: var(--reynard-spacing-md);
            }

            .reynard-label {
              display: block;
              margin-bottom: var(--reynard-spacing-xs);
              font-size: var(--reynard-font-size-sm);
              font-weight: var(--reynard-font-weight-medium);
              color: var(--text-primary);
            }

            .reynard-select {
              width: 100%;
              padding: var(--reynard-spacing-sm);
              border: 1px solid var(--border-color);
              border-radius: var(--reynard-radius-md);
              font-size: var(--reynard-font-size-sm);
            }

            /* Button styles */
            .reynard-button {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              border-radius: var(--reynard-radius-md);
              font-size: var(--reynard-font-size-sm);
              font-weight: var(--reynard-font-weight-medium);
              padding: var(--reynard-spacing-sm) var(--reynard-spacing-md);
              border: 1px solid transparent;
              cursor: pointer;
              transition: all 0.2s;
              background-color: #3b82f6;
              color: white;
            }

            .reynard-button:hover {
              opacity: 0.9;
            }

            /* Test container */
            #test-container {
              min-height: 100vh;
              padding: var(--reynard-spacing-lg);
            }
          </style>
        </head>
        <body>
          <div id="test-container">
            <div id="permission-container"></div>
          </div>
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
        </body>
      </html>
    `);

    // Wait for the component to render
    await page.waitForTimeout(2000);

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

  test("should handle component interactions with proper event handling", async () => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>RBAC Component Test</title>
          <style>
            /* Basic CSS variables for components */
            :root {
              --reynard-spacing-xs: 0.25rem;
              --reynard-spacing-sm: 0.5rem;
              --reynard-spacing-md: 1rem;
              --reynard-spacing-lg: 1.5rem;
              --reynard-spacing-xl: 2rem;
              --reynard-radius-sm: 4px;
              --reynard-radius-md: 6px;
              --reynard-radius-lg: 8px;
              --reynard-font-size-sm: 0.875rem;
              --reynard-font-size-md: 1rem;
              --reynard-font-size-lg: 1.125rem;
              --reynard-font-weight-normal: 400;
              --reynard-font-weight-medium: 500;
              --reynard-font-weight-semibold: 600;
              --card-bg: white;
              --border-color: #e5e7eb;
              --text-primary: #111827;
            }

            /* Modal styles */
            .reynard-modal {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              z-index: 1000;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: var(--reynard-spacing-md);
            }

            .reynard-modal__backdrop {
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background-color: rgba(0, 0, 0, 0.5);
              display: flex;
              align-items: center;
              justify-content: center;
              padding: var(--reynard-spacing-md);
            }

            .reynard-modal__content {
              background-color: var(--card-bg);
              border-radius: var(--reynard-radius-lg);
              box-shadow: 0 20px 25px rgba(0, 0, 0, 0.15);
              display: flex;
              flex-direction: column;
              max-height: 90vh;
              overflow: hidden;
              position: relative;
              width: 100%;
              max-width: 500px;
            }

            .reynard-modal__header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: var(--reynard-spacing-lg);
              border-bottom: 1px solid var(--border-color);
            }

            .reynard-modal__title {
              margin: 0;
              font-size: var(--reynard-font-size-lg);
              font-weight: var(--reynard-font-weight-semibold);
              color: var(--text-primary);
            }

            .reynard-modal__body {
              flex: 1;
              padding: var(--reynard-spacing-lg);
              overflow-y: auto;
            }

            /* Button styles */
            .reynard-button {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              border-radius: var(--reynard-radius-md);
              font-size: var(--reynard-font-size-sm);
              font-weight: var(--reynard-font-weight-medium);
              padding: var(--reynard-spacing-sm) var(--reynard-spacing-md);
              border: 1px solid transparent;
              cursor: pointer;
              transition: all 0.2s;
            }

            .reynard-button--primary {
              background-color: #3b82f6;
              color: white;
            }

            .reynard-button--ghost {
              background-color: transparent;
              color: var(--text-primary);
            }

            .reynard-button:hover {
              opacity: 0.9;
            }

            /* Form styles */
            .reynard-form-group {
              margin-bottom: var(--reynard-spacing-md);
            }

            .reynard-label {
              display: block;
              margin-bottom: var(--reynard-spacing-xs);
              font-size: var(--reynard-font-size-sm);
              font-weight: var(--reynard-font-weight-medium);
              color: var(--text-primary);
            }

            .reynard-select {
              width: 100%;
              padding: var(--reynard-spacing-sm);
              border: 1px solid var(--border-color);
              border-radius: var(--reynard-radius-md);
              font-size: var(--reynard-font-size-sm);
            }

            /* Test container */
            #test-container {
              min-height: 100vh;
              padding: var(--reynard-spacing-lg);
            }
          </style>
        </head>
        <body>
          <div id="test-container">
            <div id="modal-container"></div>
          </div>
          <script type="module">
            import { render } from "solid-js/web";
            import { createSignal } from "solid-js";
            import { NoteSharingModal } from "/packages/ui/components-core/src/notes/NoteSharingModal.tsx";

            const [isOpen, setIsOpen] = createSignal(true);
            const [interactionLog, setInteractionLog] = createSignal([]);

            const mockProps = {
              isOpen: isOpen(),
              onClose: () => {
                setIsOpen(false);
                setInteractionLog(prev => [...prev, "Modal closed"]);
              },
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
              onShareNote: async (userId, permissionLevel) => {
                setInteractionLog(prev => [...prev, \`Shared with \${userId} as \${permissionLevel}\`]);
                console.log("Sharing note with user:", userId, "permission:", permissionLevel);
                return true;
              },
              onRevokeAccess: async (userId, username) => {
                setInteractionLog(prev => [...prev, \`Revoked access for \${username}\`]);
                console.log("Revoking access for user:", userId, username);
                return true;
              },
              onUpdatePermission: async (userId, permissionLevel, username) => {
                setInteractionLog(prev => [...prev, \`Updated \${username} to \${permissionLevel}\`]);
                console.log("Updating permission for user:", userId, "to:", permissionLevel);
                return true;
              }
            };

            render(() => (
              <NoteSharingModal {...mockProps} />
            ), document.getElementById("modal-container"));

            // Expose interaction log to window for testing
            window.interactionLog = interactionLog;
          </script>
        </body>
      </html>
    `);

    // Wait for the component to render
    await page.waitForTimeout(2000);

    // Verify the modal is rendered
    const modal = page.locator(".reynard-modal");
    await expect(modal).toBeVisible();

    // Test basic interactions
    const buttons = await page.locator("button").count();
    expect(buttons).toBeGreaterThan(0);

    const inputs = await page.locator("input, select").count();
    expect(inputs).toBeGreaterThan(0);

    // Test that the component is interactive
    const closeButton = page.locator('button[aria-label="Close modal"]');
    if (await closeButton.isVisible()) {
      await closeButton.click();
      await page.waitForTimeout(500);

      // Check that the modal was closed
      await expect(modal).not.toBeVisible();
    }
  });
});

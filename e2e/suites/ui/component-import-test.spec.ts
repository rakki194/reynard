/**
 * Component Import Test
 *
 * Simple test to verify that components can be imported and basic functionality works
 */

import { test, expect, Page } from "@playwright/test";

test.describe("Component Import Tests", () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.afterEach(async () => {
    await page.close();
  });

  test("should be able to import and render basic SolidJS component", async () => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Component Import Test</title>
        </head>
        <body>
          <div id="test-container"></div>
          <script type="module">
            import { render } from "solid-js/web";
            import { createSignal } from "solid-js";

            const [count, setCount] = createSignal(0);

            const TestComponent = () => {
              return (
                <div>
                  <h1>Test Component</h1>
                  <p>Count: {count()}</p>
                  <button onclick={() => setCount(count() + 1)}>Increment</button>
                </div>
              );
            };

            render(() => <TestComponent />, document.getElementById("test-container"));
          </script>
        </body>
      </html>
    `);

    // Wait for the component to render
    await page.waitForTimeout(1000);

    // Check if the component is visible
    await expect(page.locator("#test-container")).toBeVisible();
    await expect(page.locator("#test-container")).toContainText("Test Component");
    await expect(page.locator("#test-container")).toContainText("Count: 0");

    // Test interaction
    await page.locator("button").click();
    await expect(page.locator("#test-container")).toContainText("Count: 1");
  });

  test("should be able to import NoteSharingModal component", async () => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Component Import Test</title>
        </head>
        <body>
          <div id="test-container"></div>
          <script type="module">
            import { render } from "solid-js/web";
            import { createSignal } from "solid-js";

            try {
              const { NoteSharingModal } = await import("/packages/ui/components-core/src/notes/NoteSharingModal.tsx");
              
              const [isOpen, setIsOpen] = createSignal(true);

              const mockProps = {
                isOpen: isOpen(),
                onClose: () => setIsOpen(false),
                noteId: "note-123",
                currentUserId: "user-1",
                availableUsers: [],
                collaborators: [],
                onShareNote: async () => true,
                onRevokeAccess: async () => true,
                onUpdatePermission: async () => true
              };

              render(() => <NoteSharingModal {...mockProps} />, document.getElementById("test-container"));
              
              // Set a flag to indicate successful import
              window.componentImported = true;
            } catch (error) {
              console.error("Import error:", error);
              window.importError = error.message;
            }
          </script>
        </body>
      </html>
    `);

    // Wait for the component to render
    await page.waitForTimeout(2000);

    // Check if the component was imported successfully
    const importSuccess = await page.evaluate(() => window.componentImported);
    const importError = await page.evaluate(() => window.importError);

    if (importError) {
      console.log("Import error:", importError);
    }

    // The component should be imported successfully
    expect(importSuccess).toBe(true);
  });

  test("should be able to import RoleBasedVisibility component", async () => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Component Import Test</title>
        </head>
        <body>
          <div id="test-container"></div>
          <script type="module">
            import { render } from "solid-js/web";
            import { createSignal } from "solid-js";

            try {
              const { RoleBasedVisibility } = await import("/packages/ui/components-core/src/notes/RoleBasedVisibility.tsx");
              
              const [visibility, setVisibility] = createSignal({
                isPublic: false,
                scope: "own",
                allowedRoles: ["admin"],
                allowedUsers: []
              });

              const mockProps = {
                isPublic: visibility().isPublic,
                onPublicChange: (isPublic) => setVisibility(prev => ({ ...prev, isPublic })),
                scope: visibility().scope,
                onScopeChange: (scope) => setVisibility(prev => ({ ...prev, scope })),
                roles: [],
                users: [],
                onSave: async () => true,
                onReset: () => {},
                noteId: "note-123"
              };

              render(() => <RoleBasedVisibility {...mockProps} />, document.getElementById("test-container"));
              
              // Set a flag to indicate successful import
              window.componentImported = true;
            } catch (error) {
              console.error("Import error:", error);
              window.importError = error.message;
            }
          </script>
        </body>
      </html>
    `);

    // Wait for the component to render
    await page.waitForTimeout(2000);

    // Check if the component was imported successfully
    const importSuccess = await page.evaluate(() => window.componentImported);
    const importError = await page.evaluate(() => window.importError);

    if (importError) {
      console.log("Import error:", importError);
    }

    // The component should be imported successfully
    expect(importSuccess).toBe(true);
  });

  test("should be able to import PermissionManagement component", async () => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Component Import Test</title>
        </head>
        <body>
          <div id="test-container"></div>
          <script type="module">
            import { render } from "solid-js/web";
            import { createSignal } from "solid-js";

            try {
              const { PermissionManagement } = await import("/packages/ui/components-core/src/notes/PermissionManagement.tsx");
              
              const mockProps = {
                permissions: [],
                auditLog: [],
                onAddPermission: async () => true,
                onUpdatePermission: async () => true,
                onRemovePermission: async () => true,
                onRefresh: async () => {},
                noteId: "note-123"
              };

              render(() => <PermissionManagement {...mockProps} />, document.getElementById("test-container"));
              
              // Set a flag to indicate successful import
              window.componentImported = true;
            } catch (error) {
              console.error("Import error:", error);
              window.importError = error.message;
            }
          </script>
        </body>
      </html>
    `);

    // Wait for the component to render
    await page.waitForTimeout(2000);

    // Check if the component was imported successfully
    const importSuccess = await page.evaluate(() => window.componentImported);
    const importError = await page.evaluate(() => window.importError);

    if (importError) {
      console.log("Import error:", importError);
    }

    // The component should be imported successfully
    expect(importSuccess).toBe(true);
  });
});

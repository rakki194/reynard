/**
 * Auto-generated documentation tests for reynard-core
 *
 * This file contains tests extracted from the documentation examples.
 * Run with: npm run test:docs
 */

/** @jsxImportSource solid-js */
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, cleanup } from "@solidjs/testing-library";
// For now, we'll use a simple approach without the complex doc-tests system
// import { runDocTests } from 'reynard-testing/doc-tests';

// Custom assertion helper since we can't import from reynard-testing yet
function expectElementToBeInTheDocument(element: Element | null) {
  expect(element).toBeTruthy();
  expect(element).toBeInTheDocument();
}

// Package-specific setup
import {
  NotificationsProvider,
  createNotificationsModule,
  useNotifications,
  isValidEmail,
} from "reynard-core";

// Simple documentation test example
describe("Documentation Examples", () => {
  beforeEach(() => {
    cleanup();
  });

  it("should render notifications demo component from documentation", () => {
    const notificationsModule = createNotificationsModule();

    function NotificationsDemo() {
      const { notify } = useNotifications();

      return (
        <div data-testid="notifications-demo">
          <button
            data-testid="notification-button"
            onClick={() => notify("Test notification", "success")}
          >
            Show Notification
          </button>
        </div>
      );
    }

    function TestableApp() {
      return (
        <NotificationsProvider value={notificationsModule}>
          <NotificationsDemo />
        </NotificationsProvider>
      );
    }

    render(() => <TestableApp />);

    expectElementToBeInTheDocument(screen.getByTestId("notifications-demo"));
    expectElementToBeInTheDocument(screen.getByTestId("notification-button"));
  });

  it("should execute utility examples from documentation", () => {
    // Test that utility functions work as documented
    expect(isValidEmail("user@example.com")).toBe(true);
    expect(isValidEmail("invalid-email")).toBe(false);
  });
});

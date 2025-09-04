/**
 * Tests for useNotifications composable
 */

import { describe, it, expect } from "vitest";
import { createNotifications, NotificationsProvider } from "./useNotifications";

describe("useNotifications Composable", () => {
  describe("createNotifications", () => {
    it("should create a notifications module instance", () => {
      const notificationsModule = createNotifications();

      expect(notificationsModule).toBeDefined();
      expect(Array.isArray(notificationsModule.notifications)).toBe(true);
      expect(typeof notificationsModule.notify).toBe("function");
      expect(typeof notificationsModule.clearNotifications).toBe("function");
    });

    it("should create notifications module with empty notifications", () => {
      const notificationsModule = createNotifications();
      expect(notificationsModule.notifications.length).toBe(0);
    });

    it("should have all required methods", () => {
      const notificationsModule = createNotifications();

      expect(notificationsModule.notifications).toBeDefined();
      expect(notificationsModule.notify).toBeDefined();
      expect(notificationsModule.createNotification).toBeDefined();
      expect(notificationsModule.removeNotification).toBeDefined();
      expect(notificationsModule.clearNotifications).toBeDefined();
    });

    it("should allow adding notifications", () => {
      const notificationsModule = createNotifications();

      notificationsModule.notify("Test notification");
      expect(notificationsModule.notifications.length).toBe(1);
      expect(notificationsModule.notifications[0].message).toBe(
        "Test notification",
      );
    });

    it("should allow clearing notifications", () => {
      const notificationsModule = createNotifications();

      // Add a notification first
      notificationsModule.notify("Test notification");
      expect(notificationsModule.notifications.length).toBe(1);

      // Clear notifications
      notificationsModule.clearNotifications();
      expect(notificationsModule.notifications.length).toBe(0);
    });

    it("should allow removing specific notifications", () => {
      const notificationsModule = createNotifications();

      notificationsModule.notify("Test notification 1");
      notificationsModule.notify("Test notification 2");
      expect(notificationsModule.notifications.length).toBe(2);

      const firstNotification = notificationsModule.notifications[0];
      notificationsModule.removeNotification(firstNotification.id);
      expect(notificationsModule.notifications.length).toBe(1);
    });
  });

  describe("NotificationsProvider", () => {
    it("should be defined", () => {
      expect(NotificationsProvider).toBeDefined();
    });
  });
});

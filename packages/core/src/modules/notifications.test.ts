/**
 * Notifications module tests
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { createNotificationsModule } from "./notifications";

describe("Notifications Module", () => {
  beforeEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("createNotificationsModule", () => {
    it("should create notifications module with empty state", () => {
      const notificationsModule = createNotificationsModule();

      expect(notificationsModule.notifications).toEqual([]);
      expect(typeof notificationsModule.notify).toBe("function");
      expect(typeof notificationsModule.createNotification).toBe("function");
      expect(typeof notificationsModule.removeNotification).toBe("function");
      expect(typeof notificationsModule.clearNotifications).toBe("function");
    });

    it("should add notification with notify method", () => {
      const notificationsModule = createNotificationsModule();

      const id = notificationsModule.notify("Test message", "success");

      expect(notificationsModule.notifications).toHaveLength(1);
      expect(notificationsModule.notifications[0]).toMatchObject({
        id,
        message: "Test message",
        type: "success",
        icon: "success",
      });
    });

    it("should add notification with default type and duration", () => {
      const notificationsModule = createNotificationsModule();

      notificationsModule.notify("Default message");

      expect(notificationsModule.notifications[0]).toMatchObject({
        message: "Default message",
        type: "info",
        icon: "info",
        duration: 5000,
      });
    });

    it("should replace grouped notifications", () => {
      const notificationsModule = createNotificationsModule();

      notificationsModule.notify("First message", "info", {
        group: "test-group",
      });
      notificationsModule.notify("Second message", "info", {
        group: "test-group",
      });

      expect(notificationsModule.notifications).toHaveLength(1);
      expect(notificationsModule.notifications[0].message).toBe(
        "Second message",
      );
    });

    it("should auto-dismiss notifications with duration", () => {
      const notificationsModule = createNotificationsModule();

      notificationsModule.notify("Auto dismiss", "success");
      expect(notificationsModule.notifications).toHaveLength(1);

      // Fast forward past the auto-dismiss duration
      vi.advanceTimersByTime(4100);

      expect(notificationsModule.notifications).toHaveLength(0);
    });

    it("should not auto-dismiss error notifications", () => {
      const notificationsModule = createNotificationsModule();

      notificationsModule.notify("Error message", "error");
      expect(notificationsModule.notifications).toHaveLength(1);

      // Fast forward, error should still be there
      vi.advanceTimersByTime(10000);

      expect(notificationsModule.notifications).toHaveLength(1);
    });

    it("should remove notification by id", () => {
      const notificationsModule = createNotificationsModule();

      const id1 = notificationsModule.notify("Message 1");
      const id2 = notificationsModule.notify("Message 2");

      expect(notificationsModule.notifications).toHaveLength(2);

      notificationsModule.removeNotification(id1);

      expect(notificationsModule.notifications).toHaveLength(1);
      expect(notificationsModule.notifications[0].id).toBe(id2);
    });

    it("should clear notifications by group", () => {
      const notificationsModule = createNotificationsModule();

      notificationsModule.notify("Group A message", "info", {
        group: "group-a",
      });
      notificationsModule.notify("Group B message", "info", {
        group: "group-b",
      });
      notificationsModule.notify("No group message");

      expect(notificationsModule.notifications).toHaveLength(3);

      notificationsModule.clearNotifications("group-a");

      expect(notificationsModule.notifications).toHaveLength(2);
      expect(
        notificationsModule.notifications.every((n) => n.group !== "group-a"),
      ).toBe(true);
    });

    it("should clear all notifications when no group specified", () => {
      const notificationsModule = createNotificationsModule();

      notificationsModule.notify("Message 1");
      notificationsModule.notify("Message 2");
      notificationsModule.notify("Message 3");

      expect(notificationsModule.notifications).toHaveLength(3);

      notificationsModule.clearNotifications();

      expect(notificationsModule.notifications).toHaveLength(0);
    });

    it("should update notification progress", () => {
      const notificationsModule = createNotificationsModule();

      const id = notificationsModule.notify("Upload progress", "info", {
        progress: 50,
      });

      expect(notificationsModule.notifications[0].progress).toBe(50);

      notificationsModule.updateNotification(id, { progress: 75 });

      expect(notificationsModule.notifications[0].progress).toBe(75);
    });

    it("should clamp progress values between 0 and 100", () => {
      const notificationsModule = createNotificationsModule();

      notificationsModule.notify("Progress test", "info", { progress: 150 });
      expect(notificationsModule.notifications[0].progress).toBe(100);

      notificationsModule.notify("Progress test 2", "info", { progress: -10 });
      expect(notificationsModule.notifications[1].progress).toBe(0);
    });

    it("should create notification with custom duration", () => {
      const notificationsModule = createNotificationsModule();

      notificationsModule.notify("Custom duration", "info", { duration: 1000 });

      expect(notificationsModule.notifications[0].duration).toBe(1000);

      // Should auto-dismiss after 1 second
      vi.advanceTimersByTime(1100);
      expect(notificationsModule.notifications).toHaveLength(0);
    });
  });
});

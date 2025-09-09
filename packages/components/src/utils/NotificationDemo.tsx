/**
 * Notification Demo Component
 * Demonstrates notification system functionality
 */

import { Component, createMemo } from "solid-js";
import { useNotifications } from "reynard-core";

export const NotificationDemo: Component = () => {
  // Use createMemo to defer context access and handle errors gracefully
  const notifications = createMemo(() => {
    try {
      return useNotifications();
    } catch (error) {
      console.error(
        "NotificationDemo: Notifications context not available",
        error,
      );
      return {
        notify: (message: string, type?: string) => {
          console.warn("Notifications context not available:", message, type);
        },
      };
    }
  });

  const notify = createMemo(() => notifications().notify);

  const showSuccess = () => {
    notify()("Operation completed successfully!", "success");
  };

  const showError = () => {
    notify()("Something went wrong. Please try again.", "error");
  };

  const showInfo = () => {
    notify()("Here is some helpful information.", "info");
  };

  const showWarning = () => {
    notify()("Please review this important notice.", "warning");
  };

  return (
    <div class="notification-demo">
      <div class="button-group">
        <button class="button button--success" onClick={showSuccess}>
          Success
        </button>
        <button class="button button--error" onClick={showError}>
          Error
        </button>
        <button class="button button--info" onClick={showInfo}>
          Info
        </button>
        <button class="button button--warning" onClick={showWarning}>
          Warning
        </button>
      </div>
    </div>
  );
};

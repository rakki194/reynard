/**
 * Notification Toast Component
 * Renders toast notifications in the UI
 */

import { Component, For, createMemo } from "solid-js";
import { useNotifications } from "reynard-core";
import { NotificationItem } from "./NotificationItem";
import "./NotificationToast.css";

export const NotificationToast: Component = () => {
  // Use createMemo to defer context access and handle errors gracefully
  const notificationModule = createMemo(() => {
    try {
      return useNotifications();
    } catch (error) {
      console.error(
        "NotificationToast: Notifications context not available",
        error,
      );
      return {
        notifications: [],
        removeNotification: (id: string) => {
          console.warn(
            "Notifications context not available, cannot remove notification:",
            id,
          );
        },
      };
    }
  });
  const { removeNotification } = notificationModule();

  // Access notifications as a reactive signal
  const notifications = () => notificationModule().notifications;

  return (
    <div class="notification-toast-container">
      <For each={notifications()}>
        {(notification) => (
          <NotificationItem
            notification={notification}
            onRemove={removeNotification}
          />
        )}
      </For>
    </div>
  );
};

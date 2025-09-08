/**
 * Notification Toast Component
 * Renders toast notifications in the UI
 */

import { Component, For } from "solid-js";
import { useNotifications } from "reynard-core";
import { NotificationItem } from "./NotificationItem";
import "./NotificationToast.css";

export const NotificationToast: Component = () => {
  const notificationModule = useNotifications();
  const { removeNotification } = notificationModule;
  
  // Access notifications as a reactive signal
  const notifications = () => notificationModule.notifications;

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

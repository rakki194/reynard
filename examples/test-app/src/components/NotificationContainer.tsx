import { Component, createSignal, For } from "solid-js";
import { Notification } from "./Notification";
import "./NotificationContainer.css";

export interface NotificationItem {
  id: string;
  message: string;
  type: "error" | "success" | "info" | "warning";
  group?: string;
  icon?: "spinner" | "success" | "error" | "info" | "warning";
  progress?: number;
  timestamp?: number;
  duration?: number;
}

let notificationId = 0;

export const NotificationContainer: Component = () => {
  const [notifications, setNotifications] = createSignal<NotificationItem[]>([]);

  const addNotification = (notification: NotificationItem) => {
    setNotifications(prev => {
      console.log('[NotificationContainer] addNotification called with:', notification);
      // If the notification has a group, try to update an existing one
      if (notification.group) {
        const existingIndex = prev.findIndex(n => n.group === notification.group);
        if (existingIndex !== -1) {
          console.log('[NotificationContainer] Found existing notification with group:', notification.group);
          // Create a new notification object with updated properties to ensure reactivity
          const updatedNotification = {
            ...prev[existingIndex], // Keep existing properties like id
            message: notification.message,
            type: notification.type,
            icon: notification.icon,
            progress: notification.progress,
            group: notification.group, // Ensure group is preserved
          };

          // Replace the existing notification with the updated one
          const newNotifications = [...prev];
          newNotifications[existingIndex] = updatedNotification;
          console.log('[NotificationContainer] Updated existing notification:', updatedNotification);
          return newNotifications;
        }
      }
      // If no group, or no existing notification with this group, add as new
      const newNotificationWithId = { 
        ...notification, 
        id: notification.id || `notification-${notificationId++}`,
        timestamp: notification.timestamp || Date.now()
      };
      console.log('[NotificationContainer] Adding new notification:', newNotificationWithId);
      return [...prev, newNotificationWithId];
    });
  };

  const removeNotification = (id: string) => {
    console.log('[NotificationContainer] removeNotification called with id:', id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const removeNotificationByGroup = (group: string) => {
    console.log('[NotificationContainer] removeNotificationByGroup called with group:', group);
    setNotifications(prev => prev.filter(n => n.group !== group));
  };

  const getNotificationIdByGroup = (group: string) => {
    const notification = notifications().find(n => n.group === group);
    return notification ? notification.id : undefined;
  };

  const clearAllNotifications = () => {
    console.log('[NotificationContainer] clearAllNotifications called');
    setNotifications([]);
  };

  // Expose methods globally
  if (typeof window !== 'undefined') {
    (window as any).__notificationContainer = {
      addNotification,
      removeNotification,
      removeNotificationByGroup,
      getNotificationIdByGroup,
      clearAllNotifications,
    };
    console.log('[NotificationContainer] Global notification container methods exposed');
    console.log('[NotificationContainer] Global container object:', (window as any).__notificationContainer);
  }

  return (
    <div
      class="notification-container"
      role="region"
      aria-live="polite"
      aria-relevant="additions"
      aria-label="Notifications"
    >
      <For each={notifications()}>
        {notification => (
          <Notification
            id={notification.id}
            message={notification.message}
            type={notification.type}
            group={notification.group}
            icon={notification.icon}
            progress={notification.progress}
            duration={notification.duration}
            onClose={() => removeNotification(notification.id)}
          />
        )}
      </For>
    </div>
  );
};

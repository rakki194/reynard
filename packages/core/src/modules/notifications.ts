/**
 * Notifications module - handles notification system
 * Extracted from yipyap's proven notification system
 */

import { createSignal } from "solid-js";

export interface Notification {
  id: string;
  message: string;
  type: "error" | "success" | "info" | "warning";
  group?: string;
  icon?: "spinner" | "success" | "error" | "info" | "warning";
  progress?: number;
  timestamp: number;
  duration?: number; // Auto-dismiss duration in ms
}

export interface NotificationsModule {
  readonly notifications: Notification[];
  notify: (
    message: string,
    type?: "error" | "success" | "info" | "warning",
    options?: {
      group?: string;
      icon?: "spinner" | "success" | "error" | "info" | "warning";
      progress?: number;
      duration?: number;
    },
  ) => string;
  createNotification: (
    notification: Omit<Notification, "id" | "timestamp">,
  ) => string;
  updateNotification: (id: string, updates: Partial<Notification>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: (group?: string) => void;
}

// Auto-dismiss durations by type (in ms)
const DEFAULT_DURATIONS = {
  success: 4000,
  info: 5000,
  warning: 7000,
  error: 0, // Don't auto-dismiss errors
} as const;

export const createNotificationsModule = (): NotificationsModule => {
  console.log("createNotificationsModule: Creating notifications module");
  const [notifications, setNotifications] = createSignal<Notification[]>([]);
  

  const generateId = () =>
    `notification-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  const notify = (
    message: string,
    type: "error" | "success" | "info" | "warning" = "info",
    options: {
      group?: string;
      icon?: "spinner" | "success" | "error" | "info" | "warning";
      progress?: number;
      duration?: number;
    } = {},
  ): string => {
    console.log("notify: Called with", message, type, options);
    
    // Always use internal state for new NotificationToast system
    console.log("notify: Using internal state");
    const id = generateId();
    const { group, icon, progress, duration } = options;

    const notification: Notification = {
      id,
      message,
      type,
      group,
      icon: icon ?? type,
      progress:
        typeof progress === "number"
          ? Math.min(100, Math.max(0, progress))
          : undefined,
      timestamp: Date.now(),
      duration: duration ?? DEFAULT_DURATIONS[type],
    };

    setNotifications((prev) => {
      // If grouped, replace existing notification with same group
      if (group) {
        const filtered = prev.filter((n) => n.group !== group);
        return [...filtered, notification];
      }
      return [...prev, notification];
    });

    // Auto-dismiss if duration is set
    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.duration);
    }

    return id;
  };

  const createNotification = (
    notification: Omit<Notification, "id" | "timestamp">,
  ): string => {
    const id = generateId();
    const fullNotification: Notification = {
      ...notification,
      id,
      timestamp: Date.now(),
      duration: notification.duration ?? DEFAULT_DURATIONS[notification.type],
    };

    setNotifications((prev) => {
      // If grouped, replace existing notification with same group
      if (notification.group) {
        const filtered = prev.filter((n) => n.group !== notification.group);
        return [...filtered, fullNotification];
      }
      return [...prev, fullNotification];
    });

    // Auto-dismiss if duration is set
    if (fullNotification.duration && fullNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, fullNotification.duration);
    }

    return id;
  };

  const updateNotification = (id: string, updates: Partial<Notification>) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, ...updates } : notification,
      ),
    );
  };

  const removeNotification = (id: string) => {
    // Use global notification container if available
    if (typeof window !== 'undefined' && (window as any).__notificationContainer) {
      (window as any).__notificationContainer.removeNotification(id);
    } else {
      // Fallback to internal state if global container not available
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }
  };

  const clearNotifications = (group?: string) => {
    // Use global notification container if available
    if (typeof window !== 'undefined' && (window as any).__notificationContainer) {
      if (group) {
        (window as any).__notificationContainer.removeNotificationByGroup(group);
      } else {
        (window as any).__notificationContainer.clearAllNotifications();
      }
    } else {
      // Fallback to internal state if global container not available
      if (group) {
        setNotifications((prev) => prev.filter((n) => n.group !== group));
      } else {
        setNotifications([]);
      }
    }
  };

  return {
    get notifications() {
      return notifications();
    },
    notify,
    createNotification,
    updateNotification,
    removeNotification,
    clearNotifications,
  };
};

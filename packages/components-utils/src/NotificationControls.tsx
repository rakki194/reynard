/**
 * Notification Controls Component
 * Interactive controls for testing the notification system
 */

import { Component, createSignal, createMemo } from "solid-js";
import { useNotifications } from "reynard-core";

export const NotificationControls: Component = () => {
  // Use createMemo to defer context access and handle errors gracefully
  const notifications = createMemo(() => {
    try {
      return useNotifications();
    } catch (error) {
      console.error("NotificationControls: Notifications context not available", error);
      return {
        notify: (message: string, type?: string) => {
          console.warn("Notifications context not available:", message, type);
        },
      };
    }
  });

  const notify = createMemo(() => notifications().notify);

  const [notificationMessage, setNotificationMessage] = createSignal("Hello from Reynard!");
  const [notificationType, setNotificationType] = createSignal<"success" | "error" | "warning" | "info">("info");
  const [notificationDuration, setNotificationDuration] = createSignal(3000);

  const handleSendNotification = () => {
    notify()(notificationMessage(), notificationType(), {
      duration: notificationDuration(),
    });
  };

  const handleSendMultipleNotifications = () => {
    const types: Array<"success" | "error" | "warning" | "info"> = ["success", "error", "warning", "info"];
    types.forEach((type, index) => {
      setTimeout(() => {
        notify()(`This is a ${type} notification!`, type);
      }, index * 500);
    });
  };

  return (
    <div class="playground-panel">
      <h3>Notification System</h3>
      <div class="playground-controls">
        <div class="control-group">
          <label>Message:</label>
          <input
            type="text"
            value={notificationMessage()}
            onInput={e => setNotificationMessage(e.target.value)}
            class="input"
            placeholder="Enter notification message"
            title="Notification message text"
          />
        </div>

        <div class="control-group">
          <label>Type:</label>
          <select
            value={notificationType()}
            onChange={e => setNotificationType(e.target.value as any)}
            class="select"
            title="Select notification type"
          >
            <option value="success">Success</option>
            <option value="error">Error</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
          </select>
        </div>

        <div class="control-group">
          <label>Duration (ms):</label>
          <input
            type="number"
            value={notificationDuration()}
            onInput={e => setNotificationDuration(parseInt(e.target.value))}
            class="input"
            min="0"
            max="10000"
            step="500"
            title="Notification duration in milliseconds"
          />
        </div>
      </div>

      <div class="playground-actions">
        <button class="button button--primary" onClick={handleSendNotification}>
          Send Notification
        </button>
        <button class="button button--secondary" onClick={handleSendMultipleNotifications}>
          Send Multiple
        </button>
      </div>
    </div>
  );
};

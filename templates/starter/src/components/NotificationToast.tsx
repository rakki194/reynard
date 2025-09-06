/**
 * Notification Toast Component
 * Renders toast notifications in the UI
 */

import { Component, For } from "solid-js";
import { useNotifications } from "reynard-core";
import { fluentIconsPackage } from "reynard-fluent-icons";
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
          <div 
            class={`notification-toast notification-toast--${notification.type}`}
            onClick={() => removeNotification(notification.id)}
          >
            <div class="notification-toast__icon">
              {notification.type === "success" && fluentIconsPackage.getIcon("checkmark") && (
                <span
                  // eslint-disable-next-line solid/no-innerhtml
                  innerHTML={fluentIconsPackage.getIcon("checkmark")?.outerHTML}
                />
              )}
              {notification.type === "error" && fluentIconsPackage.getIcon("error") && (
                <span
                  // eslint-disable-next-line solid/no-innerhtml
                  innerHTML={fluentIconsPackage.getIcon("error")?.outerHTML}
                />
              )}
              {notification.type === "warning" && fluentIconsPackage.getIcon("warning") && (
                <span
                  // eslint-disable-next-line solid/no-innerhtml
                  innerHTML={fluentIconsPackage.getIcon("warning")?.outerHTML}
                />
              )}
              {notification.type === "info" && fluentIconsPackage.getIcon("info") && (
                <span
                  // eslint-disable-next-line solid/no-innerhtml
                  innerHTML={fluentIconsPackage.getIcon("info")?.outerHTML}
                />
              )}
            </div>
            <div class="notification-toast__content">
              <div class="notification-toast__message">
                {notification.message}
              </div>
            </div>
            <button 
              class="notification-toast__close"
              onClick={(e) => {
                e.stopPropagation();
                removeNotification(notification.id);
              }}
            >
              ×
            </button>
          </div>
        )}
      </For>
    </div>
  );
};

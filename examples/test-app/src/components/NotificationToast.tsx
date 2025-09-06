import { For } from "solid-js";
import { useNotifications } from "@reynard/core";
import { getIcon } from "@reynard/fluent-icons";
import "./NotificationToast.css";

export function NotificationToast() {
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
              {notification.type === "success" && <span innerHTML={getIcon("checkmark") || ""}></span>}
              {notification.type === "error" && <span innerHTML={getIcon("error") || ""}></span>}
              {notification.type === "warning" && <span innerHTML={getIcon("warning") || ""}></span>}
              {notification.type === "info" && <span innerHTML={getIcon("info") || ""}></span>}
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
}

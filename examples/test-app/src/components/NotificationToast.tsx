import { For } from "solid-js";
import { useNotifications } from "reynard-core";
import { getIcon } from "reynard-fluent-icons";
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
              {notification.type === "success" && (
                <span
                  innerHTML={(() => {
                    const icon = getIcon("checkmark");
                    if (!icon) return "";
                    return typeof icon === "string" ? icon : icon.outerHTML;
                  })()}
                ></span>
              )}
              {notification.type === "error" && (
                <span
                  innerHTML={(() => {
                    const icon = getIcon("error");
                    if (!icon) return "";
                    return typeof icon === "string" ? icon : icon.outerHTML;
                  })()}
                ></span>
              )}
              {notification.type === "warning" && (
                <span
                  innerHTML={(() => {
                    const icon = getIcon("warning");
                    if (!icon) return "";
                    return typeof icon === "string" ? icon : icon.outerHTML;
                  })()}
                ></span>
              )}
              {notification.type === "info" && (
                <span
                  innerHTML={(() => {
                    const icon = getIcon("info");
                    if (!icon) return "";
                    return typeof icon === "string" ? icon : icon.outerHTML;
                  })()}
                ></span>
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
}

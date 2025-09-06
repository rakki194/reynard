import { Component, createSignal, For, Show } from "solid-js";
import { useNotifications } from "reynard-core";
import { Button, Card } from "reynard-components";
import { Drawer } from "reynard-ui";

const NotificationCenter: Component = () => {
  const notifications = useNotifications();
  const [isOpen, setIsOpen] = createSignal(false);

  const unreadCount = () => notifications.notifications.length;

  // Removed markAsRead logic, not supported by Notification type

  const clearAll = () => {
    notifications.clearNotifications();
  };

  return (
    <>
      <div class="notification-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(true)}
          class="notification-center__trigger"
          title="Notifications"
        >
          🔔
          <Show when={unreadCount() > 0}>
            <span class="notification-center__badge">{unreadCount()}</span>
          </Show>
        </Button>
      </div>

      <Drawer
        open={isOpen()}
        onClose={() => setIsOpen(false)}
        position="right"
        title="Notifications"
      >
        <div class="notification-center__content">
          <div class="notification-center__header">
            <h3>Notifications</h3>
            <Show when={notifications.notifications.length > 0}>
              <Button variant="ghost" size="sm" onClick={clearAll}>
                Clear All
              </Button>
            </Show>
          </div>

          <div class="notification-center__list">
            <Show
              when={notifications.notifications.length > 0}
              fallback={
                <div class="notification-center__empty">
                  <p>No notifications</p>
                </div>
              }
            >
              <For each={notifications.notifications}>
                {(notification) => (
                  <Card class={`notification-center__item`}>
                    <div class="notification-center__item-content">
                      <div class="notification-center__item-type">
                        {notification.type === "success" && "✅"}
                        {notification.type === "error" && "❌"}
                        {notification.type === "warning" && "⚠️"}
                        {notification.type === "info" && "ℹ️"}
                      </div>

                      <div class="notification-center__item-body">
                        {/* No title property in Notification type */}
                        <p class="notification-center__item-message">
                          {notification.message}
                        </p>
                        <Show when={notification.timestamp}>
                          <time class="notification-center__item-time">
                            {new Date(notification.timestamp!).toLocaleString()}
                          </time>
                        </Show>
                      </div>

                      <div class="notification-center__item-actions">
                        {/* No read property in Notification type */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            notifications.removeNotification(notification.id)
                          }
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  </Card>
                )}
              </For>
            </Show>
          </div>
        </div>
      </Drawer>
    </>
  );
};

export default NotificationCenter;

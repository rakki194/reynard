import { createSignal, For } from "solid-js";
import { Button, Card } from "reynard-components";
import { useNotifications } from "reynard-core";

export function NotificationsDemo() {
  console.log("NotificationsDemo: Component rendering");

  let notificationsModule;
  try {
    notificationsModule = useNotifications();
    console.log(
      "NotificationsDemo: useNotifications() successful",
      notificationsModule,
    );
  } catch (error) {
    console.error("NotificationsDemo: useNotifications() failed", error);
    return (
      <div class="notifications-demo">
        <Card class="demo-section">
          <h3>Notification System Error</h3>
          <p>
            Failed to initialize notifications:{" "}
            {error instanceof Error ? error.message : String(error)}
          </p>
        </Card>
      </div>
    );
  }

  const { notify, notifications, removeNotification, clearNotifications } =
    notificationsModule;
  const [autoClose, setAutoClose] = createSignal(true);
  const [duration, setDuration] = createSignal(5000);

  console.log("NotificationsDemo: Current notifications", notifications);
  console.log("NotificationsDemo: Notifications length", notifications.length);

  const notificationTypes = [
    {
      type: "success",
      label: "Success",
      message: "Operation completed successfully!",
    },
    {
      type: "error",
      label: "Error",
      message: "Something went wrong. Please try again.",
    },
    {
      type: "warning",
      label: "Warning",
      message: "Please review your input before proceeding.",
    },
    {
      type: "info",
      label: "Info",
      message: "Here's some useful information for you.",
    },
  ] as const;

  const showNotification = (type: "success" | "error" | "warning" | "info") => {
    console.log("NotificationsDemo: showNotification called with type", type);
    const config = notificationTypes.find((n) => n.type === type);
    if (config) {
      console.log(
        "NotificationsDemo: Calling notify with",
        config.message,
        type,
        {
          duration: autoClose() ? duration() : 0,
        },
      );
      try {
        const id = notify(config.message, type, {
          duration: autoClose() ? duration() : 0,
        });
        console.log("NotificationsDemo: notify returned id", id);
      } catch (error) {
        console.error("NotificationsDemo: notify failed", error);
      }
    } else {
      console.error("NotificationsDemo: No config found for type", type);
    }
  };

  const showCustomNotification = () => {
    notify(
      "This is a custom notification with a longer message that demonstrates how notifications can handle more complex content.",
      "info",
      {
        duration: autoClose() ? duration() : 0,
      },
    );
  };

  const showPersistentNotification = () => {
    notify(
      "This notification will not auto-close and must be dismissed manually.",
      "warning",
      {
        duration: 0,
      },
    );
  };

  const showMultipleNotifications = () => {
    notify("First notification", "info", { duration: 2000 });
    setTimeout(
      () => notify("Second notification", "success", { duration: 2000 }),
      500,
    );
    setTimeout(
      () => notify("Third notification", "warning", { duration: 2000 }),
      1000,
    );
  };

  const testSimpleNotification = () => {
    console.log("NotificationsDemo: Testing simple notification");
    try {
      const id = notify("Test notification", "info");
      console.log(
        "NotificationsDemo: Simple notification created with id:",
        id,
      );
    } catch (error) {
      console.error("NotificationsDemo: Simple notification failed:", error);
    }
  };

  return (
    <div class="notifications-demo">
      <Card class="demo-section">
        <h3>Notification System</h3>
        <p>
          Demonstrates the comprehensive notification system with different
          types and configurations.
        </p>

        <div class="demo-subsection">
          <h4>Notification Types</h4>
          <div class="notification-buttons">
            <For each={notificationTypes}>
              {(config) => (
                <Button
                  variant={
                    config.type === "error"
                      ? "danger"
                      : config.type === "warning"
                        ? "warning"
                        : config.type === "success"
                          ? "success"
                          : "primary"
                  }
                  onClick={() => showNotification(config.type)}
                >
                  Show {config.label}
                </Button>
              )}
            </For>
          </div>
        </div>

        <div class="demo-subsection">
          <h4>Custom Notifications</h4>
          <div class="notification-buttons">
            <Button onClick={testSimpleNotification} variant="primary">
              🧪 Test Simple Notification
            </Button>
            <Button onClick={showCustomNotification}>Custom Message</Button>
            <Button onClick={showPersistentNotification} variant="warning">
              Persistent Notification
            </Button>
            <Button onClick={showMultipleNotifications} variant="secondary">
              Multiple Notifications
            </Button>
          </div>
        </div>

        <div class="demo-subsection">
          <h4>Notification Settings</h4>
          <div class="notification-settings">
            <label class="setting-item">
              <input
                type="checkbox"
                checked={autoClose()}
                onChange={(e) => setAutoClose(e.currentTarget.checked)}
              />
              Auto-close notifications
            </label>
            <div class="setting-item">
              <label for="duration-slider">Duration (ms):</label>
              <input
                id="duration-slider"
                type="range"
                min="1000"
                max="10000"
                step="500"
                value={duration()}
                onInput={(e) => setDuration(parseInt(e.currentTarget.value))}
                disabled={!autoClose()}
                aria-label="Notification duration in milliseconds"
              />
              <span>{duration()}ms</span>
            </div>
          </div>
        </div>
      </Card>

      <Card class="demo-section">
        <h3>Active Notifications</h3>
        <p>Shows all currently active notifications with management options.</p>

        <div class="notifications-controls">
          <Button
            onClick={() => clearNotifications()}
            variant="danger"
            disabled={notifications.length === 0}
          >
            Clear All ({notifications.length})
          </Button>
        </div>

        <div class="notifications-list">
          <For each={notifications}>
            {(notification) => {
              console.log(
                "NotificationsDemo: Rendering notification",
                notification,
              );
              return (
                <div
                  class={`notification-item notification-item--${notification.type}`}
                >
                  <div class="notification-content">
                    <div class="notification-header">
                      <span class="notification-type">
                        {notification.type.toUpperCase()}
                      </span>
                      <span class="notification-timestamp">
                        {new Date(notification.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div class="notification-message">
                      {notification.message}
                    </div>
                    {notification.duration === 0 && (
                      <div class="notification-persistent">Persistent</div>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeNotification(notification.id)}
                    class="notification-close"
                  >
                    ✕
                  </Button>
                </div>
              );
            }}
          </For>

          {notifications.length === 0 && (
            <div class="no-notifications">
              <p>No active notifications</p>
              <p>Click the buttons above to create some notifications!</p>
            </div>
          )}
        </div>
      </Card>

      <Card class="demo-section">
        <h3>Notification Features</h3>
        <p>Overview of notification system capabilities.</p>

        <div class="features-list">
          <div class="feature-item">
            <h4>🎯 Multiple Types</h4>
            <p>
              Success, error, warning, and info notifications with distinct
              styling.
            </p>
          </div>

          <div class="feature-item">
            <h4>Auto-close</h4>
            <p>Configurable auto-close duration or persistent notifications.</p>
          </div>

          <div class="feature-item">
            <h4>Theme Integration</h4>
            <p>Notifications automatically adapt to the current theme.</p>
          </div>

          <div class="feature-item">
            <h4>📱 Responsive</h4>
            <p>Notifications work seamlessly across all device sizes.</p>
          </div>

          <div class="feature-item">
            <h4>♿ Accessible</h4>
            <p>Full keyboard navigation and screen reader support.</p>
          </div>

          <div class="feature-item">
            <h4>Queue Management</h4>
            <p>Automatic queuing and positioning of multiple notifications.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

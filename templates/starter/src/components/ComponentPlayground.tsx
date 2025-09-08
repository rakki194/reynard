/**
 * Component Playground
 * Interactive playground for testing Reynard components and features
 */

import { Component, createSignal, createEffect, For } from "solid-js";
import { useNotifications } from "reynard-core";
import { useTheme } from "reynard-themes";
import { fluentIconsPackage } from "reynard-fluent-icons";

export const ComponentPlayground: Component = () => {
  const { notify } = useNotifications();
  const { theme } = useTheme();
  
  const [activeTab, setActiveTab] = createSignal("notifications");
  const [notificationMessage, setNotificationMessage] = createSignal("Hello from Reynard!");
  const [notificationType, setNotificationType] = createSignal<"success" | "error" | "warning" | "info">("info");
  const [notificationDuration, setNotificationDuration] = createSignal(3000);
  const [showCode, setShowCode] = createSignal(false);

  const tabs = [
    { id: "notifications", name: "Notifications", icon: "service-bell" },
    { id: "icons", name: "Icons", icon: "grid" },
    { id: "themes", name: "Themes", icon: "palette" },
    { id: "storage", name: "Storage", icon: "save" }
  ];

  const handleSendNotification = () => {
    notify(notificationMessage(), notificationType(), { duration: notificationDuration() });
  };

  const handleSendMultipleNotifications = () => {
    const types: Array<"success" | "error" | "warning" | "info"> = ["success", "error", "warning", "info"];
    types.forEach((type, index) => {
      setTimeout(() => {
        notify(`This is a ${type} notification!`, type);
      }, index * 500);
    });
  };

  const getCodeExample = () => {
    switch (activeTab()) {
      case "notifications":
        return `import { useNotifications } from "reynard-core";

const { notify } = useNotifications();

// Send a notification
notify("Hello World!", "success");

// Send with custom duration
notify("This won't auto-dismiss", "error", { duration: 0 });`;
      
      case "icons":
        return `import { fluentIconsPackage } from "reynard-fluent-icons";

// Get an icon
const saveIcon = fluentIconsPackage.getIcon("save");

// Use in JSX
<div innerHTML={saveIcon}></div>

// Get icon metadata
const metadata = fluentIconsPackage.getIconMetadata("save");`;
      
      case "themes":
        return `import { useTheme } from "reynard-themes";

const { theme, setTheme, availableThemes } = useTheme();

// Change theme
setTheme("dark");

// Get current theme
console.log("Current theme:", theme);`;
      
      case "storage":
        return `import { useLocalStorage } from "reynard-core";

const [value, setValue, remove] = useLocalStorage("my-key", {
  defaultValue: "default value"
});

// Update value
setValue("new value");

// Remove from storage
remove();`;
      
      default:
        return "";
    }
  };

  return (
    <section class="playground-section">
      <div class="section-header">
        <h2>
          {fluentIconsPackage.getIcon("code") && (
            <span class="section-icon">
              <div
                // eslint-disable-next-line solid/no-innerhtml
                innerHTML={fluentIconsPackage.getIcon("code")?.outerHTML}
              />
            </span>
          )}
          Component Playground
        </h2>
        <p>Interactive playground for testing Reynard components and features</p>
      </div>

      <div class="playground-container">
        <div class="playground-tabs">
          <For each={tabs}>{tab => (
            <button
              class={`playground-tab ${activeTab() === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {fluentIconsPackage.getIcon(tab.icon) && (
                <span class="tab-icon">
                  <div
                    // eslint-disable-next-line solid/no-innerhtml
                    innerHTML={fluentIconsPackage.getIcon(tab.icon)?.outerHTML}
                  />
                </span>
              )}
              {tab.name}
            </button>
          )}</For>
        </div>

        <div class="playground-content">
          {activeTab() === "notifications" && (
            <div class="playground-panel">
              <h3>Notification System</h3>
              <div class="playground-controls">
                <div class="control-group">
                  <label>Message:</label>
                  <input
                    type="text"
                    value={notificationMessage()}
                    onInput={(e) => setNotificationMessage(e.target.value)}
                    class="input"
                    placeholder="Enter notification message"
                    title="Notification message text"
                  />
                </div>
                
                <div class="control-group">
                  <label>Type:</label>
                  <select
                    value={notificationType()}
                    onChange={(e) => setNotificationType(e.target.value as any)}
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
                    onInput={(e) => setNotificationDuration(parseInt(e.target.value))}
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
          )}

          {activeTab() === "icons" && (
            <div class="playground-panel">
              <h3>Icon System</h3>
              <div class="icon-showcase">
                <div class="icon-category">
                  <h4>Common Icons</h4>
                  <div class="icon-grid">
                    <For each={["save", "delete", "edit", "add", "search", "settings", "home", "heart"]}>{iconName => (
                      <div class="icon-demo">
                        <div class="icon-preview">
                          {fluentIconsPackage.getIcon(iconName) && (
                            <div
                              // eslint-disable-next-line solid/no-innerhtml
                              innerHTML={fluentIconsPackage.getIcon(iconName)?.outerHTML}
                            />
                          )}
                        </div>
                        <span class="icon-label">{iconName}</span>
                      </div>
                    )}</For>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab() === "themes" && (
            <div class="playground-panel">
              <h3>Theme System</h3>
              <div class="theme-demo">
                <div class="current-theme">
                  <h4>Current Theme: {theme}</h4>
                  <div class="theme-preview-box">
                    <div class="preview-content">
                      <div class="preview-header">Sample Component</div>
                      <div class="preview-body">
                        <p>This is how content looks in the current theme.</p>
                        <button class="button button--primary">Sample Button</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab() === "storage" && (
            <div class="playground-panel">
              <h3>Local Storage</h3>
              <div class="storage-demo">
                <p>Local storage is automatically handled by Reynard's reactive system.</p>
                <p>Try changing themes or other settings - they'll persist across page reloads!</p>
                <div class="storage-info">
                  <div class="info-item">
                    <strong>Current Theme:</strong> {theme} (stored in localStorage)
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div class="playground-code">
          <div class="code-header">
            <h4>Code Example</h4>
            <button 
              class="button button--small"
              onClick={() => setShowCode(!showCode())}
            >
              {fluentIconsPackage.getIcon(showCode() ? "eye-off" : "eye") && (
                <span
                  // eslint-disable-next-line solid/no-innerhtml
                  innerHTML={fluentIconsPackage.getIcon(showCode() ? "eye-off" : "eye")?.outerHTML}
                />
              )}
              {showCode() ? 'Hide' : 'Show'} Code
            </button>
          </div>
          
          {showCode() && (
            <div class="code-block">
              <pre><code>{getCodeExample()}</code></pre>
              <button 
                class="button button--small button--secondary"
                onClick={() => {
                  navigator.clipboard.writeText(getCodeExample());
                  notify("Code copied to clipboard!", "success");
                }}
              >
                {fluentIconsPackage.getIcon("copy") && (
                  <span
                    // eslint-disable-next-line solid/no-innerhtml
                    innerHTML={fluentIconsPackage.getIcon("copy")?.outerHTML}
                  />
                )}
                Copy Code
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

/**
 * Storage Demo Component
 * Demonstrates persistent storage with LocalStorage integration
 */
import { useNotifications, useLocalStorage } from "reynard-core";
import { fluentIconsPackage } from "reynard-fluent-icons";
export const StorageDemo = () => {
  const { notify } = useNotifications();
  // LocalStorage demo
  const [userName, setUserName, removeUserName] = useLocalStorage("reynard-demo-username", {
    defaultValue: "",
  });
  const handleSaveName = () => {
    if (userName().trim()) {
      notify(`Hello ${userName()}! Your name has been saved.`, "success");
    } else {
      notify("Please enter a name first!", "error");
    }
  };
  const handleClearName = () => {
    removeUserName();
    notify("Name cleared from storage", "info");
  };
  return (
    <div class="dashboard-card">
      <div class="card-header">
        <h3>
          {fluentIconsPackage.getIcon("save") && (
            <span class="card-icon">
              <div
                // eslint-disable-next-line solid/no-innerhtml
                innerHTML={fluentIconsPackage.getIcon("save")?.outerHTML}
              />
            </span>
          )}
          Persistent Storage
        </h3>
      </div>
      <div class="card-content">
        <div class="input-group">
          <input
            type="text"
            placeholder="Enter your name"
            value={userName()}
            onInput={e => setUserName(e.target.value)}
            class="input"
          />
          <button class="button button--small" onClick={handleSaveName}>
            {fluentIconsPackage.getIcon("checkmark") && (
              <span
                // eslint-disable-next-line solid/no-innerhtml
                innerHTML={fluentIconsPackage.getIcon("checkmark")?.outerHTML}
              />
            )}
          </button>
          <button class="button button--small" onClick={handleClearName}>
            {fluentIconsPackage.getIcon("delete") && (
              <span
                // eslint-disable-next-line solid/no-innerhtml
                innerHTML={fluentIconsPackage.getIcon("delete")?.outerHTML}
              />
            )}
          </button>
        </div>
        {userName() && (
          <p class="stored-value">
            Stored: <strong>{userName()}</strong>
          </p>
        )}
      </div>
    </div>
  );
};

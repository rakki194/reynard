/**
 * Interactive Dashboard Component
 * Demonstrates Reynard's core features with live interactions
 */

import { Component, createSignal, createEffect } from "solid-js";
import { useNotifications } from "reynard-core";
import { useLocalStorage } from "reynard-core";
import { useTheme } from "reynard-themes";
import { fluentIconsPackage } from "reynard-fluent-icons";

export const InteractiveDashboard: Component = () => {
  const { notify } = useNotifications();
  const { theme } = useTheme();
  
  // LocalStorage demo
  const [userName, setUserName, removeUserName] = useLocalStorage("reynard-demo-username", {
    defaultValue: "",
  });
  
  // Interactive state
  const [counter, setCounter] = createSignal(0);
  const [isOnline, setIsOnline] = createSignal(navigator.onLine);
  const [currentTime, setCurrentTime] = createSignal(new Date().toLocaleTimeString());
  const [favoriteColor, setFavoriteColor] = createSignal("#007bff");
  const [showAdvanced, setShowAdvanced] = createSignal(false);

  // Update time every second
  createEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    
    return () => clearInterval(interval);
  });

  // Monitor online status
  createEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  });

  const handleCounterAction = (action: string) => {
    switch (action) {
      case "increment":
        setCounter(counter() + 1);
        notify(`Counter increased to ${counter() + 1}`, "info");
        break;
      case "decrement":
        setCounter(counter() - 1);
        notify(`Counter decreased to ${counter() - 1}`, "info");
        break;
      case "reset":
        setCounter(0);
        notify("Counter reset to 0", "warning");
        break;
    }
  };

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

  const handleColorChange = (color: string) => {
    setFavoriteColor(color);
    notify(`Favorite color changed to ${color}`, "info");
  };

  const handleAdvancedToggle = () => {
    setShowAdvanced(!showAdvanced());
    notify(showAdvanced() ? "Advanced features hidden" : "Advanced features shown", "info");
  };

  return (
    <section class="dashboard-section">
      <div class="section-header">
        <h2>
          {fluentIconsPackage.getIcon("dashboard") && (
            <span class="section-icon">
              <div
                // eslint-disable-next-line solid/no-innerhtml
                innerHTML={fluentIconsPackage.getIcon("dashboard")?.outerHTML}
              />
            </span>
          )}
          Interactive Dashboard
        </h2>
        <p>Experience Reynard's reactive capabilities in real-time</p>
      </div>

      <div class="dashboard-grid">
        {/* Counter Demo */}
        <div class="dashboard-card">
          <div class="card-header">
            <h3>
              {fluentIconsPackage.getIcon("add") && (
                <span class="card-icon">
                  <div
                    // eslint-disable-next-line solid/no-innerhtml
                    innerHTML={fluentIconsPackage.getIcon("add")?.outerHTML}
                  />
                </span>
              )}
              Reactive Counter
            </h3>
          </div>
          <div class="card-content">
            <div class="counter-display">
              <span class="counter-value">{counter()}</span>
            </div>
            <div class="button-group">
              <button 
                class="button button--small" 
                onClick={() => handleCounterAction("decrement")}
              >
                {fluentIconsPackage.getIcon("subtract") && (
                  <span
                    // eslint-disable-next-line solid/no-innerhtml
                    innerHTML={fluentIconsPackage.getIcon("subtract")?.outerHTML}
                  />
                )}
              </button>
              <button 
                class="button button--small" 
                onClick={() => handleCounterAction("reset")}
              >
                {fluentIconsPackage.getIcon("refresh") && (
                  <span
                    // eslint-disable-next-line solid/no-innerhtml
                    innerHTML={fluentIconsPackage.getIcon("refresh")?.outerHTML}
                  />
                )}
              </button>
              <button 
                class="button button--small" 
                onClick={() => handleCounterAction("increment")}
              >
                {fluentIconsPackage.getIcon("add") && (
                  <span
                    // eslint-disable-next-line solid/no-innerhtml
                    innerHTML={fluentIconsPackage.getIcon("add")?.outerHTML}
                  />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* LocalStorage Demo */}
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
                onInput={(e) => setUserName(e.target.value)}
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
              <p class="stored-value">Stored: <strong>{userName()}</strong></p>
            )}
          </div>
        </div>

        {/* System Status */}
        <div class="dashboard-card">
          <div class="card-header">
            <h3>
              {fluentIconsPackage.getIcon("server") && (
                <span class="card-icon">
                  <div
                    // eslint-disable-next-line solid/no-innerhtml
                    innerHTML={fluentIconsPackage.getIcon("server")?.outerHTML}
                  />
                </span>
              )}
              System Status
            </h3>
          </div>
          <div class="card-content">
            <div class="status-item">
              <span class="status-label">Connection:</span>
              <span class={`status-value ${isOnline() ? 'online' : 'offline'}`}>
                {isOnline() ? 'Online' : 'Offline'}
              </span>
            </div>
            <div class="status-item">
              <span class="status-label">Current Time:</span>
              <span class="status-value">{currentTime()}</span>
            </div>
            <div class="status-item">
              <span class="status-label">Theme:</span>
              <span class="status-value">{theme}</span>
            </div>
          </div>
        </div>

        {/* Color Picker */}
        <div class="dashboard-card">
          <div class="card-header">
            <h3>
              {fluentIconsPackage.getIcon("palette") && (
                <span class="card-icon">
                  <div
                    // eslint-disable-next-line solid/no-innerhtml
                    innerHTML={fluentIconsPackage.getIcon("palette")?.outerHTML}
                  />
                </span>
              )}
              Color Picker
            </h3>
          </div>
          <div class="card-content">
            <div class="color-picker-group">
              <input
                type="color"
                value={favoriteColor()}
                onInput={(e) => handleColorChange(e.target.value)}
                class="color-picker"
                title="Choose your favorite color"
              />
              <div class="color-preview" style={`background-color: ${favoriteColor()}`} />
            </div>
            <p class="color-value">Selected: <code>{favoriteColor()}</code></p>
          </div>
        </div>

        {/* Advanced Features Toggle */}
        <div class="dashboard-card">
          <div class="card-header">
            <h3>
              {fluentIconsPackage.getIcon("settings") && (
                <span class="card-icon">
                  <div
                    // eslint-disable-next-line solid/no-innerhtml
                    innerHTML={fluentIconsPackage.getIcon("settings")?.outerHTML}
                  />
                </span>
              )}
              Advanced Features
            </h3>
          </div>
          <div class="card-content">
            <button 
              class="button button--secondary" 
              onClick={handleAdvancedToggle}
            >
              {fluentIconsPackage.getIcon(showAdvanced() ? "eye-off" : "eye") && (
                <span
                  // eslint-disable-next-line solid/no-innerhtml
                  innerHTML={fluentIconsPackage.getIcon(showAdvanced() ? "eye-off" : "eye")?.outerHTML}
                />
              )}
              {showAdvanced() ? 'Hide' : 'Show'} Advanced
            </button>
            {showAdvanced() && (
              <div class="advanced-features">
                <p>🔧 Advanced features are now visible!</p>
                <p>This demonstrates conditional rendering with SolidJS signals.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

import { Component, createSignal } from "solid-js";
import type { ChatUser } from "@reynard/components";

interface HeaderProps {
  currentUser: ChatUser;
  onUserStatusChange: (status: ChatUser["status"]) => void;
}

export const Header: Component<HeaderProps> = (props) => {
  const [showUserMenu, setShowUserMenu] = createSignal(false);
  const [theme, setTheme] = createSignal<"light" | "dark">("light");

  const toggleTheme = () => {
    const newTheme = theme() === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  const getStatusColor = (status: ChatUser["status"]) => {
    switch (status) {
      case "online":
        return "#10b981";
      case "away":
        return "#f59e0b";
      case "busy":
        return "#ef4444";
      case "offline":
        return "#6b7280";
      default:
        return "#6b7280";
    }
  };

  return (
    <header class="app-header">
      <div class="header-content">
        {/* Logo and Title */}
        <div class="header-brand">
          <div class="brand-logo">🦊</div>
          <div class="brand-text">
            <h1 class="brand-title">Reynard Chat Demo</h1>
            <p class="brand-subtitle">AI Assistant & P2P Messaging</p>
          </div>
        </div>

        {/* Controls */}
        <div class="header-controls">
          {/* Theme Toggle */}
          <button
            class="control-button theme-toggle"
            onClick={toggleTheme}
            title={`Switch to ${theme() === "light" ? "dark" : "light"} mode`}
          >
            {theme() === "light" ? "🌙" : "☀️"}
          </button>

          {/* User Menu */}
          <div class="user-menu-container">
            <button
              class="user-menu-trigger"
              onClick={() => setShowUserMenu(!showUserMenu())}
            >
              <div class="user-avatar">
                {props.currentUser.avatar || props.currentUser.name.charAt(0)}
              </div>
              <div class="user-info">
                <span class="user-name">{props.currentUser.name}</span>
                <div class="user-status">
                  <div
                    class="status-dot"
                    style={{
                      "background-color": getStatusColor(
                        props.currentUser.status,
                      ),
                    }}
                  ></div>
                  <span class="status-text">{props.currentUser.status}</span>
                </div>
              </div>
              <div class="dropdown-arrow">▼</div>
            </button>

            {showUserMenu() && (
              <div class="user-menu-dropdown">
                <div class="menu-section">
                  <label class="menu-label">Status</label>
                  {(["online", "away", "busy", "offline"] as const).map(
                    (status) => (
                      <button
                        class={`status-option ${props.currentUser.status === status ? "active" : ""}`}
                        onClick={() => {
                          props.onUserStatusChange(status);
                          setShowUserMenu(false);
                        }}
                      >
                        <div
                          class="status-dot"
                          style={{ "background-color": getStatusColor(status) }}
                        ></div>
                        <span class="status-text">{status}</span>
                      </button>
                    ),
                  )}
                </div>

                <div class="menu-divider"></div>

                <div class="menu-section">
                  <button
                    class="menu-item"
                    onClick={() => console.log("Profile settings")}
                  >
                    👤 Profile Settings
                  </button>
                  <button
                    class="menu-item"
                    onClick={() => console.log("Chat preferences")}
                  >
                    ⚙️ Chat Preferences
                  </button>
                  <button
                    class="menu-item"
                    onClick={() => console.log("Help & Support")}
                  >
                    ❓ Help & Support
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

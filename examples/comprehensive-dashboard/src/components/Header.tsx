import { Component } from "solid-js";
import { useI18n, useTheme, useNotifications } from "@reynard/core";
import { useAuth } from "@reynard/auth";
import { Button } from "@reynard/components";
import ThemeSelector from "./ThemeSelector";
import LanguageSelector from "./LanguageSelector";
import NotificationCenter from "./NotificationCenter";

interface HeaderProps {
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
}

const Header: Component<HeaderProps> = (props) => {
  const { t } = useI18n();
  const { theme } = useTheme();
  const { user, logout } = useAuth();
  const notifications = useNotifications();

  const handleLogout = async () => {
    try {
      await logout();
      notifications.add({
        type: "success",
        message: "Logged out successfully",
        duration: 3000,
      });
    } catch (error) {
      notifications.add({
        type: "error",
        message: "Failed to logout",
        duration: 5000,
      });
    }
  };

  return (
    <header class="header">
      <div class="header__left">
        <Button
          variant="ghost"
          size="sm"
          onClick={props.onToggleSidebar}
          class="header__menu-toggle"
          title={props.sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          ☰
        </Button>
      </div>

      <div class="header__center">
        <h1 class="header__title">{t("dashboard.title")}</h1>
      </div>

      <div class="header__right">
        <div class="header__controls">
          <ThemeSelector />
          <LanguageSelector />
          <NotificationCenter />

          <div class="header__user">
            <span class="header__username">{user()?.username || "Guest"}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              title={t("auth.logout")}
            >
              🚪
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export { Header };

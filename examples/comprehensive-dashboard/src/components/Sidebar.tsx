import { Component, For } from "solid-js";
import { A } from "@solidjs/router";
import { useI18n } from "@reynard/core";
import { NavMenu } from "@reynard/ui";
import type { MenuItem } from "@reynard/ui";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const Sidebar: Component<SidebarProps> = (props) => {
  const { t } = useI18n();

  const menuItems: MenuItem[] = [
    {
      id: "dashboard",
      label: () => t("nav.dashboard"),
      href: "/",
      icon: "📊",
    },
    {
      id: "charts",
      label: () => t("nav.charts"),
      href: "/charts",
      icon: "📈",
    },
    {
      id: "components",
      label: () => t("nav.components"),
      href: "/components",
      icon: "🧩",
    },
    {
      id: "gallery",
      label: () => t("nav.gallery"),
      href: "/gallery",
      icon: "🖼️",
    },
    {
      id: "auth",
      label: () => t("nav.auth"),
      href: "/auth",
      icon: "🔐",
    },
    {
      id: "settings",
      label: () => t("nav.settings"),
      href: "/settings",
      icon: "⚙️",
    },
  ];

  return (
    <div class={`sidebar ${props.collapsed ? "sidebar--collapsed" : ""}`}>
      <div class="sidebar__header">
        <div class="sidebar__logo">
          <span class="sidebar__logo-icon">🦊</span>
          {!props.collapsed && <span class="sidebar__logo-text">Reynard</span>}
        </div>

        <button
          class="sidebar__toggle"
          onClick={props.onToggle}
          title={props.collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {props.collapsed ? "→" : "←"}
        </button>
      </div>

      <nav class="sidebar__nav">
        <NavMenu
          items={menuItems}
          variant="vertical"
          collapsed={props.collapsed}
        />
      </nav>
    </div>
  );
};

export { Sidebar };

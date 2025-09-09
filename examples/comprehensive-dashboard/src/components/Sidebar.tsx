import { Component } from "solid-js";
// import { A } from "@solidjs/router"; // Remove unused import
import { useI18n } from "reynard-i18n";
import { NavMenu } from "reynard-ui";
// import type { MenuItem } from "reynard-ui"; // Remove unused import

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const Sidebar: Component<SidebarProps> = (props) => {
  const { t } = useI18n();

  const handleToggle = () => props.onToggle();

  const menuItems = [
    {
      id: "dashboard",
      label: t("nav.dashboard"),
      href: "/",
      icon: "📊",
    },
    {
      id: "charts",
      label: t("nav.charts"),
      href: "/charts",
      icon: "📈",
    },
    {
      id: "components",
      label: t("nav.components"),
      href: "/components",
      icon: "🧩",
    },
    {
      id: "gallery",
      label: t("nav.gallery"),
      href: "/gallery",
      icon: "🖼️",
    },
    {
      id: "auth",
      label: t("nav.auth"),
      href: "/auth",
      icon: "🔐",
    },
    {
      id: "settings",
      label: t("nav.settings"),
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
          onClick={handleToggle}
          title={props.collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {props.collapsed ? "→" : "←"}
        </button>
      </div>

      <nav class="sidebar__nav">
        <NavMenu items={menuItems} />
      </nav>
    </div>
  );
};

export { Sidebar };

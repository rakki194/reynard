/**
 * 🧭 Navigation Component
 * 
 * Sidebar navigation for the animation demo app
 */

import { Component, For } from "solid-js";

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: string;
  description: string;
}

const navItems: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: "📊",
    description: "Overview of all animation features"
  },
  {
    id: "staggered",
    label: "Staggered Animations",
    icon: "🎭",
    description: "Sequential animation effects"
  },
  {
    id: "floating-panel",
    label: "Floating Panels",
    icon: "🪟",
    description: "Panel animations and transitions"
  },
  {
    id: "colors",
    label: "Color Animations",
    icon: "🎨",
    description: "Color transitions and effects"
  },
  {
    id: "3d",
    label: "3D Animations",
    icon: "🎪",
    description: "Three.js integration and 3D effects"
  },
  {
    id: "performance",
    label: "Performance",
    icon: "⚡",
    description: "Performance monitoring and metrics"
  }
];

export const Navigation: Component<NavigationProps> = (props) => {
  return (
    <nav class="demo-nav">
      <h2 class="nav-title">Animation Demos</h2>
      <ul class="nav-list">
        <For each={navItems}>
          {(item) => (
            <li class="nav-item">
              <button
                class={`nav-link ${props.currentPage === item.id ? "active" : ""}`}
                onClick={() => props.onPageChange(item.id)}
                title={item.description}
              >
                <span class="nav-icon">{item.icon}</span>
                <span class="nav-label">{item.label}</span>
              </button>
            </li>
          )}
        </For>
      </ul>
    </nav>
  );
};

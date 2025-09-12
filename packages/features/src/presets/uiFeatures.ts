/**
 * UI Features
 *
 * User interface feature definitions for typical applications.
 */

import type { FeatureDefinition } from "../core/types.js";

export const UI_FEATURES: FeatureDefinition[] = [
  {
    id: "responsive-design",
    name: "Responsive Design",
    description: "Adaptive UI for different screen sizes",
    dependencies: [{ services: ["UIService"], required: true }],
    category: "ui",
    priority: "high",
    tags: ["responsive", "mobile"],
    icon: "responsive",
  },
  {
    id: "dark-mode",
    name: "Dark Mode",
    description: "Dark theme support for the application",
    dependencies: [{ services: ["ThemeService"], required: true }],
    category: "ui",
    priority: "medium",
    tags: ["theme", "dark"],
    icon: "moon",
  },
  {
    id: "accessibility",
    name: "Accessibility",
    description: "Accessibility features for users with disabilities",
    dependencies: [{ services: ["AccessibilityService"], required: true }],
    category: "ui",
    priority: "high",
    tags: ["accessibility", "a11y"],
    icon: "accessibility",
  },
  {
    id: "animations",
    name: "Animations",
    description: "Smooth animations and transitions",
    dependencies: [{ services: ["AnimationService"], required: true }],
    category: "ui",
    priority: "low",
    tags: ["animation", "transition"],
    icon: "animation",
  },
  {
    id: "notifications",
    name: "Notifications",
    description: "User notification system",
    dependencies: [{ services: ["NotificationService"], required: true }],
    category: "ui",
    priority: "medium",
    tags: ["notification", "alert"],
    icon: "bell",
  },
  {
    id: "modals",
    name: "Modals",
    description: "Modal dialog system",
    dependencies: [{ services: ["ModalService"], required: true }],
    category: "ui",
    priority: "medium",
    tags: ["modal", "dialog"],
    icon: "modal",
  },
  {
    id: "tooltips",
    name: "Tooltips",
    description: "Tooltip system for help and guidance",
    dependencies: [{ services: ["TooltipService"], required: true }],
    category: "ui",
    priority: "low",
    tags: ["tooltip", "help"],
    icon: "tooltip",
  },
  {
    id: "breadcrumbs",
    name: "Breadcrumbs",
    description: "Navigation breadcrumb system",
    dependencies: [{ services: ["NavigationService"], required: true }],
    category: "ui",
    priority: "low",
    tags: ["breadcrumb", "navigation"],
    icon: "breadcrumb",
  },
];


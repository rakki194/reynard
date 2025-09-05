/**
 * Icon Categories Index
 * Exports all icon categories for easy importing
 */

export { actionIcons } from "./actions";
export { navigationIcons } from "./navigation";
export { fileIcons } from "./files";
export { statusIcons } from "./status";
export { mediaIcons } from "./media";
export { interfaceIcons } from "./interface";
export { developmentIcons } from "./development";
export { themeIcons } from "./theme";
export { animalIcons } from "./animals";
export { securityIcons } from "./security";
export { customIcons } from "./custom";

// Combined icon map with all categories
import { actionIcons } from "./actions";
import { navigationIcons } from "./navigation";
import { fileIcons } from "./files";
import { statusIcons } from "./status";
import { mediaIcons } from "./media";
import { interfaceIcons } from "./interface";
import { developmentIcons } from "./development";
import { themeIcons } from "./theme";
import { animalIcons } from "./animals";
import { securityIcons } from "./security";
import { customIcons } from "./custom";

export const allIcons = {
  ...actionIcons,
  ...navigationIcons,
  ...fileIcons,
  ...statusIcons,
  ...mediaIcons,
  ...interfaceIcons,
  ...developmentIcons,
  ...themeIcons,
  ...animalIcons,
  ...securityIcons,
  ...customIcons,
} as const;

// Category metadata for organization
export const iconCategories = {
  actions: {
    name: "Actions",
    description: "Icons for user actions like add, delete, edit, etc.",
    icons: actionIcons,
  },
  navigation: {
    name: "Navigation",
    description: "Icons for navigation, arrows, and directional movement",
    icons: navigationIcons,
  },
  files: {
    name: "Files & Documents",
    description: "Icons for files, documents, and file operations",
    icons: fileIcons,
  },
  status: {
    name: "Status & Feedback",
    description: "Icons for status indicators, alerts, and feedback",
    icons: statusIcons,
  },
  media: {
    name: "Media",
    description: "Icons for audio, video, images, and media controls",
    icons: mediaIcons,
  },
  interface: {
    name: "Interface & UI",
    description:
      "Icons for user interface elements, controls, and interactions",
    icons: interfaceIcons,
  },
  development: {
    name: "Development",
    description: "Icons for development tools, code, and technical operations",
    icons: developmentIcons,
  },
  theme: {
    name: "Theme & Visual",
    description: "Icons for themes, visual effects, and decorative elements",
    icons: themeIcons,
  },
  animals: {
    name: "Animals",
    description: "Icons for animals and creatures",
    icons: animalIcons,
  },
  security: {
    name: "Security & Auth",
    description: "Icons for security, authentication, and user management",
    icons: securityIcons,
  },
  custom: {
    name: "Custom Icons",
    description: "Custom SVG icons from yipyap and other sources",
    icons: customIcons,
  },
} as const;

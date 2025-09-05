/**
 * Icons Export
 * Re-exports commonly used icons from @reynard/fluent-icons
 */

import { fluentIconsPackage } from "@reynard/fluent-icons";

// Helper function to get icon as raw SVG
export const getIconSvg = (name: string) => {
  return fluentIconsPackage.getIcon(name);
};

// Helper function to get icon as HTML string
export const getIconHtml = (name: string) => {
  const icon = fluentIconsPackage.getIcon(name);
  return icon ? icon.outerHTML : "";
};

/**
 * Icons Export
 * Re-exports commonly used icons from reynard-fluent-icons
 */
import { getIcon as getIconFromRegistry } from "reynard-fluent-icons";
// Helper function to get icon as raw SVG
export const getIconSvg = (name) => {
    return getIconFromRegistry(name);
};
// Helper function to get icon as HTML string
export const getIconHtml = (name) => {
    const icon = getIconFromRegistry(name);
    return icon || "";
};
// Re-export Icon component and related types
export * from "./Icon";

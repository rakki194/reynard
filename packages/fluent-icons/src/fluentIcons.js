/**
 * Fluent UI Icons Package
 *
 * Provides Fluent UI icons for the Reynard design system.
 * Comprehensive collection of icons from yipyap, organized by category.
 */
import { allIcons } from "./categories";
// Icon cache for performance
const iconCache = new Map();
const offscreen = document.createElement("span");
/**
 * Convert SVG string to SVGElement
 */
function createSVGElement(svgString) {
    offscreen.innerHTML = svgString;
    return offscreen.children[0];
}
/**
 * Fluent UI Icons Package Implementation
 */
export const fluentIconsPackage = {
    id: "fluent-ui",
    name: "Fluent UI Icons",
    version: "1.1.307",
    getIcon(name) {
        // Check cache first
        let icon = iconCache.get(name);
        if (icon) {
            return icon.cloneNode(true);
        }
        // Get icon from map
        const iconData = allIcons[name];
        if (!iconData) {
            return null;
        }
        // Create and cache SVG element
        icon = createSVGElement(iconData.svg);
        iconCache.set(name, icon);
        return icon.cloneNode(true);
    },
    getIconNames() {
        return Object.keys(allIcons);
    },
    hasIcon(name) {
        return name in allIcons;
    },
    getIconMetadata(name) {
        const iconData = allIcons[name];
        if (!iconData?.metadata) {
            return null;
        }
        // Convert readonly arrays to mutable arrays for compatibility
        return {
            ...iconData.metadata,
            tags: iconData.metadata.tags ? [...iconData.metadata.tags] : undefined,
            keywords: iconData.metadata.keywords
                ? [...iconData.metadata.keywords]
                : undefined,
        };
    },
};
// Export individual icon components for convenience (commonly used icons)
export const Search = () => fluentIconsPackage.getIcon("search");
export const Upload = () => fluentIconsPackage.getIcon("upload");
export const FileText = () => fluentIconsPackage.getIcon("file-text");
export const Code = () => fluentIconsPackage.getIcon("code");
export const Database = () => fluentIconsPackage.getIcon("database");
export const Settings = () => fluentIconsPackage.getIcon("settings");
export const Download = () => fluentIconsPackage.getIcon("download");
export const Delete = () => fluentIconsPackage.getIcon("delete");
export const Eye = () => fluentIconsPackage.getIcon("eye");
export const Clock = () => fluentIconsPackage.getIcon("clock");
export const Sparkle = () => fluentIconsPackage.getIcon("sparkle");
export const Brain = () => fluentIconsPackage.getIcon("brain");
// Export the package as default
export default fluentIconsPackage;

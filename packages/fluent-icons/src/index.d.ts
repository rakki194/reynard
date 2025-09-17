/**
 * reynard-fluent-icons
 *
 * Fluent UI icons package for the Reynard design system.
 * Provides a modular icon system with Fluent UI icons.
 */
export type { IconPackage, IconMetadata, IconRegistry, IconSearchResult, } from "./types";
export { iconRegistry, registerIconPackage, unregisterIconPackage, getIcon, getAllIconNames, getIconPackages, searchIcons, } from "./registry";
export { Icon, type IconProps } from "./Icon";
export { fluentIconsPackage, Search, Upload, FileText, Code, Database, Settings, Download, Delete, Eye, Clock, Sparkle, Brain, } from "./fluentIcons";
export { actionIcons, navigationIcons, fileIcons, statusIcons, mediaIcons, interfaceIcons, developmentIcons, themeIcons, animalIcons, securityIcons, customIcons, allIcons, iconCategories, } from "./categories";
export { generateCaption, searchIconsByCaption, getAllCaptions, validateCaption, suggestCaptionImprovements, generateMissingCaptions, exportCaptions, } from "./caption-utils";

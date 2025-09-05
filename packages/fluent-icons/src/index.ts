/**
 * @reynard/fluent-icons
 *
 * Fluent UI icons package for the Reynard design system.
 * Provides a modular icon system with Fluent UI icons.
 */

// Export types
export type {
  IconPackage,
  IconMetadata,
  IconRegistry,
  IconSearchResult,
} from "./types";

// Export registry and utilities
export {
  iconRegistry,
  registerIconPackage,
  unregisterIconPackage,
  getIcon,
  getAllIconNames,
  getIconPackages,
  searchIcons,
} from "./registry";

// Export Fluent UI icons package
export {
  fluentIconsPackage,
  Search,
  Upload,
  FileText,
  Code,
  Database,
  Settings,
  Download,
  Delete,
  Eye,
  Clock,
  Sparkle,
  Brain,
} from "./fluentIcons";

// Export categorized icons
export {
  actionIcons,
  navigationIcons,
  fileIcons,
  statusIcons,
  mediaIcons,
  interfaceIcons,
  developmentIcons,
  themeIcons,
  animalIcons,
  securityIcons,
  customIcons,
  allIcons,
  iconCategories,
} from "./categories";

// Auto-register the Fluent UI icons package
import { fluentIconsPackage } from "./fluentIcons";
import { iconRegistry } from "./registry";

// Register the package automatically
iconRegistry.register(fluentIconsPackage);

/**
 * 🦊 UI Package Definitions
 * =========================
 *
 * User interface package directory definitions for the Reynard project architecture.
 * Contains packages for UI components, themes, animations, and related utilities.
 */

import type { DirectoryDefinition } from "../types.js";
import { createUIPackage } from "../builders/directory-builder.js";
import { buildRelationships, COMMON_RELATIONSHIPS } from "../builders/relationship-builder.js";
import { UI_METADATA } from "../config/metadata.js";

/**
 * UI packages directory definitions
 */
export const UI_PACKAGES: DirectoryDefinition[] = [
  createUIPackage(
    "packages/ui/components-core",
    "packages/ui/components-core",
    "Core UI primitives, navigation, and layout components - provides fundamental UI building blocks including buttons, inputs, navigation, and layout systems",
    {
      importance: "critical",
      relationships: buildRelationships(
        COMMON_RELATIONSHIPS.CORE_DEPENDENCY,
        COMMON_RELATIONSHIPS.FLUENT_ICONS_DEPENDENCY,
        { directory: "packages/ui/components-charts", type: "dependency", description: "Used by chart components" }
      ),
      metadata: UI_METADATA,
    }
  ),

  createUIPackage(
    "packages/ui/games",
    "packages/ui/games",
    "Game engine and ECS (Entity Component System) - provides game development utilities, spatial hash, collision detection, geometry, performance monitoring, and roguelike game systems",
    {
      relationships: buildRelationships(
        COMMON_RELATIONSHIPS.CORE_DEPENDENCY,
        COMMON_RELATIONSHIPS.UI_COMPONENTS_DEPENDENCY
      ),
      metadata: UI_METADATA,
    }
  ),

  createUIPackage(
    "packages/ui/animation",
    "packages/ui/animation",
    "Animation utilities and motion design - provides animation utilities, motion design, transition effects, and animation management for UI components",
    {
      relationships: buildRelationships(
        COMMON_RELATIONSHIPS.CORE_DEPENDENCY,
        COMMON_RELATIONSHIPS.UI_COMPONENTS_DEPENDENCY
      ),
      metadata: UI_METADATA,
    }
  ),

  createUIPackage(
    "packages/ui/colors",
    "packages/ui/colors",
    "Color system and theme management - provides color utilities, theme management, color palettes, and design system color management",
    {
      relationships: buildRelationships(
        COMMON_RELATIONSHIPS.CORE_DEPENDENCY,
        { directory: "packages/ui/themes", type: "dependency", description: "Used by themes" }
      ),
      metadata: UI_METADATA,
    }
  ),

  createUIPackage(
    "packages/ui/components-charts",
    "packages/ui/components-charts",
    "Chart and data visualization components - provides chart components, data visualization, graphing utilities, and interactive chart components",
    {
      relationships: buildRelationships(
        COMMON_RELATIONSHIPS.CORE_DEPENDENCY,
        COMMON_RELATIONSHIPS.UI_COMPONENTS_DEPENDENCY,
        { directory: "packages/ui/charts", type: "dependency", description: "Uses charts utilities" }
      ),
      metadata: UI_METADATA,
    }
  ),

  createUIPackage(
    "packages/ui/components-dashboard",
    "packages/ui/components-dashboard",
    "Dashboard-specific UI components and layouts - provides dashboard components, layout utilities, dashboard-specific UI elements, and dashboard management",
    {
      relationships: buildRelationships(
        COMMON_RELATIONSHIPS.CORE_DEPENDENCY,
        COMMON_RELATIONSHIPS.UI_COMPONENTS_DEPENDENCY,
        { directory: "packages/ui/dashboard", type: "dependency", description: "Uses dashboard utilities" }
      ),
      metadata: UI_METADATA,
    }
  ),

  createUIPackage(
    "packages/ui/components-themes",
    "packages/ui/components-themes",
    "Theme-aware UI components and styling - provides theme-aware components, styling utilities, theme integration, and design system components",
    {
      relationships: buildRelationships(
        COMMON_RELATIONSHIPS.CORE_DEPENDENCY,
        COMMON_RELATIONSHIPS.UI_COMPONENTS_DEPENDENCY,
        COMMON_RELATIONSHIPS.THEMES_DEPENDENCY,
        COMMON_RELATIONSHIPS.COLORS_DEPENDENCY
      ),
      metadata: UI_METADATA,
    }
  ),

  createUIPackage(
    "packages/ui/components-utils",
    "packages/ui/components-utils",
    "Utility components and helper functions - provides utility components, helper functions, common UI utilities, and reusable UI patterns",
    {
      relationships: buildRelationships(
        COMMON_RELATIONSHIPS.CORE_DEPENDENCY,
        COMMON_RELATIONSHIPS.UI_COMPONENTS_DEPENDENCY
      ),
      metadata: UI_METADATA,
    }
  ),

  createUIPackage(
    "packages/ui/dashboard",
    "packages/ui/dashboard",
    "Dashboard layout and functionality - provides dashboard layouts, dashboard management, dashboard utilities, and dashboard-specific functionality",
    {
      relationships: buildRelationships(
        COMMON_RELATIONSHIPS.CORE_DEPENDENCY,
        COMMON_RELATIONSHIPS.UI_COMPONENTS_DEPENDENCY,
        { directory: "packages/ui/components-dashboard", type: "dependency", description: "Uses dashboard components" }
      ),
      metadata: UI_METADATA,
    }
  ),

  createUIPackage(
    "packages/ui/error-boundaries",
    "packages/ui/error-boundaries",
    "Error handling and boundary components - provides error boundary components, error handling, error recovery, and error management utilities",
    {
      relationships: buildRelationships(
        COMMON_RELATIONSHIPS.CORE_DEPENDENCY,
        COMMON_RELATIONSHIPS.UI_COMPONENTS_DEPENDENCY
      ),
      metadata: UI_METADATA,
    }
  ),

  createUIPackage(
    "packages/ui/floating-panel",
    "packages/ui/floating-panel",
    "Floating panel and overlay components - provides floating panel components, overlay management, modal systems, and floating UI elements",
    {
      relationships: buildRelationships(
        COMMON_RELATIONSHIPS.CORE_DEPENDENCY,
        COMMON_RELATIONSHIPS.UI_COMPONENTS_DEPENDENCY,
        { directory: "packages/ui/animation", type: "dependency", description: "Uses animation utilities" }
      ),
      metadata: UI_METADATA,
    }
  ),

  createUIPackage(
    "packages/ui/monaco",
    "packages/ui/monaco",
    "Monaco editor integration and code editing - provides Monaco editor integration, code editing capabilities, syntax highlighting, and code editor utilities",
    {
      relationships: buildRelationships(
        COMMON_RELATIONSHIPS.CORE_DEPENDENCY,
        COMMON_RELATIONSHIPS.UI_COMPONENTS_DEPENDENCY
      ),
      metadata: UI_METADATA,
    }
  ),

  createUIPackage(
    "packages/ui/themes",
    "packages/ui/themes",
    "Theme system and styling management - provides theme management, styling systems, design tokens, and theme switching capabilities",
    {
      relationships: buildRelationships(
        COMMON_RELATIONSHIPS.CORE_DEPENDENCY,
        COMMON_RELATIONSHIPS.COLORS_DEPENDENCY,
        { directory: "packages/ui/components-themes", type: "dependency", description: "Used by theme components" }
      ),
      metadata: UI_METADATA,
    }
  ),

  createUIPackage(
    "packages/ui/ui",
    "packages/ui/ui",
    "UI utilities and layout management - provides UI utilities, layout management, responsive design, and UI helper functions",
    {
      relationships: buildRelationships(
        COMMON_RELATIONSHIPS.CORE_DEPENDENCY,
        COMMON_RELATIONSHIPS.UI_COMPONENTS_DEPENDENCY
      ),
      metadata: UI_METADATA,
    }
  ),

  createUIPackage(
    "packages/ui/charts",
    "packages/ui/charts",
    "Chart and data visualization components - provides comprehensive charting capabilities, data visualization tools, and interactive chart components",
    {
      relationships: buildRelationships(
        COMMON_RELATIONSHIPS.CORE_DEPENDENCY,
        COMMON_RELATIONSHIPS.UI_COMPONENTS_DEPENDENCY,
        { directory: "packages/data/repository-core", type: "dependency", description: "Uses repository for chart data" }
      ),
      metadata: UI_METADATA,
    }
  ),

  createUIPackage(
    "packages/ui/fluent-icons",
    "packages/ui/fluent-icons",
    "Microsoft Fluent Icons integration - provides comprehensive icon system with Fluent Design icons, icon components, and icon utilities",
    {
      relationships: buildRelationships(
        COMMON_RELATIONSHIPS.CORE_DEPENDENCY,
        { directory: "packages/ui/components-core", type: "dependency", description: "Used by UI components" }
      ),
      metadata: UI_METADATA,
    }
  ),
];

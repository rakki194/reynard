/**
 * 🦊 Documentation Package Definitions
 * ====================================
 *
 * Documentation package directory definitions for the Reynard project architecture.
 * Contains packages for documentation generation, diagram creation, and docs management.
 */

import type { DirectoryDefinition } from "../types.js";
import { createDocsPackage } from "../builders/directory-builder.js";
import { buildRelationships, COMMON_RELATIONSHIPS } from "../builders/relationship-builder.js";
import { DOCS_METADATA } from "../config/metadata.js";

/**
 * Documentation packages directory definitions
 */
export const DOCS_PACKAGES: DirectoryDefinition[] = [
  createDocsPackage(
    "packages/docs/diagram-generator",
    "packages/docs/diagram-generator",
    "Mermaid and flowchart generation for technical documentation - provides diagram generation, flowchart creation, and visual documentation tools",
    {
      relationships: buildRelationships(COMMON_RELATIONSHIPS.CORE_DEPENDENCY, {
        directory: "packages/docs/docs-generator",
        type: "dependency",
        description: "Used by docs generator",
      }),
      metadata: DOCS_METADATA,
    }
  ),

  createDocsPackage(
    "packages/docs/docs-components",
    "packages/docs/docs-components",
    "UI components specifically designed for documentation - provides documentation-specific UI components, layouts, and interactive elements",
    {
      relationships: buildRelationships(
        COMMON_RELATIONSHIPS.CORE_DEPENDENCY,
        COMMON_RELATIONSHIPS.UI_COMPONENTS_DEPENDENCY,
        { directory: "packages/docs/docs-core", type: "dependency", description: "Uses docs core" }
      ),
      metadata: DOCS_METADATA,
    }
  ),

  createDocsPackage(
    "packages/docs/docs-core",
    "packages/docs/docs-core",
    "Documentation engine, processing, and content management - provides core documentation processing, content management, and documentation engine capabilities",
    {
      relationships: buildRelationships(COMMON_RELATIONSHIPS.CORE_DEPENDENCY, {
        directory: "packages/docs/docs-generator",
        type: "dependency",
        description: "Used by docs generator",
      }),
      metadata: DOCS_METADATA,
    }
  ),

  createDocsPackage(
    "packages/docs/docs-site",
    "packages/docs/docs-site",
    "Static site generation for documentation websites - provides static site generation, documentation website creation, and site deployment capabilities",
    {
      relationships: buildRelationships(
        COMMON_RELATIONSHIPS.CORE_DEPENDENCY,
        { directory: "packages/docs/docs-generator", type: "dependency", description: "Uses docs generator" },
        { directory: "packages/docs/docs-components", type: "dependency", description: "Uses docs components" }
      ),
      metadata: DOCS_METADATA,
    }
  ),

  createDocsPackage(
    "packages/docs/docs-generator",
    "packages/docs/docs-generator",
    "Documentation generator - provides automated documentation generation, content processing, and documentation site building capabilities",
    {
      relationships: buildRelationships(
        COMMON_RELATIONSHIPS.CORE_DEPENDENCY,
        { directory: "packages/docs/docs-core", type: "dependency", description: "Uses docs core" },
        { directory: "packages/docs/docs-site", type: "dependency", description: "Generates docs site" }
      ),
      metadata: DOCS_METADATA,
    }
  ),
];

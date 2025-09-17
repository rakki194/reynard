/**
 * 🦊 Diagram Generators Index
 *
 * Exports all available diagram generators for the Reynard project.
 */

import { ArchitectureOverviewGenerator } from "./ArchitectureOverviewGenerator.js";
import { PackageDependenciesGenerator } from "./PackageDependenciesGenerator.js";
import { ComponentRelationshipsGenerator } from "./ComponentRelationshipsGenerator.js";
import { FileStructureGenerator } from "./FileStructureGenerator.js";

export {
  ArchitectureOverviewGenerator,
  PackageDependenciesGenerator,
  ComponentRelationshipsGenerator,
  FileStructureGenerator,
};

// Export generator registry
export const DIAGRAM_GENERATORS = [
  ArchitectureOverviewGenerator,
  PackageDependenciesGenerator,
  ComponentRelationshipsGenerator,
  FileStructureGenerator,
] as const;

export type DiagramGeneratorClass = (typeof DIAGRAM_GENERATORS)[number];

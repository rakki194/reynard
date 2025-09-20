/**
 * 🦊 Diagram Generators Index
 *
 * Exports all available diagram generators for the Reynard project.
 */

import { ArchitectureOverviewGenerator } from "./ArchitectureOverviewGenerator.js";
import { PackageDependenciesGenerator } from "./PackageDependenciesGenerator.js";
import { ComponentRelationshipsGenerator } from "./ComponentRelationshipsGenerator.js";
import { FileStructureGenerator } from "./FileStructureGenerator.js";
import { FrontendBackendRelationshipGenerator } from "./FrontendBackendRelationshipGenerator.js";
import { DetailedEcosystemGenerator } from "./DetailedEcosystemGenerator.js";

export {
  ArchitectureOverviewGenerator,
  PackageDependenciesGenerator,
  ComponentRelationshipsGenerator,
  FileStructureGenerator,
  FrontendBackendRelationshipGenerator,
  DetailedEcosystemGenerator,
};

// Export generator registry
export const DIAGRAM_GENERATORS = [
  new ArchitectureOverviewGenerator(),
  new PackageDependenciesGenerator(),
  new ComponentRelationshipsGenerator(),
  new FileStructureGenerator(),
  new FrontendBackendRelationshipGenerator(),
  new DetailedEcosystemGenerator(),
];

export type DiagramGeneratorClass = (typeof DIAGRAM_GENERATORS)[number];

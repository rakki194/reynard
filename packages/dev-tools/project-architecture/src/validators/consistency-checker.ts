/**
 * 🦊 Consistency Checker
 * ======================
 *
 * Consistency checking functions for the Reynard project architecture system.
 * Provides validation for cross-references and dependency consistency.
 */

import type { DirectoryDefinition, ProjectArchitecture } from "../types.js";

/**
 * Check for circular dependencies in directory relationships
 */
export function checkCircularDependencies(architecture: ProjectArchitecture): string[] {
  const errors: string[] = [];
  const directoryMap = new Map<string, DirectoryDefinition>();
  
  // Build directory map
  for (const directory of architecture.directories) {
    directoryMap.set(directory.name, directory);
  }

  // Check each directory for circular dependencies
  for (const directory of architecture.directories) {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    
    if (hasCircularDependency(directory, directoryMap, visited, recursionStack)) {
      errors.push(`Circular dependency detected involving directory: ${directory.name}`);
    }
  }

  return errors;
}

/**
 * Recursive function to detect circular dependencies
 */
function hasCircularDependency(
  directory: DirectoryDefinition,
  directoryMap: Map<string, DirectoryDefinition>,
  visited: Set<string>,
  recursionStack: Set<string>
): boolean {
  if (recursionStack.has(directory.name)) {
    return true;
  }
  
  if (visited.has(directory.name)) {
    return false;
  }

  visited.add(directory.name);
  recursionStack.add(directory.name);

  for (const relationship of directory.relationships) {
    if (relationship.type === "dependency") {
      const dependentDirectory = directoryMap.get(relationship.directory);
      if (dependentDirectory) {
        if (hasCircularDependency(dependentDirectory, directoryMap, visited, recursionStack)) {
          return true;
        }
      }
    }
  }

  recursionStack.delete(directory.name);
  return false;
}

/**
 * Check for missing directory references in relationships
 */
export function checkMissingDirectoryReferences(architecture: ProjectArchitecture): string[] {
  const errors: string[] = [];
  const directoryNames = new Set(architecture.directories.map(d => d.name));

  for (const directory of architecture.directories) {
    for (const relationship of directory.relationships) {
      if (!directoryNames.has(relationship.directory)) {
        errors.push(`Directory ${directory.name} references non-existent directory: ${relationship.directory}`);
      }
    }
  }

  return errors;
}

/**
 * Check for orphaned directories (directories with no relationships)
 */
export function checkOrphanedDirectories(architecture: ProjectArchitecture): string[] {
  const warnings: string[] = [];
  const referencedDirectories = new Set<string>();

  // Collect all referenced directories
  for (const directory of architecture.directories) {
    for (const relationship of directory.relationships) {
      referencedDirectories.add(relationship.directory);
    }
  }

  // Find directories that are not referenced by any other directory
  for (const directory of architecture.directories) {
    if (!referencedDirectories.has(directory.name) && 
        directory.importance !== "excluded" && 
        directory.name !== "packages" && 
        directory.name !== "services" && 
        directory.name !== "examples" && 
        directory.name !== "templates" && 
        directory.name !== "e2e" && 
        directory.name !== "scripts" && 
        directory.name !== "docs" && 
        directory.name !== "backend" && 
        directory.name !== "data" && 
        directory.name !== "nginx" && 
        directory.name !== "fenrir" && 
        directory.name !== "experimental" && 
        directory.name !== ".vscode" && 
        directory.name !== "third_party") {
      warnings.push(`Orphaned directory found: ${directory.name}`);
    }
  }

  return warnings;
}

/**
 * Check for inconsistent importance levels
 */
export function checkInconsistentImportanceLevels(architecture: ProjectArchitecture): string[] {
  const warnings: string[] = [];
  const directoryMap = new Map<string, DirectoryDefinition>();

  // Build directory map
  for (const directory of architecture.directories) {
    directoryMap.set(directory.name, directory);
  }

  // Check for directories that depend on less important directories
  for (const directory of architecture.directories) {
    for (const relationship of directory.relationships) {
      if (relationship.type === "dependency") {
        const dependentDirectory = directoryMap.get(relationship.directory);
        if (dependentDirectory) {
          const importanceOrder = { "critical": 4, "important": 3, "optional": 2, "excluded": 1 };
          const currentImportance = importanceOrder[directory.importance];
          const dependentImportance = importanceOrder[dependentDirectory.importance];
          
          if (currentImportance > dependentImportance) {
            warnings.push(
              `Directory ${directory.name} (${directory.importance}) depends on less important directory ${dependentDirectory.name} (${dependentDirectory.importance})`
            );
          }
        }
      }
    }
  }

  return warnings;
}

/**
 * Check for missing core dependencies
 */
export function checkMissingCoreDependencies(architecture: ProjectArchitecture): string[] {
  const warnings: string[] = [];
  const coreDirectories = ["packages/core/core", "packages/core/validation"];

  for (const directory of architecture.directories) {
    if (directory.category === "source" && 
        directory.importance !== "excluded" && 
        !directory.name.startsWith("packages/core/") &&
        !directory.name.startsWith("services/") &&
        !directory.name.startsWith("backend/")) {
      
      const hasCoreDependency = directory.relationships.some(
        rel => rel.type === "dependency" && coreDirectories.includes(rel.directory)
      );

      if (!hasCoreDependency) {
        warnings.push(`Directory ${directory.name} should depend on core utilities`);
      }
    }
  }

  return warnings;
}

/**
 * Run all consistency checks
 */
export function runAllConsistencyChecks(architecture: ProjectArchitecture): {
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Run error checks
  errors.push(...checkCircularDependencies(architecture));
  errors.push(...checkMissingDirectoryReferences(architecture));

  // Run warning checks
  warnings.push(...checkOrphanedDirectories(architecture));
  warnings.push(...checkInconsistentImportanceLevels(architecture));
  warnings.push(...checkMissingCoreDependencies(architecture));

  return { errors, warnings };
}

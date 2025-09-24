/**
 * 🦊 Architecture Validator
 * =========================
 *
 * Architecture validation functions for the Reynard project architecture system.
 * Provides validation utilities for ensuring architectural consistency and correctness.
 */

import type { DirectoryDefinition, ProjectArchitecture } from "../types.js";

/**
 * Validate a directory definition
 */
export function validateDirectoryDefinition(directory: DirectoryDefinition): string[] {
  const errors: string[] = [];

  // Required fields validation
  if (!directory.name) {
    errors.push("Directory name is required");
  }
  if (!directory.path) {
    errors.push("Directory path is required");
  }
  if (!directory.category) {
    errors.push("Directory category is required");
  }
  if (!directory.importance) {
    errors.push("Directory importance is required");
  }
  if (!directory.description) {
    errors.push("Directory description is required");
  }

  // Path validation
  if (directory.path && !directory.path.startsWith("packages/") && 
      !directory.path.startsWith("services/") && 
      !directory.path.startsWith("examples/") && 
      !directory.path.startsWith("templates/") && 
      !directory.path.startsWith("e2e/") && 
      !directory.path.startsWith("scripts/") && 
      !directory.path.startsWith("docs/") && 
      !directory.path.startsWith("backend/") && 
      !directory.path.startsWith("data/") && 
      !directory.path.startsWith("nginx/") && 
      !directory.path.startsWith("fenrir/") && 
      !directory.path.startsWith("experimental/") && 
      !directory.path.startsWith(".vscode/") && 
      !directory.path.startsWith("third_party/") && 
      directory.path !== "packages" && 
      directory.path !== "services" && 
      directory.path !== "examples" && 
      directory.path !== "templates" && 
      directory.path !== "e2e" && 
      directory.path !== "scripts" && 
      directory.path !== "docs" && 
      directory.path !== "backend" && 
      directory.path !== "data" && 
      directory.path !== "nginx" && 
      directory.path !== "fenrir" && 
      directory.path !== "experimental" && 
      directory.path !== ".vscode" && 
      directory.path !== "third_party") {
    errors.push(`Invalid directory path: ${directory.path}`);
  }

  // File types validation
  if (!directory.fileTypes || directory.fileTypes.length === 0) {
    errors.push("Directory must have at least one file type");
  }

  // Relationships validation
  if (directory.relationships) {
    for (const relationship of directory.relationships) {
      if (!relationship.directory) {
        errors.push("Relationship directory is required");
      }
      if (!relationship.type) {
        errors.push("Relationship type is required");
      }
      if (!relationship.description) {
        errors.push("Relationship description is required");
      }
    }
  }

  return errors;
}

/**
 * Validate the entire project architecture
 */
export function validateProjectArchitecture(architecture: ProjectArchitecture): string[] {
  const errors: string[] = [];

  // Basic validation
  if (!architecture.name) {
    errors.push("Project name is required");
  }
  if (!architecture.rootPath) {
    errors.push("Project root path is required");
  }
  if (!architecture.directories || architecture.directories.length === 0) {
    errors.push("Project must have at least one directory");
  }

  // Validate each directory
  if (architecture.directories) {
    for (const directory of architecture.directories) {
      const directoryErrors = validateDirectoryDefinition(directory);
      errors.push(...directoryErrors.map(error => `${directory.name}: ${error}`));
    }
  }

  // Check for duplicate directory names
  if (architecture.directories) {
    const names = architecture.directories.map(d => d.name);
    const duplicates = names.filter((name, index) => names.indexOf(name) !== index);
    if (duplicates.length > 0) {
      errors.push(`Duplicate directory names found: ${duplicates.join(", ")}`);
    }
  }

  // Check for duplicate directory paths
  if (architecture.directories) {
    const paths = architecture.directories.map(d => d.path);
    const duplicates = paths.filter((path, index) => paths.indexOf(path) !== index);
    if (duplicates.length > 0) {
      errors.push(`Duplicate directory paths found: ${duplicates.join(", ")}`);
    }
  }

  return errors;
}

/**
 * Check if a directory definition is valid
 */
export function isValidDirectoryDefinition(directory: DirectoryDefinition): boolean {
  return validateDirectoryDefinition(directory).length === 0;
}

/**
 * Check if the project architecture is valid
 */
export function isValidProjectArchitecture(architecture: ProjectArchitecture): boolean {
  return validateProjectArchitecture(architecture).length === 0;
}

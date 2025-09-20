/**
 * 🦊 Reynard Project Architecture
 *
 * Centralized project structure definition with semantic and syntactic pathing.
 * This is the single source of truth for all project structure information.
 */

// Core architecture definition
export {
  REYNARD_ARCHITECTURE,
  getWatchableDirectories,
  getBuildableDirectories,
  getTestableDirectories,
  getLintableDirectories,
  getDocumentableDirectories,
  getGlobalExcludePatterns,
  getGlobalIncludePatterns,
} from "./architecture.js";

// Utility functions
export {
  resolvePath,
  directoryExists,
  getDirectoryDefinition,
  getDirectoryDefinitionByPath,
  queryDirectories,
  getDirectoryPaths,
  getDirectoriesByCategory,
  getDirectoriesByImportance,
  getRelatedDirectories,
  shouldExcludeFile,
  shouldIncludeFile,
  getFileTypeFromExtension,
  getDirectoryForFilePath,
  validateProjectStructure,
  generateProjectStructureReport,
  // Enhanced utility functions
  getDirectoryHealth,
  updateDirectoryMetadata,
  getDirectoriesByHealth,
  getBuildConfiguration,
  getTestConfiguration,
  getLintConfiguration,
} from "./utils.js";

// VS Code integration
export {
  generateVSCodeTasksConfig,
  generateVSCodeWorkspaceConfig,
  generateQueueWatcherTask,
  generateAutoStartQueueWatcherTask,
  generateBuildTasks,
  generateTestTasks,
  generateLintTasks,
  generateAdvancedTasks,
} from "./vscode-generator.js";

// Dependency analysis
export {
  DependencyAnalyzer,
} from "./dependency-analyzer.js";

// Type definitions
export type {
  DirectoryCategory,
  FileType,
  ImportanceLevel,
  RelationshipType,
  DirectoryDefinition,
  DirectoryRelationship,
  ProjectArchitecture,
  PathResolutionOptions,
  DirectoryQueryResult,
  // Enhanced type definitions
  BuildConfiguration,
  TestConfiguration,
  LintConfiguration,
  DirectoryMetadata,
} from "./types.js";

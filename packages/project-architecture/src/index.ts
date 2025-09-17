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
  getGlobalIncludePatterns
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
  generateProjectStructureReport
} from "./utils.js";

// VS Code integration
export {
  generateVSCodeTasksConfig,
  generateVSCodeWorkspaceConfig,
  generateQueueWatcherTask,
  generateAutoStartQueueWatcherTask,
  generateBuildTasks,
  generateTestTasks,
  generateLintTasks
} from "./vscode-generator.js";

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
  DirectoryQueryResult
} from "./types.js";

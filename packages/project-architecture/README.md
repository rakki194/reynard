# 🦊 Reynard Project Architecture

**Centralized project structure definition with semantic and syntactic pathing**

[![npm version](https://img.shields.io/npm/v/reynard-project-architecture.svg)](https://www.npmjs.com/package/reynard-project-architecture)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

## Overview

The `reynard-project-architecture` package serves as the **single source of truth** for all project structure information in the Reynard monorepo. It provides comprehensive definitions of directories, their relationships, file patterns, and operational characteristics, enabling consistent behavior across all development tools, watchers, and build systems.

## Features

- 🏗️ **Centralized Architecture Definition**: Single source of truth for all project structure
- 🔍 **Semantic Directory Classification**: Categorizes directories by purpose and importance
- 📁 **Relationship Mapping**: Defines how directories relate to each other
- 🎯 **Pattern-Based Filtering**: Global and directory-specific include/exclude patterns
- ⚡ **Query System**: Advanced filtering and querying capabilities
- 🛠️ **VS Code Integration**: Generates VS Code task configurations
- 📊 **Validation & Reporting**: Project structure validation and detailed reports
- 🔧 **Utility Functions**: Comprehensive helper functions for common operations

## Installation

```bash
pnpm add reynard-project-architecture
```

## Quick Start

```typescript
import { 
  REYNARD_ARCHITECTURE,
  getWatchableDirectories,
  getBuildableDirectories,
  queryDirectories,
  shouldIncludeFile
} from 'reynard-project-architecture';

// Get all watchable directories
const watchableDirs = getWatchableDirectories();
console.log('Watchable directories:', watchableDirs);

// Query directories by category
const sourceDirs = queryDirectories({ category: 'source' });
console.log('Source directories:', sourceDirs.directories);

// Check if a file should be included
const shouldInclude = shouldIncludeFile('packages/components/src/Button.tsx');
console.log('Should include file:', shouldInclude);
```

## Architecture Definition

The package defines a comprehensive project architecture with the following components:

### Directory Categories

- **`source`**: Source code directories (packages, backend)
- **`documentation`**: Documentation and guides (docs, .cursor/docs)
- **`configuration`**: Configuration files and settings (.cursor/rules, nginx)
- **`build`**: Build artifacts and outputs
- **`testing`**: Test files and test data (e2e)
- **`scripts`**: Automation and utility scripts
- **`data`**: Data files and datasets
- **`templates`**: Project templates and examples
- **`services`**: Microservices and standalone services
- **`third-party`**: External dependencies and third-party code
- **`cache`**: Cache and temporary files
- **`tools`**: Development tools and utilities

### Importance Levels

- **`critical`**: Essential for project operation
- **`important`**: Important for development workflow
- **`optional`**: Optional but useful
- **`excluded`**: Should be excluded from most operations

### Directory Properties

Each directory definition includes:

- **Basic Info**: Name, path, category, importance
- **File Types**: Primary file types in the directory
- **Operational Flags**: watchable, buildable, testable, lintable, documentable
- **Relationships**: How directories relate to each other
- **Patterns**: Include/exclude patterns for file filtering
- **Metadata**: Optional, generated, third-party flags

## API Reference

### Core Architecture

#### `REYNARD_ARCHITECTURE`

The main architecture definition object containing all directory definitions and global configuration.

```typescript
import { REYNARD_ARCHITECTURE } from 'reynard-project-architecture';

console.log(REYNARD_ARCHITECTURE.name); // "Reynard"
console.log(REYNARD_ARCHITECTURE.directories.length); // 17
```

#### Directory Filter Functions

```typescript
import { 
  getWatchableDirectories,
  getBuildableDirectories,
  getTestableDirectories,
  getLintableDirectories,
  getDocumentableDirectories
} from 'reynard-project-architecture';

// Get directories by operational type
const watchable = getWatchableDirectories(); // ["packages", "backend", "docs", ...]
const buildable = getBuildableDirectories(); // ["packages", "backend", "examples", ...]
const testable = getTestableDirectories();   // ["packages", "backend", "e2e", ...]
```

#### Global Patterns

```typescript
import { 
  getGlobalExcludePatterns,
  getGlobalIncludePatterns 
} from 'reynard-project-architecture';

const excludePatterns = getGlobalExcludePatterns(); // ["**/node_modules/**", "**/dist/**", ...]
const includePatterns = getGlobalIncludePatterns(); // ["**/*.ts", "**/*.py", ...]
```

### Utility Functions

#### Directory Queries

```typescript
import { queryDirectories, getDirectoryPaths } from 'reynard-project-architecture';

// Query with multiple filters
const result = queryDirectories({
  category: 'source',
  importance: 'critical',
  watchable: true
});

console.log(result.directories); // Matching directories
console.log(result.count);       // Number of matches
console.log(result.executionTime); // Query execution time

// Get just the paths
const paths = getDirectoryPaths({ category: 'source' });
```

#### Directory Information

```typescript
import { 
  getDirectoryDefinition,
  getDirectoryDefinitionByPath,
  getDirectoriesByCategory,
  getDirectoriesByImportance,
  getRelatedDirectories
} from 'reynard-project-architecture';

// Get directory by name
const packages = getDirectoryDefinition('packages');
console.log(packages?.description); // "Main source code packages..."

// Get directory by path
const backend = getDirectoryDefinitionByPath('backend');

// Get directories by category
const sourceDirs = getDirectoriesByCategory('source');
const criticalDirs = getDirectoriesByImportance('critical');

// Get related directories
const relatedToPackages = getRelatedDirectories('packages');
```

#### File Pattern Matching

```typescript
import { 
  shouldExcludeFile,
  shouldIncludeFile,
  getFileTypeFromExtension,
  getDirectoryForFilePath
} from 'reynard-project-architecture';

// Check file inclusion/exclusion
const shouldExclude = shouldExcludeFile('node_modules/react/index.js'); // true
const shouldInclude = shouldIncludeFile('packages/components/src/Button.tsx'); // true

// Get file type from extension
const fileType = getFileTypeFromExtension('Button.tsx'); // "typescript"

// Get directory for file path
const directory = getDirectoryForFilePath('packages/components/src/Button.tsx');
console.log(directory?.name); // "packages"
```

#### Project Validation

```typescript
import { 
  validateProjectStructure,
  generateProjectStructureReport
} from 'reynard-project-architecture';

// Validate project structure
const validation = validateProjectStructure();
console.log(validation.valid); // true/false
console.log(validation.errors); // Array of error messages

// Generate comprehensive report
const report = generateProjectStructureReport();
console.log(report); // Markdown-formatted report
```

### VS Code Integration

```typescript
import { 
  generateVSCodeTasksConfig,
  generateVSCodeWorkspaceConfig,
  generateQueueWatcherTask
} from 'reynard-project-architecture';

// Generate complete VS Code tasks configuration
const tasksConfig = generateVSCodeTasksConfig();

// Generate workspace configuration
const workspaceConfig = generateVSCodeWorkspaceConfig();

// Generate specific task
const watcherTask = generateQueueWatcherTask();
```

## Example Usage

Here's a comprehensive example demonstrating the package's capabilities:

```typescript
import { 
  REYNARD_ARCHITECTURE,
  getWatchableDirectories,
  queryDirectories,
  shouldIncludeFile,
  getDirectoryDefinition,
  validateProjectStructure
} from 'reynard-project-architecture';

// 1. Basic architecture information
console.log(`Project: ${REYNARD_ARCHITECTURE.name}`);
console.log(`Total directories: ${REYNARD_ARCHITECTURE.directories.length}`);

// 2. Get watchable directories for file watchers
const watchableDirs = getWatchableDirectories();
console.log('Watchable directories:', watchableDirs);

// 3. Query critical source directories
const criticalSource = queryDirectories({ 
  category: 'source', 
  importance: 'critical' 
});
console.log('Critical source directories:', criticalSource.directories);

// 4. Check file patterns
const testFiles = [
  'packages/components/src/Button.tsx',
  'node_modules/react/index.js',
  'dist/build.js',
  'docs/README.md'
];

testFiles.forEach(file => {
  const shouldInclude = shouldIncludeFile(file);
  console.log(`${file}: ${shouldInclude ? 'Include' : 'Exclude'}`);
});

// 5. Get directory information
const packages = getDirectoryDefinition('packages');
if (packages) {
  console.log(`Packages directory: ${packages.description}`);
  console.log(`Relationships: ${packages.relationships.length}`);
}

// 6. Validate project structure
const validation = validateProjectStructure();
console.log(`Project structure valid: ${validation.valid}`);
```

## Directory Structure

The package defines the following directory structure for the Reynard project:

```
reynard/
├── packages/           # Main source code packages (critical)
├── backend/           # Python backend services (critical)
├── services/          # Microservices and standalone services (important)
├── docs/              # Project documentation (critical)
├── examples/          # Example applications (important)
├── templates/         # Project templates (important)
├── e2e/               # End-to-end tests (important)
├── scripts/           # Automation scripts (important)
├── data/              # Data files and datasets (optional)
├── todos/             # TODO lists and task tracking (optional)
├── nginx/             # Nginx configuration (optional)
├── fenrir/            # Development tools (optional)
├── third_party/       # Third-party dependencies (excluded)
└── .cursor/           # Cursor IDE configuration
    ├── docs/          # IDE-specific documentation
    ├── prompts/       # Prompt templates
    └── rules/         # Coding standards
```

## File Pattern System

The package includes a comprehensive file pattern system for filtering:

### Global Exclude Patterns

- `**/node_modules/**` - Node.js dependencies
- `**/dist/**` - Build outputs
- `**/build/**` - Build artifacts
- `**/coverage/**` - Test coverage reports
- `**/.git/**` - Git repository files
- `**/third_party/**` - Third-party code
- And many more...

### Global Include Patterns

- `**/*.ts` - TypeScript files
- `**/*.tsx` - TypeScript React files
- `**/*.js` - JavaScript files
- `**/*.py` - Python files
- `**/*.md` - Markdown files
- `**/*.json` - JSON files
- And more...

### Directory-Specific Patterns

Each directory can have its own include/exclude patterns that override or supplement the global patterns.

## Relationship System

Directories can have relationships with each other:

- **`parent`**: Parent directory
- **`child`**: Child directory
- **`sibling`**: Sibling directory
- **`dependency`**: Dependency relationship
- **`generated`**: Generated from this directory
- **`configures`**: Configures this directory
- **`tests`**: Tests this directory
- **`documents`**: Documents this directory

Example relationships:

- `packages` → `examples` (sibling: "Examples use packages")
- `packages` → `e2e` (tests: "E2E tests test packages")
- `docs` → `packages` (documents: "Documents package APIs")

## Configuration Options

The package supports various configuration options for queries:

```typescript
interface PathResolutionOptions {
  absolute?: boolean;           // Resolve to absolute paths
  includeOptional?: boolean;    // Include optional directories
  includeGenerated?: boolean;   // Include generated directories
  includeThirdParty?: boolean;  // Include third-party directories
  category?: DirectoryCategory; // Filter by category
  importance?: ImportanceLevel; // Filter by importance
  watchable?: boolean;          // Filter by watchable flag
  buildable?: boolean;          // Filter by buildable flag
  testable?: boolean;           // Filter by testable flag
  lintable?: boolean;           // Filter by lintable flag
  documentable?: boolean;       // Filter by documentable flag
}
```

## Testing

The package includes comprehensive tests covering:

- Architecture definition validation
- Directory filtering functions
- File pattern matching
- Query system functionality
- Utility functions
- Edge cases and error handling

Run tests with:

```bash
pnpm test
```

## Development

### Building

```bash
pnpm build
```

### Linting

```bash
pnpm lint
pnpm lint:fix
```

### Type Checking

```bash
pnpm type-check
```

### Validation

```bash
pnpm validate
```

## Contributing

When contributing to this package:

1. **Update Architecture**: Modify `src/architecture.ts` to reflect structural changes
2. **Add Tests**: Ensure new functionality is thoroughly tested
3. **Update Types**: Add new types to `src/types.ts` if needed
4. **Document Changes**: Update this README for significant changes
5. **Validate**: Run `pnpm validate` before submitting

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Related Packages

- `reynard-queue-watcher` - File watching system that uses this architecture
- `reynard-build-system` - Build system that uses this architecture
- `reynard-testing` - Testing utilities that use this architecture

---

*🦊 Part of the Reynard Framework - Cunning agile development tools*

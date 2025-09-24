# 🦊 Reynard Incremental Linting

Incremental linting system with queue management for the Reynard monorepo. This package provides efficient, gentle linting that doesn't overwhelm the system with subprocesses.

## Features

- **Incremental Linting**: Only lints files that have changed
- **Queue Management**: Prevents subprocess explosion with intelligent queuing
- **Multiple Linters**: Supports ESLint, Ruff, MyPy, Markdownlint, Shellcheck
- **VS Code Integration**: Real-time linting with Language Server Protocol
- **Caching**: Persistent cache for faster subsequent runs
- **Configurable**: Flexible configuration for different project needs

## Installation

```bash
# Install dependencies
pnpm install

# Build the package
pnpm build
```

## Usage

### CLI Usage

```bash
# Start the linting service
reynard-incremental-linting start

# Lint specific files
reynard-incremental-linting lint src/**/*.ts

# Show status
reynard-incremental-linting status

# Initialize configuration
reynard-incremental-linting init
```

### Programmatic Usage

```typescript
import { IncrementalLintingService, createDefaultConfig } from "reynard-incremental-linting";

// Create configuration
const config = createDefaultConfig("/path/to/project");

// Create service
const service = new IncrementalLintingService(config);

// Start service
await service.start();

// Lint files
const results = await service.lintFiles(["src/file.ts"]);

// Stop service
await service.stop();
```

## Configuration

The system uses a JSON configuration file (`.reynard-linting.json`) with the following structure:

```json
{
  "rootPath": "/path/to/project",
  "linters": [
    {
      "name": "eslint",
      "enabled": true,
      "command": "npx",
      "args": ["eslint", "--format", "json"],
      "patterns": ["**/*.ts", "**/*.tsx"],
      "excludePatterns": ["**/node_modules/**"],
      "maxFileSize": 1048576,
      "timeout": 30000,
      "parallel": true,
      "priority": 10
    }
  ],
  "includePatterns": ["packages/**/*", "backend/**/*"],
  "excludePatterns": ["**/node_modules/**", "**/dist/**"],
  "debounceDelay": 1000,
  "maxConcurrency": 4,
  "incremental": true,
  "persistCache": true,
  "lintOnSave": true,
  "lintOnChange": false
}
```

## Supported Linters

- **ESLint**: TypeScript/JavaScript linting
- **Ruff**: Python linting (replaces Pylint, Flake8, Black, isort)
- **MyPy**: Python type checking
- **Markdownlint**: Markdown linting
- **Shellcheck**: Shell script linting

## VS Code Integration

The companion VS Code extension provides:

- Real-time linting as you type
- Status bar integration
- Command palette commands
- Configuration management
- Language Server Protocol support

## Architecture

The system consists of several key components:

1. **IncrementalLintingService**: Main service orchestrating linting
2. **LintingQueueManager**: Manages file processing queues
3. **LintingProcessors**: Individual linter implementations
4. **VSCodeLintingProvider**: VS Code integration layer

## Performance

- **Queue-based Processing**: Prevents subprocess explosion
- **Incremental Analysis**: Only processes changed files
- **Intelligent Caching**: Reduces redundant work
- **Configurable Concurrency**: Limits resource usage
- **Debounced File Watching**: Reduces noise from rapid changes

## Development

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Type checking
pnpm typecheck

# Build in watch mode
pnpm dev
```

## License

MIT

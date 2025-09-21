# 🦊 Vitest Configuration Generator

A modular TypeScript tool that generates Vitest configurations from the Reynard project architecture.

## Overview

This tool automatically generates comprehensive Vitest configurations by analyzing the project architecture, eliminating the need for manual configuration of 20+ test projects in a monorepo.

## Features

- **Architecture-Driven**: Uses project architecture definitions to generate configurations
- **Modular Design**: Clean separation of concerns with TypeScript modules
- **Flexible Configuration**: Customizable coverage thresholds, environments, and project inclusion
- **Validation**: Built-in configuration validation and error handling
- **Backup Support**: Automatically backs up existing configurations
- **CLI Interface**: Command-line interface with comprehensive options

## Installation

```bash
cd packages/dev-tools/vitest-config-generator
pnpm install
pnpm build
```

## Usage

### Basic Usage

```bash
# Generate default configuration
node dist/cli.js

# Generate with verbose output
node dist/cli.js --verbose

# Generate to specific file
node dist/cli.js --output vitest.config.ts
```

### Advanced Options

```bash
# Custom coverage thresholds
node dist/cli.js --branches 90 --functions 95 --lines 95 --statements 95

# Include/exclude project types
node dist/cli.js --include-examples --include-templates --include-scripts

# Custom environment and workers
node dist/cli.js --environment node --max-workers 4

# Backup and validate
node dist/cli.js --backup --validate
```

### CLI Options

| Option | Description | Default |
|--------|-------------|---------|
| `-v, --verbose` | Enable verbose output | `false` |
| `-o, --output <path>` | Output file path | `vitest.generated.config.ts` |
| `--include-examples` | Include example projects | `true` |
| `--include-templates` | Include template projects | `true` |
| `--include-scripts` | Include script projects | `false` |
| `--max-workers <number>` | Maximum number of workers | `1` |
| `--environment <env>` | Test environment | `happy-dom` |
| `--branches <number>` | Coverage threshold for branches | `80` |
| `--functions <number>` | Coverage threshold for functions | `85` |
| `--lines <number>` | Coverage threshold for lines | `85` |
| `--statements <number>` | Coverage threshold for statements | `85` |
| `--backup` | Create backup of existing configuration | `true` |
| `--validate` | Validate generated configuration | `true` |

## Architecture

The tool follows a modular design pattern similar to other Reynard validation tools:

```
src/
├── cli.ts                    # Command-line interface
├── index.ts                  # Main exports
├── types.ts                  # Type definitions
├── logger.ts                 # Logging utility
├── vitestConfigGenerator.ts  # Main generator class
├── projectConfigGenerator.ts # Individual project config generator
├── configWriter.ts           # File writing and validation
└── __tests__/                # Test files
```

### Key Components

- **VitestConfigGenerator**: Main class that orchestrates the generation process
- **ProjectConfigGenerator**: Generates individual project configurations
- **ConfigWriter**: Handles file writing, backup, and validation
- **VitestConfigLogger**: Provides structured logging

## Generated Configuration

The tool generates a complete Vitest configuration including:

- **Global Settings**: Workers, timeouts, reporters, coverage
- **Project Configurations**: Individual configs for each testable directory
- **Coverage Thresholds**: Based on directory importance and custom settings
- **Environment Options**: Special configurations for different project types
- **File Patterns**: Include/exclude patterns from architecture definitions

## Integration with Project Architecture

The tool integrates with the `reynard-project-architecture` package to:

- Discover testable directories using `getTestableDirectories()`
- Get directory definitions using `getDirectoryDefinition()`
- Apply global exclude patterns using `getGlobalExcludePatterns()`
- Respect directory relationships and importance levels

## Testing

```bash
# Run tests
pnpm test

# Run tests with coverage
pnpm test --coverage
```

## Development

```bash
# Build in watch mode
pnpm dev

# Lint code
pnpm lint

# Fix linting issues
pnpm lint:fix
```

## Examples

### Generate Configuration for Packages Only

```bash
node dist/cli.js --include-examples false --include-templates false
```

### High Coverage Thresholds

```bash
node dist/cli.js --branches 95 --functions 98 --lines 98 --statements 98
```

### Node Environment with Multiple Workers

```bash
node dist/cli.js --environment node --max-workers 4
```

## Future Enhancements

- Integration with actual `reynard-project-architecture` package
- Support for custom project configurations
- Integration with build systems
- Real-time configuration updates
- Web interface for configuration management

## License

MIT License - see [LICENSE](../../../LICENSE.md) file for details.

---

_🦊 Part of the Reynard Framework - Cunning agile development tools_

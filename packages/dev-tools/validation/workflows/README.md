# 🐺 Workflow Shell Extractor

A TypeScript tool for extracting and validating shell scripts embedded in GitHub Actions workflows. This tool systematically hunts down every shell script vulnerability in GitHub workflow files, ensuring bulletproof CI/CD security.

## Features

- **🔍 Script Extraction**: Automatically extracts shell scripts from GitHub Actions workflow files
- **✅ Validation**: Validates extracted scripts using shellcheck
- **🔧 Auto-fixing**: Automatically fixes common shell script issues
- **📊 Reporting**: Comprehensive reporting with detailed statistics
- **🎯 TypeScript**: Fully typed with comprehensive interfaces
- **⚡ Performance**: Efficient processing with configurable limits

## Installation

```bash
# Install dependencies
pnpm install

# Build the project
pnpm run build
```

## Usage

### Command Line Interface

```bash
# Basic usage
pnpm start

# With verbose output
pnpm start --verbose

# Enable auto-fixing
pnpm start --fix

# Custom workflow directory
pnpm start --workflow-dir ./workflows

# Custom shellcheck configuration
pnpm start --shellcheck-rc ./custom.shellcheckrc
```

### Programmatic Usage

```typescript
import { WorkflowShellExtractor } from "./src/WorkflowShellExtractor.js";

const extractor = new WorkflowShellExtractor({
  workflowDir: ".github/workflows",
  verbose: true,
  fixMode: false,
});

const result = await extractor.processWorkflows();
console.log(`Processed ${result.summary.totalScripts} scripts`);
```

## Configuration Options

| Option            | Type     | Default                          | Description                               |
| ----------------- | -------- | -------------------------------- | ----------------------------------------- |
| `workflowDir`     | string   | `.github/workflows`              | Directory containing workflow files       |
| `tempDir`         | string   | `/tmp/workflow_shell_extraction` | Temporary directory for script extraction |
| `shellcheckRc`    | string   | `.shellcheckrc`                  | Path to shellcheck configuration file     |
| `verbose`         | boolean  | `false`                          | Enable verbose output                     |
| `fixMode`         | boolean  | `false`                          | Enable automatic fixing mode              |
| `maxScripts`      | number   | `1000`                           | Maximum number of scripts to process      |
| `includePatterns` | string[] | `['*.yml', '*.yaml']`            | File patterns to include                  |
| `excludePatterns` | string[] | `['*.test.yml', '*.test.yaml']`  | File patterns to exclude                  |

## Development

### Scripts

```bash
# Build the project
pnpm run build

# Watch mode for development
pnpm run dev

# Run tests
pnpm run test

# Lint code
pnpm run lint

# Fix linting issues
pnpm run lint:fix

# Clean build artifacts
pnpm run clean
```

### Project Structure

```text
src/
├── types.ts                    # TypeScript type definitions
├── WorkflowShellExtractor.ts   # Main extractor class
├── cli.ts                      # Command-line interface
└── index.ts                    # Main export file
```

## Types

The project includes comprehensive TypeScript types:

- `WorkflowScript`: Represents an extracted shell script
- `ValidationResult`: Results from shellcheck validation
- `ScriptFix`: Represents a fix that can be applied to a script
- `ExtractorOptions`: Configuration options for the extractor
- `ProcessResult`: Complete processing results with metadata

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run the linter and tests
6. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Acknowledgments

- Built for the Reynard Framework
- Uses shellcheck for shell script validation
- Inspired by the need for bulletproof CI/CD security

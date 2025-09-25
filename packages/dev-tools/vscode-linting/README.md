# Reynard Incremental Linting

🦊 A VS Code extension for the Reynard incremental linting system, providing real-time linting with queue management for large monorepos.

## Features

- **Incremental Linting**: Only lints changed files for better performance
- **Queue Management**: Intelligent queuing system to handle large codebases
- **Real-time Feedback**: Instant linting results as you type
- **Configurable**: Customizable linting behavior and settings
- **Monorepo Support**: Optimized for large monorepo structures

## Commands

- `Reynard Linting: Toggle` - Enable/disable the linting service
- `Reynard Linting: Lint Current File` - Lint the currently active file
- `Reynard Linting: Lint Workspace` - Lint all files in the workspace
- `Reynard Linting: Clear All Issues` - Clear all linting issues
- `Reynard Linting: Show Configuration` - Display current configuration
- `Reynard Linting: Reload Configuration` - Reload configuration from file

## Configuration

The extension can be configured through VS Code settings:

```json
{
  "reynard-linting.enabled": true,
  "reynard-linting.lintOnSave": true,
  "reynard-linting.lintOnChange": false,
  "reynard-linting.maxConcurrency": 4,
  "reynard-linting.debounceDelay": 1000
}
```

### Settings

- `reynard-linting.enabled`: Enable/disable the extension
- `reynard-linting.lintOnSave`: Run linting when files are saved
- `reynard-linting.lintOnChange`: Run linting when files are changed
- `reynard-linting.maxConcurrency`: Maximum concurrent linting processes
- `reynard-linting.debounceDelay`: Debounce delay for file changes (ms)

## Requirements

- VS Code 1.60.0 or higher
- Node.js 18.0.0 or higher

## Installation

1. Install the extension from the VS Code marketplace
2. Or install from a `.vsix` file:

   ```bash
   code --install-extension reynard-vscode-linting-0.1.0.vsix
   ```

## Development

### Building

```bash
pnpm build
```

### Packaging

```bash
pnpm package
```

This creates a `.vsix` file that can be installed in VS Code.

### Testing

```bash
pnpm test
```

## License

MIT

## Contributing

This extension is part of the Reynard monorepo. See the main repository for contribution guidelines.

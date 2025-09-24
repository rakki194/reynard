# Change Log

All notable changes to the "reynard-vscode-linting" extension will be documented in this file.

## [0.1.0] - 2025-01-15

### Added

- Initial release of Reynard Incremental Linting VS Code extension
- Incremental linting with queue management
- Real-time linting feedback
- Configurable linting behavior
- Support for large monorepo structures
- Command palette integration
- Status bar integration
- Configuration management
- File watching and change detection
- Diagnostic collection and display

### Features

- Toggle linting service on/off
- Lint current file or entire workspace
- Clear all linting issues
- Show and reload configuration
- Automatic activation on workspace with `.reynard-linting.json`
- Debounced file change detection
- Concurrent linting process management

### Configuration

- `reynard-linting.enabled`: Enable/disable the extension
- `reynard-linting.lintOnSave`: Run linting when files are saved
- `reynard-linting.lintOnChange`: Run linting when files are changed
- `reynard-linting.maxConcurrency`: Maximum concurrent linting processes
- `reynard-linting.debounceDelay`: Debounce delay for file changes

### Commands

- `reynard-linting.toggle`: Toggle Reynard Linting
- `reynard-linting.lintFile`: Lint Current File
- `reynard-linting.lintWorkspace`: Lint Workspace
- `reynard-linting.clearIssues`: Clear All Issues
- `reynard-linting.showConfig`: Show Configuration
- `reynard-linting.reloadConfig`: Reload Configuration

---

**Enjoy using Reynard Incremental Linting!** 🦊

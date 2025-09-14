# Development Tools

This directory contains utilities for development workflow management and tool integration.

## Files

- `husky-toolkit-manager.js` - Node.js script for managing Husky git hooks and development tools
- `pnpm-dev-wrapper.sh` - Wrapper script for PNPM development commands

## Husky Toolkit Manager

The `husky-toolkit-manager.js` provides a unified interface for managing development tools and git hooks:

- Tool status checking
- Dependency validation
- Automated tool execution
- Development workflow management

## PNPM Dev Wrapper

The `pnpm-dev-wrapper.sh` script provides enhanced PNPM development functionality with:

- Development server queue management
- Port conflict detection
- Auto-reload information
- Multi-agent support

## Usage

```bash
# Manage development tools
node husky-toolkit-manager.js

# Use PNPM wrapper
bash pnpm-dev-wrapper.sh dev
```

These tools integrate with the broader Reynard development ecosystem to provide a smooth development experience.

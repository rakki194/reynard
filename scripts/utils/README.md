# Scripts Utils Directory

This directory contains utility scripts organized by functionality for better maintainability and discoverability.

## Directory Structure

```
utils/
├── agent-naming/          # Agent naming and robot name generation
├── dev-tools/            # Development workflow tools
├── mcp/                  # Model Context Protocol integration
└── README.md            # This file
```

## Quick Reference

### Agent Naming (`agent-naming/`)

- Generate robot names with animal spirit themes
- Manage agent name assignments
- Comprehensive naming guide and conventions

### Development Tools (`dev-tools/`)

- Husky git hooks management
- PNPM development wrapper
- Development workflow automation

### MCP Integration (`mcp/`)

- Model Context Protocol server
- Cursor IDE integration
- Agent naming via MCP

## Usage Examples

```bash
# Generate a fox-themed name
python3 agent-naming/robot-name-generator.py --spirit fox

# Start MCP server
bash mcp/start-mcp-server.sh

# Manage development tools
node dev-tools/husky-toolkit-manager.js
```

## Documentation

Each subdirectory contains its own README with detailed documentation:

- [Agent Naming Guide](agent-naming/README.md)
- [Development Tools](dev-tools/README.md)
- [MCP Integration](mcp/README.md)

_red fur gleams with satisfaction_ The utils directory is now organized with the strategic precision of a fox, making it easy to find and use the right tool for any development task!

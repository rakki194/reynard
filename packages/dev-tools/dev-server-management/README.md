# 🦊 Dev Server Management

A comprehensive TypeScript-based development server management system for the Reynard monorepo. This package provides a unified CLI interface for managing multiple development servers across packages, examples, and templates.

## Features

- **🚀 Unified CLI**: Single command interface for all development servers
- **📊 Process Management**: Start, stop, and monitor multiple servers
- **🔧 Configuration-Driven**: JSON-based configuration for all projects
- **⚡ Detached Mode**: Run servers in the background with proper process detachment
- **📈 Health Monitoring**: Built-in health checks and status reporting
- **🎯 Port Management**: Automatic port allocation and conflict resolution
- **📝 Logging**: Comprehensive logging with file redirection for detached processes

## Installation

The dev-server-management package is already included in the Reynard monorepo. To use it:

```bash
# Build the package
cd packages/dev-server-management
pnpm build

# The CLI will be available as 'dev-server' after building
```

## Quick Start

### List Available Projects

```bash
dev-server list
```

### Start a Development Server

```bash
# Start in foreground (attached)
dev-server start test-app

# Start in background (detached)
dev-server start test-app --detached
```

### Check Server Status

```bash
# Check all servers
dev-server status

# Check specific server
dev-server status test-app
```

### Stop Servers

```bash
# Stop specific server
dev-server stop test-app

# Stop all servers
dev-server stop-all
```

## Configuration

The system uses `dev-server.config.json` in the project root to define available projects:

```json
{
  "projects": {
    "test-app": {
      "name": "test-app",
      "port": 3011,
      "description": "Comprehensive test application",
      "category": "example",
      "autoReload": true,
      "hotReload": true,
      "command": "pnpm",
      "args": ["run", "dev"],
      "cwd": "examples/test-app",
      "healthCheck": {
        "endpoint": "http://localhost:3011/health",
        "timeout": 5000
      }
    }
  }
}
```

### Configuration Options

- **name**: Project identifier
- **port**: Port number for the development server
- **description**: Human-readable description
- **category**: Project category (package, example, template, backend)
- **autoReload**: Enable automatic reloading
- **hotReload**: Enable hot module replacement
- **command**: Command to execute (default: "pnpm")
- **args**: Command arguments (default: ["run", "dev"])
- **cwd**: Working directory for the project
- **healthCheck**: Health check configuration

## CLI Commands

### `dev-server list`

List all available projects with their configuration.

```bash
dev-server list
```

### `dev-server start <project> [options]`

Start a development server for the specified project.

**Options:**

- `--detached`: Run the server in the background
- `--port <number>`: Override the configured port
- `--env <key=value>`: Set environment variables

**Examples:**

```bash
# Start in foreground
dev-server start test-app

# Start in background
dev-server start test-app --detached

# Start with custom port
dev-server start test-app --port 4000

# Start with environment variables
dev-server start frontend --env VITE_API_BASE_URL=http://localhost:8000
```

### `dev-server stop <project>`

Stop a running development server.

```bash
dev-server stop test-app
```

### `dev-server stop-all`

Stop all running development servers.

```bash
dev-server stop-all
```

### `dev-server status [project]`

Show the status of development servers.

```bash
# Show all servers
dev-server status

# Show specific server
dev-server status test-app
```

### `dev-server restart <project>`

Restart a development server.

```bash
dev-server restart test-app
```

## Detached Mode

When using `--detached`, the server runs in the background and the CLI exits immediately. The server's output is redirected to log files in `.dev-server-logs/`:

- `{project}-out.log`: Standard output
- `{project}-err.log`: Error output

## Integration with Package.json

The system integrates with your package.json scripts:

```json
{
  "scripts": {
    "dev:status": "dev-server status",
    "dev:list": "dev-server list",
    "dev:stop-all": "dev-server stop-all"
  }
}
```

## VS Code Integration

VS Code tasks are configured to use the new system:

```json
{
  "label": "🚀 Dev Server Manager - Status",
  "type": "shell",
  "command": "dev-server",
  "args": ["status"]
}
```

## Architecture

The dev-server-management package consists of:

- **CLI Interface**: Command-line interface for user interaction
- **DevServerManager**: Core server management logic
- **ProcessManager**: Process spawning and lifecycle management
- **ConfigManager**: Configuration loading and validation
- **PortManager**: Port allocation and conflict resolution
- **HealthChecker**: Health monitoring and status reporting

## Development

To contribute to the dev-server-management package:

```bash
cd packages/dev-server-management

# Install dependencies
pnpm install

# Build the package
pnpm build

# Run tests
pnpm test

# Watch mode for development
pnpm dev
```

## Migration from Legacy System

The legacy shell-based dev server system has been replaced with this TypeScript-based solution. All references have been updated:

- ✅ `package.json` scripts updated
- ✅ VS Code tasks updated
- ✅ Documentation updated
- ✅ Configuration migrated

## Troubleshooting

### Server Won't Start

1. Check if the port is already in use:

   ```bash
   dev-server status
   ```

2. Verify the project configuration in `dev-server.config.json`

3. Check the log files in `.dev-server-logs/`

### Detached Mode Issues

If detached mode isn't working properly:

1. Ensure the project has a valid `cwd` configuration
2. Check that the command and args are correct
3. Verify file permissions for log directory creation

### Port Conflicts

The system automatically manages port allocation, but if you encounter conflicts:

1. Check `dev-server status` for port usage
2. Update the port in `dev-server.config.json`
3. Restart the conflicting server

## License

Part of the Reynard monorepo. See the main project license for details.

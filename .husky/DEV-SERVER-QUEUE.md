# 🦊 Reynard Development Server Queue

A smart development server management system that prevents port conflicts and provides helpful information for multiple agents working on the Reynard project.

## Features

- **Port Conflict Prevention**: Automatically detects when a port is already in use
- **Auto-reload Information**: Reminds agents that servers have auto-reload enabled
- **Multi-agent Support**: Multiple developers can work on different projects simultaneously
- **Status Monitoring**: Easy way to see all running development servers
- **Smart Project Detection**: Automatically identifies project types and configurations

## Quick Start

### Check Server Status

```bash
# Show all running development servers
bash .husky/dev-server-queue.sh status

# Or use the global script
bash scripts/dev-server-manager.sh status
```

### Start a Development Server

```bash
# From any project directory
pnpm run dev

# Or use the global manager
bash scripts/dev-server-manager.sh start test-app
```

### Stop Servers

```bash
# Stop a specific project
bash scripts/dev-server-manager.sh stop test-app

# Stop all development servers
bash scripts/dev-server-manager.sh stop-all
```

## Port Configuration

Each project has a dedicated port to prevent conflicts:

### Packages (3000-3007)

- `reynard-core`: 3000
- `reynard-components`: 3001
- `reynard-charts`: 3002
- `reynard-themes`: 3003
- `reynard-fluent-icons`: 3004
- `reynard-3d`: 3005
- `reynard-algorithms`: 3006
- `reynard-colors`: 3007

### Examples (3008-3014)

- `basic-app`: 3008
- `auth-app`: 3009
- `i18n-demo`: 3010
- `comprehensive-dashboard`: 3011
- `clock`: 3012
- `3d-demo`: 3013
- `algo-bench`: 3014

### Backend & E2E

- `backend`: 8000
- `e2e`: 3015

## How It Works

### 1. Pre-Development Hook

When you run `pnpm run dev`, the system automatically:

- Checks for port conflicts
- Shows helpful information about auto-reload
- Prevents starting duplicate servers

### 2. Conflict Detection

If a port is already in use, you'll see:

```
❌ Port 3001 is already in use!
   Process: MainThrea 755727
   URL: http://localhost:3001

💡 Solutions:
   1. Stop the existing server: kill the process above
   2. Use the existing server (it has auto-reload enabled)
   3. Check if another agent is already working on this project
```

### 3. Auto-reload Reminders

The system reminds you that:

- All servers have auto-reload enabled
- No need to restart when making changes
- Multiple agents can work simultaneously

## Integration with Package.json

Add these scripts to your `package.json` for easy access:

```json
{
  "scripts": {
    "dev:status": "bash .husky/dev-server-queue.sh status",
    "dev:check": "bash .husky/dev-server-queue.sh check .",
    "dev:stop-all": "bash scripts/dev-server-manager.sh stop-all"
  }
}
```

## Global Commands

### Development Server Manager

```bash
# List all available projects
bash scripts/dev-server-manager.sh list

# Start a specific project
bash scripts/dev-server-manager.sh start test-app

# Stop a specific project
bash scripts/dev-server-manager.sh stop test-app

# Stop all servers
bash scripts/dev-server-manager.sh stop-all

# Show help
bash scripts/dev-server-manager.sh help
```

## Configuration

The system uses `.husky/dev-server-config.json` to define:

- Port assignments
- Project descriptions
- Auto-reload settings
- Hot-reload capabilities

## Troubleshooting

### Port Already in Use

1. Check what's running: `bash .husky/dev-server-queue.sh status`
2. Stop the conflicting process or use the existing server
3. Remember: auto-reload is enabled, so you don't need to restart

### Project Not Found

- Make sure the project is listed in `dev-server-config.json`
- Check that you're in the correct directory
- Use `bash scripts/dev-server-manager.sh list` to see available projects

### Permission Issues

Make sure the scripts are executable:

```bash
chmod +x .husky/dev-server-queue.sh
chmod +x .husky/pre-dev
chmod +x .husky/pnpm-dev-wrapper.sh
chmod +x scripts/dev-server-manager.sh
```

## Benefits for Multiple Agents

- **No Conflicts**: Each project has its own port
- **Clear Communication**: Status shows what's running and where
- **Auto-reload**: No need to coordinate restarts
- **Easy Management**: Simple commands to start/stop projects
- **Helpful Messages**: Clear guidance when conflicts occur

## Example Workflow

```bash
# Agent 1: Working on charts package
cd packages/reynard-charts
pnpm run dev  # Starts on port 3002

# Agent 2: Working on test app
cd examples/test-app
pnpm run dev  # Starts on port 3001

# Both agents can work simultaneously without conflicts!
# Auto-reload handles code changes automatically
```

🦊 _The fox has outfoxed development server conflicts!_

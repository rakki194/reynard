# 🦊 Reynard Development Scripts

This directory contains development scripts for the Reynard project.

## Migration Notice

**The queue watcher has been migrated to a dedicated package!**

The queue-based file watcher functionality has been moved to the `reynard-queue-watcher` package located at `packages/queue-watcher/`. This provides better modularity, testing, and maintainability.

### New Usage

```bash
# Start the queue watcher
pnpm --filter reynard-queue-watcher watch

# Process a single file
pnpm --filter reynard-queue-watcher start <file-path>

# Get help
pnpm --filter reynard-queue-watcher start --help
```

### VS Code Tasks

The VS Code tasks have been updated to use the new package. You can find the queue watcher tasks in the VS Code task runner.

## Remaining Files

The following files remain in this directory for other development purposes:

- **`start-backend.sh`** - Script to start the Python backend server
- **`dev-setup.sh`** - Development environment setup script
- **`setup-*.sh`** - Various setup scripts for different components
- **`dev-server-*.sh`** - Development server management scripts
- **`python-dev-setup.sh`** - Python development environment setup
- **`*.py`** - Python development utilities

## For Queue Watcher Functionality

Please refer to the `packages/queue-watcher/` directory for the new queue-based file watcher implementation.

---

_Built with the cunning of a fox, the thoroughness of an otter, and the determination of a wolf._ 🦊🦦🐺

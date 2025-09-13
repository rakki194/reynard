# 🐺> Global Vitest Process Queue System

_alpha wolf dominance_ This system coordinates all vitest processes across the entire Reynard ecosystem,
ensuring that no more than 4 vitest processes run concurrently, even when
multiple agents are working on the codebase simultaneously.

## Overview

The Global Vitest Queue System provides:

- **Single Process Per Agent**: Each agent runs exactly 1 vitest process (no child processes)
- **Global Process Limiting**: Maximum of 4 vitest processes across all agents
- **Queue Management**: Automatic queuing when limit is reached
- **Agent Coordination**: Each agent gets a unique identifier and slot
- **Process Monitoring**: Real-time tracking of active processes
- **Automatic Cleanup**: Dead process detection and cleanup

## Quick Start

### For Single Agent (Main Development)

```bash
# Run tests with global queue
pnpm run test:global

# Run tests in watch mode
pnpm run test:global:watch

# Run tests with coverage
pnpm run test:global:coverage

# Check queue status
pnpm run test:global:status

# Clean up dead processes
pnpm run test:global:cleanup
```

### For Multiple Agents (CI/CD, Multiple Developers)

Each agent should use a unique identifier:

```bash
# Agent 1
source vitest.env.global && VITEST_AGENT_ID=agent-1 ./scripts/vitest-global-queue.sh run agent-1 --run

# Agent 2
source vitest.env.global && VITEST_AGENT_ID=agent-2 ./scripts/vitest-global-queue.sh run agent-2 --coverage

# Agent 3
source vitest.env.global && VITEST_AGENT_ID=agent-3 ./scripts/vitest-global-queue.sh run agent-3 test:unit

# Agent 4
source vitest.env.global && VITEST_AGENT_ID=agent-4 ./scripts/vitest-global-queue.sh run agent-4 --run

# Agent 5 (will wait in queue until a slot opens)
source vitest.env.global && VITEST_AGENT_ID=agent-5 ./scripts/vitest-global-queue.sh run agent-5 --run
```

## Configuration Files

### Global Configuration (`vitest.global.config.ts`)

The main configuration file that all processes inherit from:

```typescript
export default defineConfig({
  test: {
    maxWorkers: 1, // Single worker per agent
    pool: "forks", // Use forks for better isolation
    poolOptions: {
      forks: {
        maxForks: 1, // Single fork per agent
        singleFork: true, // Force single fork
      },
    },
    fileParallelism: false, // Disable file parallelism
    isolate: false, // Reduce process overhead
    // ... other settings
  },
});
```

### Environment Configuration (`vitest.env.global`)

Environment variables that control global behavior:

```bash
VITEST_MAX_WORKERS=1        # Single worker per agent
VITEST_MAX_FORKS=1          # Single fork per agent
VITEST_SINGLE_FORK=true     # Force single fork
VITEST_FILE_PARALLELISM=false # Disable file parallelism
VITEST_GLOBAL_QUEUE=1       # Enable global queue mode
VITEST_MAX_PROCESSES=4      # Maximum concurrent processes
VITEST_QUEUE_TIMEOUT=300    # Timeout in seconds
```

## Queue Management Script

The `scripts/vitest-global-queue.sh` script provides:

### Commands

- `status` - Show current queue status and active processes
- `cleanup` - Remove dead processes from the queue
- `run <agent_id> [args...]` - Run vitest with queue management

### Features

- **Automatic Slot Management**: Waits for available slots
- **Process Registration**: Tracks active processes by PID
- **Timeout Handling**: Prevents infinite waiting
- **Dead Process Cleanup**: Automatically removes dead processes
- **Comprehensive Logging**: Detailed logs for debugging

## Monitoring and Debugging

### Check Queue Status

```bash
./scripts/vitest-global-queue.sh status
```

Output example:

```
=== Vitest Global Queue Status ===
Current vitest processes: 3/4
Registered processes: 3

Active processes:
  PID 12345 (Agent: agent-1, Started: 2025-01-27 10:30:15)
  PID 12346 (Agent: agent-2, Started: 2025-01-27 10:30:20)
  PID 12347 (Agent: agent-3, Started: 2025-01-27 10:30:25)

Queue directory: /tmp/vitest-global-queue
Log file: /tmp/vitest-global-queue/vitest-queue.log
```

### View Queue Logs

```bash
tail -f /tmp/vitest-global-queue/vitest-queue.log
```

### Clean Up Dead Processes

```bash
./scripts/vitest-global-queue.sh cleanup
```

## Integration with Package Configs

All package vitest configurations automatically inherit global settings through
environment variables. The base configuration in `packages/testing/src/config/vitest.base.ts` reads these variables:

```typescript
// Inherits from global environment
maxWorkers: process.env.VITEST_MAX_THREADS ? parseInt(process.env.VITEST_MAX_THREADS) : 4,
pool: (process.env.VITEST_POOL as any) || 'forks',
poolOptions: {
  forks: {
    maxForks: process.env.VITEST_MAX_FORKS ? parseInt(process.env.VITEST_MAX_FORKS) : 4,
  },
},
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Test with Global Queue
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        agent: [agent-1, agent-2, agent-3, agent-4]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "18"
      - run: pnpm install
      - run: |
          source vitest.env.global
          VITEST_AGENT_ID=${{ matrix.agent }} ./scripts/vitest-global-queue.sh run ${{ matrix.agent }} --run
```

### Docker Compose Example

```yaml
version: "3.8"
services:
  test-agent-1:
    build: .
    command: >
      bash -c "source vitest.env.global && 
               VITEST_AGENT_ID=agent-1 ./scripts/vitest-global-queue.sh run agent-1 --run"

  test-agent-2:
    build: .
    command: >
      bash -c "source vitest.env.global && 
               VITEST_AGENT_ID=agent-2 ./scripts/vitest-global-queue.sh run agent-2 --run"

  test-agent-3:
    build: .
    command: >
      bash -c "source vitest.env.global && 
               VITEST_AGENT_ID=agent-3 ./scripts/vitest-global-queue.sh run agent-3 --run"

  test-agent-4:
    build: .
    command: >
      bash -c "source vitest.env.global && 
               VITEST_AGENT_ID=agent-4 ./scripts/vitest-global-queue.sh run agent-4 --run"
```

## Troubleshooting

### Common Issues

1. **Processes Not Starting**: Check if queue directory exists and has proper permissions
2. **Dead Processes**: Run cleanup command to remove dead processes
3. **Timeout Issues**: Increase `VITEST_QUEUE_TIMEOUT` in environment file
4. **Permission Errors**: Ensure script is executable (`chmod +x scripts/vitest-global-queue.sh`)

### Debug Mode

Enable debug logging by setting:

```bash
export VITEST_LOG_LEVEL=debug
export VITEST_ENABLE_MONITORING=true
```

### Manual Process Management

If the queue system fails, you can manually manage processes:

```bash
# Kill all vitest processes
pkill -f vitest

# Check running vitest processes
pgrep -f vitest

# Clean up queue directory
rm -rf /tmp/vitest-global-queue
```

## Performance Considerations

- **Memory Usage**: Each vitest process uses memory; limit prevents OOM
- **CPU Usage**: Controlled parallelism prevents system overload
- **I/O Contention**: Reduced concurrent file operations
- **Network Resources**: Limited concurrent network requests

## Security Considerations

- **Process Isolation**: Each agent runs in isolated processes
- **File Permissions**: Queue directory uses secure permissions
- **Agent Identification**: Unique agent IDs prevent conflicts
- **Timeout Protection**: Prevents runaway processes

## Future Enhancements

- **Dynamic Scaling**: Adjust limits based on system resources
- **Priority Queues**: Different priority levels for different agents
- **Resource Monitoring**: Real-time resource usage tracking
- **Distributed Queues**: Support for multiple machines
- **Web Dashboard**: Web interface for queue monitoring

---

_🐺> This system ensures your testing pack runs with the discipline of
a coordinated wolf pack - no more than 4 processes hunting at once, but maximum efficiency when they do!_

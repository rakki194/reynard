# 🐺> Single Process Enforcement - Enhanced Solution

_alpha wolf dominance_ This document describes the enhanced solution for
enforcing exactly ONE vitest process per agent, preventing the spawning of multiple child processes.

## Problem Identified

The initial implementation was still allowing vitest to spawn multiple child processes per agent,
even with `maxWorkers: 4`. This was because:

1. **`maxWorkers` alone wasn't sufficient** - vitest can still spawn child processes
2. **`poolOptions.forks.maxForks` needed to be set to 1** - to limit child processes
3. **`singleFork: true` was required** - to force single fork per agent
4. **`fileParallelism: false` was needed** - to prevent parallel test file execution

## Enhanced Solution

### Global Configuration (`vitest.global.config.ts`)

```typescript
export default defineConfig({
  test: {
    // Single worker per agent
    maxWorkers: 1,

    // Use forks pool for better process isolation and control
    pool: "forks",
    poolOptions: {
      forks: {
        maxForks: 1, // Single fork per agent
        singleFork: true, // Force single fork
      },
    },

    // Disable file parallelism to prevent multiple test files running simultaneously
    fileParallelism: false,

    // Disable test isolation to reduce process overhead
    isolate: false,

    // ... other settings
  },
});
```

### Environment Variables (`vitest.env.global`)

```bash
# Global process limits - FORCE SINGLE PROCESS PER AGENT
VITEST_MAX_WORKERS=1
VITEST_MAX_FORKS=1
VITEST_SINGLE_FORK=true
VITEST_FILE_PARALLELISM=false
VITEST_GLOBAL_QUEUE=1
```

### Base Configuration Updates

The base vitest configuration now properly reads these environment variables:

```typescript
// 🐺> Global process limits - inherit from global config
maxWorkers: process.env.VITEST_MAX_WORKERS ? parseInt(process.env.VITEST_MAX_WORKERS) : 1,
pool: (process.env.VITEST_POOL as any) || 'forks',
poolOptions: {
  forks: {
    maxForks: process.env.VITEST_MAX_FORKS ? parseInt(process.env.VITEST_MAX_FORKS) : 1,
    singleFork: process.env.VITEST_SINGLE_FORK === 'true' ? true : false,
  },
},
fileParallelism: process.env.VITEST_FILE_PARALLELISM === 'false' ? false : true,
isolate: process.env.VITEST_ISOLATE === 'false' ? false : true,
```

## Key Changes Made

### 1. Configuration Updates

- **`maxWorkers: 1`** - Single worker per agent
- **`maxForks: 1`** - Single fork per agent
- **`singleFork: true`** - Force single fork
- **`fileParallelism: false`** - Disable file parallelism

### 2. Environment Variable Updates

- **`VITEST_MAX_WORKERS=1`** - Single worker
- **`VITEST_MAX_FORKS=1`** - Single fork
- **`VITEST_SINGLE_FORK=true`** - Force single fork
- **`VITEST_FILE_PARALLELISM=false`** - Disable file parallelism

### 3. Queue Script Updates

- Updated environment variable exports
- Updated help text
- Enhanced process monitoring

## Testing the Solution

### Single Process Test Script

Use the new test script to verify single process enforcement:

```bash
./scripts/test-single-process.sh
```

This script:

- Starts a single agent
- Monitors process count for 30 seconds
- Reports maximum processes seen
- Verifies single process enforcement

### Manual Testing

```bash
# Start an agent and monitor processes
VITEST_AGENT_ID=test-agent ./scripts/vitest-global-queue.sh run test-agent --run &

# Monitor process count
watch -n 1 'pgrep -f vitest | wc -l'

# Should show exactly 1 process per agent
```

## Expected Behavior

### Before Enhancement

- 1 agent could spawn 8+ vitest processes
- Multiple child processes per agent
- Unpredictable process counts

### After Enhancement

- 1 agent = exactly 1 vitest process
- No child processes spawned
- Predictable, controlled process counts

## Verification Commands

```bash
# Check queue status
./scripts/vitest-global-queue.sh status

# Test single process enforcement
./scripts/test-single-process.sh

# Monitor processes in real-time
watch -n 1 'pgrep -f vitest | wc -l'

# Show detailed process info
pgrep -f vitest | while read pid; do
  echo "PID: $pid - $(ps -p $pid -o cmd=)"
done
```

## Benefits of Enhanced Solution

### Resource Management

- **Predictable Memory Usage**: Exactly 1 process per agent
- **Controlled CPU Usage**: No unexpected child processes
- **Stable I/O**: Single process per agent

### Development Experience

- **Predictable Behavior**: Always 1 process per agent
- **Easy Debugging**: Clear process hierarchy
- **Reliable Monitoring**: Simple process counting

### System Stability

- **No Process Explosion**: Prevents runaway process spawning
- **Resource Bounds**: Known maximum resource usage
- **Clean Shutdown**: Single process to terminate per agent

## Troubleshooting

### If Multiple Processes Still Appear

1. **Check Environment Variables**:

   ```bash
   echo $VITEST_MAX_WORKERS
   echo $VITEST_MAX_FORKS
   echo $VITEST_SINGLE_FORK
   echo $VITEST_FILE_PARALLELISM
   ```

2. **Verify Configuration**:

   ```bash
   # Check if global config is being used
   vitest --config vitest.global.config.ts --help
   ```

3. **Test with Explicit Flags**:
   ```bash
   vitest --maxWorkers=1 --poolOptions.forks.maxForks=1 --poolOptions.forks.singleFork=true --no-file-parallelism
   ```

### Common Issues

- **Environment not sourced**: Make sure `vitest.env.global` is sourced
- **Config not found**: Ensure `vitest.global.config.ts` exists
- **Permission issues**: Check script permissions with `chmod +x`

## Future Enhancements

- **Process Monitoring Dashboard**: Web interface for real-time monitoring
- **Automatic Process Detection**: Detect and kill rogue processes
- **Resource Usage Tracking**: Monitor memory and CPU per process
- **Process Health Checks**: Verify single process enforcement

---

_🐺> The enhanced solution ensures that each agent runs exactly ONE vitest process,
with no child processes spawned. This provides predictable,
controlled resource usage across the entire Reynard ecosystem._

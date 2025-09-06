# Uvicorn Reload Fix

This document explains the fixes applied to resolve uvicorn reload issues where the server would hang during file changes instead of restarting properly.

## Problem Description

The original issue was that when uvicorn detected changes in backend source files, it would:

1. Stop the server but some threads would hang
2. The subprocess created by uvicorn's reload mechanism would hang
3. The server wouldn't restart properly, requiring manual intervention

## Root Causes

1. **Signal Handler Conflicts**: The application had custom signal handlers that interfered with uvicorn's reload mechanism
2. **Long Shutdown Timeouts**: Background services had long shutdown timeouts that prevented graceful reload
3. **Background Services**: File watchers, caption queues, and other background services weren't properly disabled during reload
4. **Thread Cleanup Issues**: Some background threads weren't being properly cleaned up during the reload process

## Applied Fixes

### 1. Reload Mode Detection

Added detection for uvicorn reload mode to disable problematic features:

```python
# Flag to detect if we're running under uvicorn reload
_is_reload_mode = os.environ.get("UVICORN_RELOAD_PROCESS") == "1"
```

### 2. Signal Handler Improvements

Modified the signal handler to skip custom handling during reload:

```python
def signal_handler(signum, frame):
    """Handle shutdown signals gracefully."""
    global _shutdown_requested, _signal_count
    
    # Skip custom signal handling during uvicorn reload to avoid conflicts
    if _is_reload_mode:
        logger.info(f"Received signal {signum} during reload mode, letting uvicorn handle it...")
        return
    
    # ... rest of signal handling
```

### 3. Optimized Shutdown Timeouts

Optimized shutdown timeouts during reload to balance speed and reliability:

```python
# Use optimized timeout during reload - not too short to cause hanging, not too long to slow reload
timeout = 1.0 if _is_reload_mode else 5.0
await asyncio.wait_for(index_manager.shutdown(), timeout=timeout)
```

### 4. Background Service Management

Disabled background services during reload to prevent hanging:

```python
if not (
    os.environ.get("PYTEST_CURRENT_TEST")
    or os.environ.get("TESTING")
    or os.environ.get("DISABLE_FILE_WATCHING")
    or _is_reload_mode  # Skip file watching during reload to prevent hanging
):
    await file_watcher_manager.start_watching(ROOT_DIR)
```

### 5. Uvicorn Configuration Improvements

Updated uvicorn configuration for better reload handling:

```python
uvicorn.run(
    "app.main:app",
    host="localhost",
    port=backend_port,
    log_level="debug",
    reload=True,
    reload_dirs=["app"],
    # ... other options ...
    timeout_graceful_shutdown=10,  # Increased from 2 to 10 seconds for proper shutdown
    reload_delay=0.5,  # Increased from 0.25 to 0.5 seconds for stability
    reload_includes=["*.py"],  # Explicitly include Python files
)
```

## Services Disabled During Reload

The following services are automatically disabled during reload mode to prevent hanging:

- File watcher manager
- Training script watcher
- Caption request queue manager
- Ollama manager initialization
- Background task cleanup with long timeouts

## Testing

Two test scripts are provided to verify the fix:

1. **`test_reload_fix.py`**: Tests basic uvicorn reload functionality
2. **`test_app_reload.py`**: Tests the actual yipyap application reload

To run the tests:

```bash
# Test basic uvicorn reload
python test_reload_fix.py

# Test yipyap application reload
python test_app_reload.py
```

## Expected Behavior

After the fix, when you modify a backend source file:

1. Uvicorn detects the file change
2. Sends shutdown signal to the subprocess
3. Application performs optimized shutdown (1-10 seconds depending on service complexity)
4. Uvicorn starts a new subprocess
5. Application initializes without background services
6. Server is ready to handle requests

## Recent Improvements (2024-08-04)

- **Increased uvicorn timeout**: Changed from 2s to 10s for `timeout_graceful_shutdown`
- **Optimized service timeouts**: Increased from 0.5s to 1.0s for individual services during reload
- **More aggressive task cancellation**: Always cancel tasks during reload with shorter timeouts
- **Enhanced error handling**: Better timeout and cancellation handling for all services
- **Memory cleanup**: Added garbage collection during reload mode

## Monitoring

To monitor the reload process, check the logs for:

- `"Skipping [service] during reload mode"` messages
- Shorter shutdown timeouts (2s instead of 5s)
- `"Received signal [X] during reload mode, letting uvicorn handle it..."` messages

## Troubleshooting

If reload issues persist:

1. Check for hanging processes: `ps aux | grep uvicorn`
2. Kill hanging processes: `pkill -f uvicorn`
3. Verify environment variables are set correctly
4. Check that no custom signal handlers are interfering

## Performance Impact

The fixes have minimal performance impact:

- **Development**: Slightly faster reloads due to reduced timeouts
- **Production**: No impact (reload is disabled)
- **Memory**: Reduced memory usage during reload due to disabled background services

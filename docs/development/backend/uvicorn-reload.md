# Uvicorn Development with Auto-Reload 🦊

This guide covers using uvicorn's auto-reload feature for efficient FastAPI development in the Reynard ecosystem. Learn how to configure, optimize, and troubleshoot uvicorn reloading for smooth development workflows.

## Overview

Uvicorn's auto-reload feature automatically restarts your FastAPI server when it detects changes in your Python files. This is essential for rapid development cycles and maintaining productivity.

## Quick Start

### Basic Reload Configuration

```python
# main.py
import uvicorn
from fastapi import FastAPI

app = FastAPI(title="Reynard API")

@app.get("/")
async def root():
    return {"message": "Hello from Reynard!"}

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,  # Enable auto-reload
        log_level="info"
    )
```

### Command Line Usage

```bash
# Basic reload
uvicorn main:app --reload

# With custom host and port
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# With specific reload directory
uvicorn main:app --reload --reload-dir ./app
```

## Configuration Options

### Development Settings

```python
uvicorn.run(
    "main:app",
    host="0.0.0.0",
    port=8000,
    reload=True,
    reload_dirs=["app", "lib"],  # Watch specific directories
    reload_delay=0.25,  # Delay between file checks (seconds)
    reload_includes=["*.py"],  # File patterns to watch
    reload_excludes=["*.pyc", "*.pyo", "__pycache__"],  # Patterns to ignore
    log_level="debug",  # More verbose logging
    access_log=True,  # Enable access logs
    use_colors=True,  # Colored output
)
```

### Production vs Development

```python
import os

# Development configuration
if os.getenv("ENVIRONMENT") == "development":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        reload_dirs=["app"],
        log_level="debug",
        access_log=True
    )
else:
    # Production configuration (no reload)
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        workers=4,  # Multiple workers
        log_level="info",
        access_log=False
    )
```

## Advanced Reload Configuration

### Environment-Based Configuration

```python
# config.py
import os
from typing import List

class UvicornConfig:
    def __init__(self):
        self.host = os.getenv("UVICORN_HOST", "0.0.0.0")
        self.port = int(os.getenv("UVICORN_PORT", "8000"))
        self.reload = os.getenv("UVICORN_RELOAD", "true").lower() == "true"
        self.reload_dirs = self._parse_reload_dirs()
        self.log_level = os.getenv("UVICORN_LOG_LEVEL", "info")
    
    def _parse_reload_dirs(self) -> List[str]:
        dirs = os.getenv("UVICORN_RELOAD_DIRS", "app")
        return [d.strip() for d in dirs.split(",")]

# main.py
from config import UvicornConfig

config = UvicornConfig()

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=config.host,
        port=config.port,
        reload=config.reload,
        reload_dirs=config.reload_dirs,
        log_level=config.log_level
    )
```

### Watchfiles Integration

For more advanced file watching capabilities, install uvicorn with watchfiles:

```bash
pip install uvicorn[standard]
```

This enables additional options:

```python
uvicorn.run(
    "main:app",
    reload=True,
    reload_includes=["*.py", "*.yaml", "*.json"],  # Watch multiple file types
    reload_excludes=["*.pyc", "*.pyo", "__pycache__", "*.log"],
    reload_delay=0.5  # Longer delay for stability
)
```

## Reload Mode Detection

Detect when your application is running under uvicorn reload to optimize behavior:

```python
import os

# Detect reload mode
IS_RELOAD_MODE = os.environ.get("UVICORN_RELOAD_PROCESS") == "1"

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    if IS_RELOAD_MODE:
        print("🔄 Running in uvicorn reload mode")
        # Skip heavy initialization during reload
        yield
        return
    
    # Full initialization for normal startup
    print("🚀 Full application startup")
    await initialize_services()
    
    yield
    
    # Cleanup
    await cleanup_services()
```

## Best Practices

### 1. Optimize Startup Time

```python
import asyncio
from contextlib import asynccontextmanager

# Global services
database_pool = None
cache_client = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global database_pool, cache_client
    
    # Skip heavy initialization during reload
    if IS_RELOAD_MODE:
        print("🔄 Skipping heavy initialization during reload")
        yield
        return
    
    # Initialize services only on full startup
    print("🔧 Initializing services...")
    database_pool = await create_database_pool()
    cache_client = await create_cache_client()
    
    yield
    
    # Cleanup
    if database_pool:
        await database_pool.close()
    if cache_client:
        await cache_client.close()

app = FastAPI(lifespan=lifespan)
```

### 2. Handle Background Tasks

```python
import asyncio
from typing import Set

# Track background tasks
background_tasks: Set[asyncio.Task] = set()

async def start_background_service():
    """Start a background service"""
    if IS_RELOAD_MODE:
        print("🔄 Skipping background service during reload")
        return
    
    task = asyncio.create_task(background_worker())
    background_tasks.add(task)
    
    # Clean up completed tasks
    task.add_done_callback(background_tasks.discard)

async def background_worker():
    """Background worker function"""
    while True:
        try:
            # Do background work
            await asyncio.sleep(1)
        except asyncio.CancelledError:
            print("🛑 Background worker cancelled")
            break
```

### 3. Signal Handling

```python
import signal
import sys

def signal_handler(signum, frame):
    """Handle shutdown signals gracefully"""
    if IS_RELOAD_MODE:
        print(f"🔄 Received signal {signum} during reload, letting uvicorn handle it")
        return
    
    print(f"🛑 Received signal {signum}, shutting down gracefully")
    # Custom shutdown logic here
    sys.exit(0)

# Register signal handlers only in non-reload mode
if not IS_RELOAD_MODE:
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
```

## Troubleshooting

### Common Issues

#### 1. Reload Not Working

```bash
# Check if watchfiles is installed
pip install uvicorn[standard]

# Verify file permissions
ls -la your_python_files.py

# Check for syntax errors
python -m py_compile your_file.py
```

#### 2. Slow Reloads

```python
# Optimize reload configuration
uvicorn.run(
    "main:app",
    reload=True,
    reload_dirs=["app"],  # Limit to specific directories
    reload_delay=0.5,  # Increase delay for stability
    reload_excludes=["*.pyc", "__pycache__", "*.log", "*.tmp"]
)
```

#### 3. Hanging Processes

```bash
# Find hanging uvicorn processes
ps aux | grep uvicorn

# Kill hanging processes
pkill -f uvicorn

# Or more specific
pkill -f "uvicorn.*reload"
```

#### 4. Memory Issues

```python
# Add memory cleanup during reload
import gc

@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    
    # Force garbage collection during reload
    if IS_RELOAD_MODE:
        gc.collect()
        print("🧹 Memory cleanup completed")
```

### Debugging Reload Issues

```python
# Enable debug logging
import logging

logging.basicConfig(level=logging.DEBUG)

uvicorn.run(
    "main:app",
    reload=True,
    log_level="debug",
    reload_dirs=["app"]
)
```

## Performance Optimization

### 1. Selective File Watching

```python
# Only watch essential directories
uvicorn.run(
    "main:app",
    reload=True,
    reload_dirs=["app/routes", "app/models"],  # Specific directories only
    reload_includes=["*.py"],  # Only Python files
    reload_excludes=["*_test.py", "*.pyc", "__pycache__"]
)
```

### 2. Optimized Startup

```python
# Lazy loading for development
def get_database():
    """Lazy database connection"""
    if not hasattr(get_database, '_db'):
        get_database._db = create_database_connection()
    return get_database._db

@app.get("/data")
async def get_data():
    db = get_database()  # Only connect when needed
    return await db.fetch_data()
```

## Integration with Development Tools

### 1. VS Code Integration

```json
// .vscode/launch.json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "FastAPI Debug",
            "type": "python",
            "request": "launch",
            "program": "${workspaceFolder}/main.py",
            "console": "integratedTerminal",
            "env": {
                "UVICORN_RELOAD": "true"
            }
        }
    ]
}
```

### 2. Docker Development

```dockerfile
# Dockerfile.dev
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

# Use uvicorn with reload for development
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
```

### 3. Docker Compose

```yaml
# docker-compose.dev.yml
version: '3.8'
services:
  api:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "8000:8000"
    volumes:
      - .:/app  # Mount source code for reload
    environment:
      - UVICORN_RELOAD=true
      - UVICORN_LOG_LEVEL=debug
```

## Monitoring and Logging

### 1. Reload Event Logging

```python
import logging
from uvicorn.config import LOGGING_CONFIG

# Custom logging configuration
LOGGING_CONFIG["formatters"]["default"]["format"] = (
    "%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)

# Add reload-specific logging
class ReloadLogger:
    def __init__(self):
        self.logger = logging.getLogger("reload")
    
    def log_reload_event(self, event_type: str, file_path: str):
        self.logger.info(f"Reload event: {event_type} - {file_path}")

reload_logger = ReloadLogger()
```

### 2. Performance Monitoring

```python
import time
from functools import wraps

def monitor_reload_time(func):
    """Decorator to monitor reload performance"""
    @wraps(func)
    async def wrapper(*args, **kwargs):
        start_time = time.time()
        result = await func(*args, **kwargs)
        reload_time = time.time() - start_time
        
        if IS_RELOAD_MODE:
            print(f"🔄 Reload completed in {reload_time:.2f}s")
        
        return result
    return wrapper
```

## Example: Complete Development Setup

See the `examples/basic-backend` directory for a complete example of a modular FastAPI backend with optimized uvicorn reload configuration.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `UVICORN_HOST` | `127.0.0.1` | Host to bind to |
| `UVICORN_PORT` | `8000` | Port to bind to |
| `UVICORN_RELOAD` | `false` | Enable auto-reload |
| `UVICORN_LOG_LEVEL` | `info` | Logging level |
| `UVICORN_RELOAD_DIRS` | `.` | Comma-separated directories to watch |
| `UVICORN_RELOAD_DELAY` | `0.25` | Delay between file checks |

## Summary

Uvicorn's auto-reload feature is essential for productive FastAPI development. By following these patterns and best practices, you can create a smooth development experience that automatically restarts your server when you make changes, while avoiding common pitfalls and performance issues.

Remember: 🦊 The fox's cunning lies in knowing when to reload quickly and when to take time for proper initialization!

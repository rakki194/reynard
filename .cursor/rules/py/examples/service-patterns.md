# Service Pattern Examples

_Detailed implementations of modular Python service patterns_

## Database Service (Complete Implementation)

```python
# services/database.py (95 lines)
import asyncio
from typing import Dict, Any, Optional
from contextlib import asynccontextmanager

class DatabaseService:
    """Database service with connection pooling and reload optimization"""

    def __init__(self):
        self.connection_pool = None
        self.is_initialized = False
        self.connection_count = 0
        self.max_connections = 10
        self.connection_timeout = 30

    async def initialize(self):
        """Initialize database connection pool"""
        if IS_RELOAD_MODE:
            print("[INFO] Skipping database initialization during reload")
            return

        print("[INFO] Initializing database service...")
        await asyncio.sleep(0.1)  # Simulate connection time

        self.connection_pool = {
            "url": "sqlite:///./reynard.db",
            "pool_size": 5,
            "max_overflow": 10,
            "connections": [],
            "available": [],
            "in_use": []
        }

        # Pre-create some connections
        for i in range(3):
            conn = await self._create_connection()
            self.connection_pool["available"].append(conn)

        self.is_initialized = True
        self.connection_count = 3
        print("[OK] Database service initialized")

    async def _create_connection(self):
        """Create a new database connection"""
        self.connection_count += 1
        connection_id = f"conn_{self.connection_count}"

        return {
            "id": connection_id,
            "created_at": asyncio.get_event_loop().time(),
            "last_used": None,
            "query_count": 0
        }

    async def get_connection(self):
        """Get a database connection from the pool"""
        if not self.is_initialized:
            raise RuntimeError("Database service not initialized")

        # Try to get an available connection
        if self.connection_pool["available"]:
            conn = self.connection_pool["available"].pop()
            self.connection_pool["in_use"].append(conn)
            conn["last_used"] = asyncio.get_event_loop().time()
            print(f"[INFO] Database connection acquired: {conn['id']}")
            return conn

        # Create new connection if under limit
        if len(self.connection_pool["in_use"]) < self.max_connections:
            conn = await self._create_connection()
            self.connection_pool["in_use"].append(conn)
            print(f"[INFO] New database connection created: {conn['id']}")
            return conn

        # Wait for connection to become available
        print("[WARN] All connections in use, waiting...")
        await asyncio.sleep(0.1)
        return await self.get_connection()

    async def release_connection(self, connection):
        """Release a database connection back to the pool"""
        if connection in self.connection_pool["in_use"]:
            self.connection_pool["in_use"].remove(connection)
            self.connection_pool["available"].append(connection)
            print(f"[INFO] Database connection released: {connection['id']}")

    @asynccontextmanager
    async def get_connection_context(self):
        """Context manager for database connections"""
        connection = await self.get_connection()
        try:
            yield connection
        finally:
            await self.release_connection(connection)

    async def execute_query(self, query: str, params: Dict[str, Any] = None):
        """Execute a database query with connection management"""
        async with self.get_connection_context() as conn:
            conn["query_count"] += 1
            print(f"[INFO] Executing query on {conn['id']}: {query[:50]}...")
            # Simulate query execution
            await asyncio.sleep(0.01)
            return {"rows": [], "affected": 0}

    async def close(self):
        """Close database connections and cleanup"""
        if not self.is_initialized:
            return

        print("[INFO] Closing database service...")
        await asyncio.sleep(0.05)

        # Close all connections
        for conn in self.connection_pool["available"] + self.connection_pool["in_use"]:
            print(f"[INFO] Closing connection: {conn['id']}")

        self.connection_pool = None
        self.is_initialized = False
        self.connection_count = 0
        print("[OK] Database service closed")

    def get_stats(self) -> Dict[str, Any]:
        """Get database service statistics"""
        if not self.is_initialized:
            return {"status": "not_initialized"}

        return {
            "status": "initialized",
            "total_connections": self.connection_count,
            "available_connections": len(self.connection_pool["available"]),
            "in_use_connections": len(self.connection_pool["in_use"]),
            "pool_size": self.connection_pool["pool_size"]
        }
```

## Cache Service (Complete Implementation)

```python
# services/cache.py (85 lines)
import asyncio
import time
from typing import Dict, Any, Optional, Union
from collections import OrderedDict

class CacheService:
    """Cache service with TTL and LRU eviction"""

    def __init__(self, max_size: int = 1000, default_ttl: int = 3600):
        self.max_size = max_size
        self.default_ttl = default_ttl
        self.cache: OrderedDict[str, Dict[str, Any]] = OrderedDict()
        self.is_initialized = False
        self.hit_count = 0
        self.miss_count = 0
        self.cleanup_interval = 300  # 5 minutes
        self._cleanup_task = None

    async def initialize(self):
        """Initialize cache service"""
        if IS_RELOAD_MODE:
            print("[INFO] Skipping cache initialization during reload")
            return

        print("[INFO] Initializing cache service...")
        await asyncio.sleep(0.05)

        self.cache.clear()
        self.hit_count = 0
        self.miss_count = 0
        self.is_initialized = True

        # Start cleanup task
        self._cleanup_task = asyncio.create_task(self._cleanup_loop())

        print("[OK] Cache service initialized")

    async def get(self, key: str) -> Optional[Any]:
        """Get a value from cache"""
        if not self.is_initialized:
            return None

        if key in self.cache:
            entry = self.cache[key]

            # Check if expired
            if time.time() > entry["expires_at"]:
                del self.cache[key]
                self.miss_count += 1
                return None

            # Move to end (LRU)
            self.cache.move_to_end(key)
            self.hit_count += 1
            print(f"[INFO] Cache hit: {key}")
            return entry["value"]

        self.miss_count += 1
        print(f"[INFO] Cache miss: {key}")
        return None

    async def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        """Set a value in cache"""
        if not self.is_initialized:
            return

        ttl = ttl or self.default_ttl
        expires_at = time.time() + ttl

        # Remove if exists
        if key in self.cache:
            del self.cache[key]

        # Add new entry
        self.cache[key] = {
            "value": value,
            "expires_at": expires_at,
            "created_at": time.time()
        }

        # Evict if over limit
        if len(self.cache) > self.max_size:
            oldest_key = next(iter(self.cache))
            del self.cache[oldest_key]
            print(f"[INFO] Cache evicted: {oldest_key}")

        print(f"[INFO] Cache set: {key} (TTL: {ttl}s)")

    async def delete(self, key: str) -> bool:
        """Delete a value from cache"""
        if not self.is_initialized:
            return False

        if key in self.cache:
            del self.cache[key]
            print(f"[INFO] Cache deleted: {key}")
            return True

        return False

    async def clear(self) -> None:
        """Clear all cache entries"""
        if not self.is_initialized:
            return

        self.cache.clear()
        print("[INFO] Cache cleared")

    async def _cleanup_loop(self):
        """Background cleanup loop for expired entries"""
        while self.is_initialized:
            try:
                await asyncio.sleep(self.cleanup_interval)
                await self._cleanup_expired()
            except asyncio.CancelledError:
                break
            except Exception as e:
                print(f"[ERROR] Cache cleanup error: {e}")

    async def _cleanup_expired(self):
        """Remove expired entries from cache"""
        current_time = time.time()
        expired_keys = []

        for key, entry in self.cache.items():
            if current_time > entry["expires_at"]:
                expired_keys.append(key)

        for key in expired_keys:
            del self.cache[key]

        if expired_keys:
            print(f"[INFO] Cache cleanup: removed {len(expired_keys)} expired entries")

    async def close(self):
        """Close cache service"""
        if not self.is_initialized:
            return

        print("[INFO] Closing cache service...")
        self.is_initialized = False

        if self._cleanup_task:
            self._cleanup_task.cancel()
            try:
                await self._cleanup_task
            except asyncio.CancelledError:
                pass

        self.cache.clear()
        print("[OK] Cache service closed")

    def get_stats(self) -> Dict[str, Any]:
        """Get cache service statistics"""
        if not self.is_initialized:
            return {"status": "not_initialized"}

        total_requests = self.hit_count + self.miss_count
        hit_rate = (self.hit_count / total_requests * 100) if total_requests > 0 else 0

        return {
            "status": "initialized",
            "entries": len(self.cache),
            "max_size": self.max_size,
            "hit_count": self.hit_count,
            "miss_count": self.miss_count,
            "hit_rate": f"{hit_rate:.1f}%"
        }
```

## Background Service (Complete Implementation)

```python
# services/background.py (85 lines)
import asyncio
import time
from typing import Dict, Any, Optional, Callable
from dataclasses import dataclass

@dataclass
class BackgroundTask:
    """Background task configuration"""
    name: str
    func: Callable
    interval: int
    last_run: Optional[float] = None
    next_run: Optional[float] = None
    enabled: bool = True

class BackgroundService:
    """Background service for async operations"""

    def __init__(self):
        self.tasks: Dict[str, BackgroundTask] = {}
        self.is_running = False
        self.cleanup_interval = 60  # seconds
        self._main_loop_task = None
        self._task_stats: Dict[str, Dict[str, Any]] = {}

    async def start(self):
        """Start the background service"""
        if self.is_running:
            return

        self.is_running = True
        print("[INFO] Starting background service...")

        # Initialize task stats
        for task_name in self.tasks:
            self._task_stats[task_name] = {
                "runs": 0,
                "errors": 0,
                "last_run": None,
                "last_error": None
            }

        # Start main loop
        self._main_loop_task = asyncio.create_task(self._main_loop())

        print("[OK] Background service started")

    async def stop(self):
        """Stop the background service"""
        if not self.is_running:
            return

        print("[INFO] Stopping background service...")
        self.is_running = False

        if self._main_loop_task:
            self._main_loop_task.cancel()
            try:
                await self._main_loop_task
            except asyncio.CancelledError:
                pass

        print("[OK] Background service stopped")

    def add_task(self, name: str, func: Callable, interval: int):
        """Add a background task"""
        task = BackgroundTask(
            name=name,
            func=func,
            interval=interval,
            next_run=time.time() + interval
        )

        self.tasks[name] = task
        self._task_stats[name] = {
            "runs": 0,
            "errors": 0,
            "last_run": None,
            "last_error": None
        }

        print(f"[INFO] Added background task: {name} (interval: {interval}s)")

    def remove_task(self, name: str):
        """Remove a background task"""
        if name in self.tasks:
            del self.tasks[name]
            del self._task_stats[name]
            print(f"[INFO] Removed background task: {name}")

    async def _main_loop(self):
        """Main background service loop"""
        while self.is_running:
            try:
                current_time = time.time()

                # Check each task
                for task_name, task in self.tasks.items():
                    if not task.enabled:
                        continue

                    if task.next_run and current_time >= task.next_run:
                        await self._run_task(task_name, task)

                # Sleep for a short interval
                await asyncio.sleep(1)

            except asyncio.CancelledError:
                break
            except Exception as e:
                print(f"[ERROR] Background service error: {e}")
                await asyncio.sleep(5)  # Wait before retrying

    async def _run_task(self, task_name: str, task: BackgroundTask):
        """Run a single background task"""
        try:
            print(f"[INFO] Running background task: {task_name}")
            start_time = time.time()

            # Run the task
            if asyncio.iscoroutinefunction(task.func):
                await task.func()
            else:
                task.func()

            # Update stats
            run_time = time.time() - start_time
            self._task_stats[task_name]["runs"] += 1
            self._task_stats[task_name]["last_run"] = time.time()

            # Schedule next run
            task.last_run = time.time()
            task.next_run = time.time() + task.interval

            print(f"[OK] Background task completed: {task_name} ({run_time:.2f}s)")

        except Exception as e:
            self._task_stats[task_name]["errors"] += 1
            self._task_stats[task_name]["last_error"] = str(e)
            print(f"[ERROR] Background task failed: {task_name} - {e}")

            # Schedule retry with exponential backoff
            retry_delay = min(task.interval * 2, 300)  # Max 5 minutes
            task.next_run = time.time() + retry_delay

    def get_stats(self) -> Dict[str, Any]:
        """Get background service statistics"""
        return {
            "status": "running" if self.is_running else "stopped",
            "tasks": len(self.tasks),
            "task_stats": self._task_stats
        }
```

## Usage Examples

### Basic Service Usage

```python
# Example usage of services
async def main():
    # Initialize services
    db_service = DatabaseService()
    cache_service = CacheService()
    bg_service = BackgroundService()

    await db_service.initialize()
    await cache_service.initialize()

    # Add background tasks
    bg_service.add_task("cleanup", cleanup_old_data, 3600)  # 1 hour
    bg_service.add_task("backup", backup_database, 86400)   # 24 hours

    await bg_service.start()

    # Use services
    await cache_service.set("user:123", {"name": "John"})
    user = await cache_service.get("user:123")

    result = await db_service.execute_query("SELECT * FROM users")

    # Cleanup
    await bg_service.stop()
    await cache_service.close()
    await db_service.close()

# Background task functions
async def cleanup_old_data():
    print("Cleaning up old data...")
    # Implementation here

async def backup_database():
    print("Backing up database...")
    # Implementation here
```

### Service Integration with FastAPI

```python
# main.py - Service integration
from fastapi import FastAPI, Depends
from contextlib import asynccontextmanager

# Global services
services = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan with service management"""
    if IS_RELOAD_MODE:
        yield
        return

    # Initialize services
    services['database'] = DatabaseService()
    services['cache'] = CacheService()
    services['background'] = BackgroundService()

    await services['database'].initialize()
    await services['cache'].initialize()

    # Add background tasks
    services['background'].add_task("cleanup", cleanup_task, 3600)
    await services['background'].start()

    yield

    # Cleanup
    await services['background'].stop()
    await services['cache'].close()
    await services['database'].close()

app = FastAPI(lifespan=lifespan)

# Dependency injection
def get_database_service() -> DatabaseService:
    return services['database']

def get_cache_service() -> CacheService:
    return services['cache']

# Route using services
@app.get("/stats")
async def get_stats(
    db: DatabaseService = Depends(get_database_service),
    cache: CacheService = Depends(get_cache_service)
):
    return {
        "database": db.get_stats(),
        "cache": cache.get_stats()
    }
```

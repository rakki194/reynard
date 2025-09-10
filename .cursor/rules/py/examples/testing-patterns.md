# Testing Patterns for Modular Python

*Comprehensive testing examples for modular Python architecture*

## Unit Testing Services

### Database Service Testing

```python
# tests/test_database_service.py
import pytest
import asyncio
from unittest.mock import AsyncMock, patch
from services.database import DatabaseService

@pytest.fixture
async def database_service():
    """Fixture for database service testing"""
    service = DatabaseService()
    await service.initialize()
    yield service
    await service.close()

@pytest.fixture
def mock_connection():
    """Mock database connection"""
    return {
        "id": "test_conn_1",
        "created_at": 1234567890.0,
        "last_used": None,
        "query_count": 0
    }

@pytest.mark.asyncio
async def test_database_initialization(database_service):
    """Test database service initialization"""
    assert database_service.is_initialized
    assert database_service.connection_pool is not None
    assert database_service.connection_count > 0

@pytest.mark.asyncio
async def test_connection_management(database_service):
    """Test connection acquisition and release"""
    # Test connection acquisition
    connection = await database_service.get_connection()
    assert connection is not None
    assert "id" in connection
    assert "created_at" in connection
    
    # Test connection release
    initial_available = len(database_service.connection_pool["available"])
    await database_service.release_connection(connection)
    assert len(database_service.connection_pool["available"]) == initial_available + 1

@pytest.mark.asyncio
async def test_connection_context_manager(database_service):
    """Test connection context manager"""
    async with database_service.get_connection_context() as conn:
        assert conn is not None
        assert "id" in conn
    
    # Connection should be released after context
    assert conn in database_service.connection_pool["available"]

@pytest.mark.asyncio
async def test_query_execution(database_service):
    """Test query execution with connection management"""
    result = await database_service.execute_query("SELECT * FROM users")
    assert result is not None
    assert "rows" in result
    assert "affected" in result

@pytest.mark.asyncio
async def test_service_not_initialized():
    """Test service behavior when not initialized"""
    service = DatabaseService()
    
    with pytest.raises(RuntimeError, match="Database service not initialized"):
        await service.get_connection()

@pytest.mark.asyncio
async def test_service_stats(database_service):
    """Test service statistics"""
    stats = database_service.get_stats()
    assert stats["status"] == "initialized"
    assert "total_connections" in stats
    assert "available_connections" in stats
    assert "in_use_connections" in stats

@pytest.mark.asyncio
async def test_reload_mode_skip():
    """Test that initialization is skipped in reload mode"""
    with patch('services.database.IS_RELOAD_MODE', True):
        service = DatabaseService()
        await service.initialize()
        
        # Should not be initialized in reload mode
        assert not service.is_initialized
        assert service.connection_pool is None
```

### Cache Service Testing

```python
# tests/test_cache_service.py
import pytest
import asyncio
import time
from services.cache import CacheService

@pytest.fixture
async def cache_service():
    """Fixture for cache service testing"""
    service = CacheService(max_size=10, default_ttl=1)
    await service.initialize()
    yield service
    await service.close()

@pytest.mark.asyncio
async def test_cache_initialization(cache_service):
    """Test cache service initialization"""
    assert cache_service.is_initialized
    assert len(cache_service.cache) == 0
    assert cache_service.hit_count == 0
    assert cache_service.miss_count == 0

@pytest.mark.asyncio
async def test_cache_set_get(cache_service):
    """Test basic cache set and get operations"""
    # Set a value
    await cache_service.set("test_key", "test_value")
    
    # Get the value
    value = await cache_service.get("test_key")
    assert value == "test_value"
    
    # Check stats
    assert cache_service.hit_count == 1
    assert cache_service.miss_count == 0

@pytest.mark.asyncio
async def test_cache_miss(cache_service):
    """Test cache miss behavior"""
    value = await cache_service.get("nonexistent_key")
    assert value is None
    assert cache_service.miss_count == 1
    assert cache_service.hit_count == 0

@pytest.mark.asyncio
async def test_cache_ttl_expiration(cache_service):
    """Test TTL expiration"""
    # Set with short TTL
    await cache_service.set("expiring_key", "expiring_value", ttl=0.1)
    
    # Should be available immediately
    value = await cache_service.get("expiring_key")
    assert value == "expiring_value"
    
    # Wait for expiration
    await asyncio.sleep(0.2)
    
    # Should be expired
    value = await cache_service.get("expiring_key")
    assert value is None
    assert cache_service.miss_count == 1

@pytest.mark.asyncio
async def test_cache_lru_eviction(cache_service):
    """Test LRU eviction when cache is full"""
    # Fill cache to capacity
    for i in range(10):
        await cache_service.set(f"key_{i}", f"value_{i}")
    
    assert len(cache_service.cache) == 10
    
    # Add one more (should evict oldest)
    await cache_service.set("key_10", "value_10")
    assert len(cache_service.cache) == 10
    
    # Oldest key should be evicted
    value = await cache_service.get("key_0")
    assert value is None
    
    # Newest key should be available
    value = await cache_service.get("key_10")
    assert value == "value_10"

@pytest.mark.asyncio
async def test_cache_delete(cache_service):
    """Test cache deletion"""
    await cache_service.set("delete_key", "delete_value")
    
    # Should exist
    value = await cache_service.get("delete_key")
    assert value == "delete_value"
    
    # Delete it
    deleted = await cache_service.delete("delete_key")
    assert deleted is True
    
    # Should not exist
    value = await cache_service.get("delete_key")
    assert value is None
    
    # Try to delete non-existent key
    deleted = await cache_service.delete("nonexistent")
    assert deleted is False

@pytest.mark.asyncio
async def test_cache_clear(cache_service):
    """Test cache clearing"""
    # Add some entries
    await cache_service.set("key1", "value1")
    await cache_service.set("key2", "value2")
    
    assert len(cache_service.cache) == 2
    
    # Clear cache
    await cache_service.clear()
    
    assert len(cache_service.cache) == 0

@pytest.mark.asyncio
async def test_cache_stats(cache_service):
    """Test cache statistics"""
    # Generate some activity
    await cache_service.set("key1", "value1")
    await cache_service.get("key1")  # hit
    await cache_service.get("key2")  # miss
    
    stats = cache_service.get_stats()
    assert stats["status"] == "initialized"
    assert stats["entries"] == 1
    assert stats["hit_count"] == 1
    assert stats["miss_count"] == 1
    assert "hit_rate" in stats
```

### Background Service Testing

```python
# tests/test_background_service.py
import pytest
import asyncio
import time
from unittest.mock import AsyncMock, MagicMock
from services.background import BackgroundService, BackgroundTask

@pytest.fixture
async def background_service():
    """Fixture for background service testing"""
    service = BackgroundService()
    yield service
    if service.is_running:
        await service.stop()

@pytest.fixture
def mock_task():
    """Mock background task function"""
    return AsyncMock()

@pytest.mark.asyncio
async def test_background_service_initialization(background_service):
    """Test background service initialization"""
    assert not background_service.is_running
    assert len(background_service.tasks) == 0

@pytest.mark.asyncio
async def test_add_remove_task(background_service, mock_task):
    """Test adding and removing background tasks"""
    # Add task
    background_service.add_task("test_task", mock_task, 60)
    
    assert "test_task" in background_service.tasks
    assert background_service.tasks["test_task"].interval == 60
    assert background_service.tasks["test_task"].enabled is True
    
    # Remove task
    background_service.remove_task("test_task")
    assert "test_task" not in background_service.tasks

@pytest.mark.asyncio
async def test_background_service_start_stop(background_service, mock_task):
    """Test starting and stopping background service"""
    background_service.add_task("test_task", mock_task, 1)
    
    # Start service
    await background_service.start()
    assert background_service.is_running
    
    # Let it run briefly
    await asyncio.sleep(0.1)
    
    # Stop service
    await background_service.stop()
    assert not background_service.is_running

@pytest.mark.asyncio
async def test_task_execution(background_service, mock_task):
    """Test background task execution"""
    background_service.add_task("test_task", mock_task, 0.1)  # Run every 100ms
    
    await background_service.start()
    
    # Wait for task to run
    await asyncio.sleep(0.2)
    
    # Check that task was called
    assert mock_task.called
    
    await background_service.stop()

@pytest.mark.asyncio
async def test_task_error_handling(background_service):
    """Test error handling in background tasks"""
    error_task = AsyncMock(side_effect=Exception("Test error"))
    background_service.add_task("error_task", error_task, 0.1)
    
    await background_service.start()
    
    # Wait for task to run and fail
    await asyncio.sleep(0.2)
    
    # Check error stats
    stats = background_service.get_stats()
    assert stats["task_stats"]["error_task"]["errors"] > 0
    assert "Test error" in stats["task_stats"]["error_task"]["last_error"]
    
    await background_service.stop()

@pytest.mark.asyncio
async def test_background_service_stats(background_service, mock_task):
    """Test background service statistics"""
    background_service.add_task("test_task", mock_task, 60)
    
    stats = background_service.get_stats()
    assert stats["status"] == "stopped"
    assert stats["tasks"] == 1
    assert "test_task" in stats["task_stats"]
    
    await background_service.start()
    
    stats = background_service.get_stats()
    assert stats["status"] == "running"
    
    await background_service.stop()
```

## Integration Testing

### FastAPI Integration Testing

```python
# tests/test_integration.py
import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, patch
from main import app

@pytest.fixture
def client():
    """Test client for FastAPI app"""
    return TestClient(app)

@pytest.fixture
def mock_services():
    """Mock services for testing"""
    with patch('main.services') as mock_services:
        mock_services['database'] = AsyncMock()
        mock_services['cache'] = AsyncMock()
        mock_services['background'] = AsyncMock()
        
        # Configure mock database service
        mock_services['database'].get_stats.return_value = {
            "status": "initialized",
            "total_connections": 5,
            "available_connections": 3,
            "in_use_connections": 2
        }
        
        # Configure mock cache service
        mock_services['cache'].get_stats.return_value = {
            "status": "initialized",
            "entries": 100,
            "hit_count": 50,
            "miss_count": 10,
            "hit_rate": "83.3%"
        }
        
        yield mock_services

def test_health_endpoint(client):
    """Test health check endpoint"""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"

def test_stats_endpoint(client, mock_services):
    """Test stats endpoint with mocked services"""
    response = client.get("/api/stats")
    assert response.status_code == 200
    
    data = response.json()
    assert "database" in data
    assert "cache" in data
    
    # Verify database stats
    db_stats = data["database"]
    assert db_stats["status"] == "initialized"
    assert db_stats["total_connections"] == 5
    
    # Verify cache stats
    cache_stats = data["cache"]
    assert cache_stats["status"] == "initialized"
    assert cache_stats["entries"] == 100

def test_user_endpoints(client, mock_services):
    """Test user management endpoints"""
    # Mock database service methods
    mock_services['database'].execute_query.return_value = {
        "rows": [{"id": 1, "username": "testuser", "email": "test@example.com"}],
        "affected": 1
    }
    
    # Test user creation
    user_data = {"username": "testuser", "email": "test@example.com"}
    response = client.post("/api/users", json=user_data)
    assert response.status_code == 201
    
    # Test user retrieval
    response = client.get("/api/users")
    assert response.status_code == 200
    users = response.json()
    assert len(users) > 0
    assert users[0]["username"] == "testuser"

def test_error_handling(client, mock_services):
    """Test error handling in endpoints"""
    # Mock service unavailable
    mock_services['database'].get_stats.side_effect = Exception("Service unavailable")
    
    response = client.get("/api/stats")
    assert response.status_code == 500
```

### Database Integration Testing

```python
# tests/test_database_integration.py
import pytest
import asyncio
from services.database import DatabaseService
from backends.sqlite import SQLiteBackend

@pytest.fixture
async def database_service():
    """Real database service for integration testing"""
    service = DatabaseService()
    await service.initialize()
    yield service
    await service.close()

@pytest.fixture
async def sqlite_backend():
    """SQLite backend for integration testing"""
    backend = SQLiteBackend("sqlite:///:memory:")
    await backend._initialize()
    yield backend

@pytest.mark.asyncio
async def test_database_connection_pool(database_service):
    """Test database connection pool behavior"""
    # Get multiple connections
    conn1 = await database_service.get_connection()
    conn2 = await database_service.get_connection()
    conn3 = await database_service.get_connection()
    
    # All should be different
    assert conn1["id"] != conn2["id"]
    assert conn2["id"] != conn3["id"]
    
    # Release connections
    await database_service.release_connection(conn1)
    await database_service.release_connection(conn2)
    await database_service.release_connection(conn3)
    
    # Stats should reflect the activity
    stats = database_service.get_stats()
    assert stats["total_connections"] >= 3

@pytest.mark.asyncio
async def test_sqlite_backend_operations(sqlite_backend):
    """Test SQLite backend operations"""
    # Create a user
    user_data = {
        "username": "testuser",
        "email": "test@example.com",
        "password_hash": "hashed_password"
    }
    
    user = await sqlite_backend.create_user(user_data)
    assert user is not None
    assert user.username == "testuser"
    assert user.email == "test@example.com"
    
    # Get user by ID
    retrieved_user = await sqlite_backend.get_user_by_id(user.id)
    assert retrieved_user is not None
    assert retrieved_user.username == "testuser"
    
    # Get user by username
    retrieved_user = await sqlite_backend.get_user_by_username("testuser")
    assert retrieved_user is not None
    assert retrieved_user.email == "test@example.com"
    
    # Update user
    updates = {"email": "newemail@example.com"}
    updated_user = await sqlite_backend.update_user(user.id, updates)
    assert updated_user is not None
    assert updated_user.email == "newemail@example.com"
    
    # Delete user
    deleted = await sqlite_backend.delete_user(user.id)
    assert deleted is True
    
    # User should no longer exist
    retrieved_user = await sqlite_backend.get_user_by_id(user.id)
    assert retrieved_user is None
```

## Test Configuration and Utilities

### Test Configuration

```python
# tests/conftest.py
import pytest
import asyncio
import os
from unittest.mock import patch

# Set test environment
os.environ["TESTING"] = "true"
os.environ["IS_RELOAD_MODE"] = "false"

@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(autouse=True)
def reset_services():
    """Reset global services before each test"""
    with patch('main.services', {}):
        yield

@pytest.fixture
def mock_reload_mode():
    """Mock reload mode for testing"""
    with patch('services.database.IS_RELOAD_MODE', False):
        yield

@pytest.fixture
def mock_time():
    """Mock time for consistent testing"""
    with patch('time.time', return_value=1234567890.0):
        yield
```

### Test Utilities

```python
# tests/utils.py
import asyncio
import time
from typing import Any, Dict, List
from unittest.mock import AsyncMock, MagicMock

class MockDatabaseConnection:
    """Mock database connection for testing"""
    
    def __init__(self, connection_id: str):
        self.id = connection_id
        self.created_at = time.time()
        self.last_used = None
        self.query_count = 0
    
    async def execute(self, query: str, params: Dict[str, Any] = None):
        """Mock query execution"""
        self.query_count += 1
        self.last_used = time.time()
        
        # Simulate different query results
        if "SELECT" in query.upper():
            return {"rows": [{"id": 1, "name": "test"}], "affected": 0}
        elif "INSERT" in query.upper():
            return {"rows": [], "affected": 1}
        elif "UPDATE" in query.upper():
            return {"rows": [], "affected": 1}
        elif "DELETE" in query.upper():
            return {"rows": [], "affected": 1}
        else:
            return {"rows": [], "affected": 0}

class TestDataFactory:
    """Factory for creating test data"""
    
    @staticmethod
    def create_user_data(overrides: Dict[str, Any] = None) -> Dict[str, Any]:
        """Create user test data"""
        data = {
            "username": "testuser",
            "email": "test@example.com",
            "password_hash": "hashed_password",
            "created_at": time.time(),
            "is_active": True
        }
        
        if overrides:
            data.update(overrides)
        
        return data
    
    @staticmethod
    def create_cache_entry(key: str, value: Any, ttl: int = 3600) -> Dict[str, Any]:
        """Create cache entry test data"""
        return {
            "key": key,
            "value": value,
            "expires_at": time.time() + ttl,
            "created_at": time.time()
        }

class AsyncTestHelper:
    """Helper utilities for async testing"""
    
    @staticmethod
    async def wait_for_condition(condition_func, timeout: float = 1.0, interval: float = 0.01):
        """Wait for a condition to be true"""
        start_time = time.time()
        
        while time.time() - start_time < timeout:
            if condition_func():
                return True
            await asyncio.sleep(interval)
        
        return False
    
    @staticmethod
    async def run_with_timeout(coro, timeout: float = 1.0):
        """Run a coroutine with timeout"""
        try:
            return await asyncio.wait_for(coro, timeout=timeout)
        except asyncio.TimeoutError:
            raise AssertionError(f"Operation timed out after {timeout} seconds")

class MockServiceManager:
    """Manager for mock services in tests"""
    
    def __init__(self):
        self.services = {}
        self._setup_default_mocks()
    
    def _setup_default_mocks(self):
        """Setup default mock services"""
        self.services['database'] = AsyncMock()
        self.services['cache'] = AsyncMock()
        self.services['background'] = AsyncMock()
        
        # Configure default behaviors
        self.services['database'].get_stats.return_value = {"status": "initialized"}
        self.services['cache'].get_stats.return_value = {"status": "initialized"}
        self.services['background'].get_stats.return_value = {"status": "stopped"}
    
    def get_service(self, name: str):
        """Get a mock service by name"""
        return self.services.get(name)
    
    def reset_all(self):
        """Reset all mock services"""
        for service in self.services.values():
            if hasattr(service, 'reset_mock'):
                service.reset_mock()
```

## Performance Testing

### Load Testing Services

```python
# tests/test_performance.py
import pytest
import asyncio
import time
from concurrent.futures import ThreadPoolExecutor
from services.database import DatabaseService
from services.cache import CacheService

@pytest.mark.asyncio
async def test_database_concurrent_connections(database_service):
    """Test database service under concurrent load"""
    async def get_connection_task():
        conn = await database_service.get_connection()
        await asyncio.sleep(0.01)  # Simulate work
        await database_service.release_connection(conn)
        return conn["id"]
    
    # Run 50 concurrent connection requests
    tasks = [get_connection_task() for _ in range(50)]
    start_time = time.time()
    
    results = await asyncio.gather(*tasks)
    end_time = time.time()
    
    # All tasks should complete successfully
    assert len(results) == 50
    assert len(set(results)) > 1  # Should use multiple connections
    
    # Should complete within reasonable time
    assert end_time - start_time < 5.0

@pytest.mark.asyncio
async def test_cache_concurrent_operations(cache_service):
    """Test cache service under concurrent load"""
    async def cache_operation_task(key: str):
        await cache_service.set(key, f"value_{key}")
        value = await cache_service.get(key)
        return value
    
    # Run 100 concurrent cache operations
    tasks = [cache_operation_task(f"key_{i}") for i in range(100)]
    start_time = time.time()
    
    results = await asyncio.gather(*tasks)
    end_time = time.time()
    
    # All operations should succeed
    assert len(results) == 100
    assert all(result is not None for result in results)
    
    # Should complete within reasonable time
    assert end_time - start_time < 2.0

@pytest.mark.asyncio
async def test_service_memory_usage():
    """Test service memory usage under load"""
    import psutil
    import gc
    
    process = psutil.Process()
    initial_memory = process.memory_info().rss
    
    # Create and use services
    services = []
    for i in range(10):
        db_service = DatabaseService()
        cache_service = CacheService()
        
        await db_service.initialize()
        await cache_service.initialize()
        
        # Use services
        for j in range(100):
            await cache_service.set(f"key_{i}_{j}", f"value_{i}_{j}")
            conn = await db_service.get_connection()
            await db_service.release_connection(conn)
        
        services.append((db_service, cache_service))
    
    # Cleanup
    for db_service, cache_service in services:
        await cache_service.close()
        await db_service.close()
    
    # Force garbage collection
    gc.collect()
    
    final_memory = process.memory_info().rss
    memory_increase = final_memory - initial_memory
    
    # Memory increase should be reasonable (less than 50MB)
    assert memory_increase < 50 * 1024 * 1024
```

This comprehensive testing guide provides patterns for testing all aspects of modular Python services, from unit tests to integration tests and performance testing.

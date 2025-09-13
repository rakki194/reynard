# Modular Python Quick Reference

> Essential patterns and templates for rapid development

## File Structure Templates

### Basic Service Template

```python
# services/example_service.py
import asyncio
from typing import Dict, Any, Optional

class ExampleService:
    """Example service with standard lifecycle"""

    def __init__(self):
        self.is_initialized = False
        self.config = {}

    async def initialize(self):
        """Initialize the service"""
        if IS_RELOAD_MODE:
            return

        print("[INFO] Initializing ExampleService...")
        # Add initialization logic here
        self.is_initialized = True
        print("[OK] ExampleService initialized")

    async def close(self):
        """Close the service"""
        if not self.is_initialized:
            return

        print("[INFO] Closing ExampleService...")
        # Add cleanup logic here
        self.is_initialized = False
        print("[OK] ExampleService closed")

    def get_stats(self) -> Dict[str, Any]:
        """Get service statistics"""
        return {
            "status": "initialized" if self.is_initialized else "not_initialized",
            "config": self.config
        }
```

### Route Module Template

```python
# routes/example.py
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any

router = APIRouter()

@router.get("/")
async def get_items(
    db_service = Depends(get_database_service),
    cache_service = Depends(get_cache_service)
) -> List[Dict[str, Any]]:
    """Get all items"""
    try:
        # Check cache first
        cached_items = await cache_service.get("items")
        if cached_items:
            return cached_items

        # Query database
        items = await db_service.execute_query("SELECT * FROM items")

        # Cache results
        await cache_service.set("items", items, ttl=300)

        return items
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get items: {e}"
        )

@router.post("/")
async def create_item(
    item_data: Dict[str, Any],
    db_service = Depends(get_database_service),
    cache_service = Depends(get_cache_service)
) -> Dict[str, Any]:
    """Create a new item"""
    try:
        # Create item in database
        result = await db_service.execute_query(
            "INSERT INTO items (name, description) VALUES (?, ?)",
            {"name": item_data["name"], "description": item_data["description"]}
        )

        # Invalidate cache
        await cache_service.delete("items")

        return {"id": result["last_id"], "message": "Item created successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create item: {e}"
        )
```

### Configuration Module Template

```python
# config/example.py
from dataclasses import dataclass
from typing import Optional

@dataclass
class ExampleConfig:
    """Example configuration class"""
    host: str = "localhost"
    port: int = 8000
    debug: bool = False
    timeout: int = 30
    max_connections: int = 100

    def __post_init__(self):
        """Validate configuration after initialization"""
        if self.port < 1 or self.port > 65535:
            raise ValueError("Port must be between 1 and 65535")

        if self.timeout < 1:
            raise ValueError("Timeout must be positive")

        if self.max_connections < 1:
            raise ValueError("Max connections must be positive")

    @classmethod
    def from_env(cls) -> 'ExampleConfig':
        """Create configuration from environment variables"""
        import os

        return cls(
            host=os.getenv("EXAMPLE_HOST", "localhost"),
            port=int(os.getenv("EXAMPLE_PORT", "8000")),
            debug=os.getenv("EXAMPLE_DEBUG", "false").lower() == "true",
            timeout=int(os.getenv("EXAMPLE_TIMEOUT", "30")),
            max_connections=int(os.getenv("EXAMPLE_MAX_CONNECTIONS", "100"))
        )
```

## Common Patterns

### Dependency Injection

```python
# dependencies.py
from fastapi import Depends, HTTPException, status
from typing import Optional

# Global service instances
_services: Dict[str, Any] = {}

def get_service(service_name: str):
    """Generic service dependency"""
    def _get_service():
        if service_name not in _services:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"{service_name} service not available"
            )
        return _services[service_name]
    return _get_service

def get_database_service() -> DatabaseService:
    return get_service("database")()

def get_cache_service() -> CacheService:
    return get_service("cache")()

def set_services(services: Dict[str, Any]):
    """Set global service instances"""
    global _services
    _services.update(services)
```

### Context Managers

```python
# utils/context_managers.py
from contextlib import asynccontextmanager
from typing import AsyncGenerator, Any

@asynccontextmanager
async def service_context(service: Any) -> AsyncGenerator[Any, None]:
    """Generic service context manager"""
    if hasattr(service, 'initialize'):
        await service.initialize()

    try:
        yield service
    finally:
        if hasattr(service, 'close'):
            await service.close()

@asynccontextmanager
async def database_transaction(db_service: DatabaseService) -> AsyncGenerator[Any, None]:
    """Database transaction context manager"""
    connection = await db_service.get_connection()
    try:
        # Begin transaction
        await connection.execute("BEGIN")
        yield connection
        # Commit transaction
        await connection.execute("COMMIT")
    except Exception:
        # Rollback on error
        await connection.execute("ROLLBACK")
        raise
    finally:
        await db_service.release_connection(connection)
```

### Error Handling

```python
# utils/error_handling.py
from typing import Type, Union, Callable, Any
from functools import wraps
import logging

logger = logging.getLogger(__name__)

def handle_errors(
    exceptions: Union[Type[Exception], tuple] = Exception,
    default_return: Any = None,
    log_error: bool = True
):
    """Decorator for error handling"""
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            try:
                return await func(*args, **kwargs)
            except exceptions as e:
                if log_error:
                    logger.error(f"Error in {func.__name__}: {e}", exc_info=True)
                return default_return

        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            try:
                return func(*args, **kwargs)
            except exceptions as e:
                if log_error:
                    logger.error(f"Error in {func.__name__}: {e}", exc_info=True)
                return default_return

        return async_wrapper if asyncio.iscoroutinefunction(func) else sync_wrapper
    return decorator

# Usage examples
@handle_errors(ValueError, default_return=0)
async def parse_number(value: str) -> int:
    return int(value)

@handle_errors((ConnectionError, TimeoutError), default_return=[])
async def fetch_data() -> List[Dict[str, Any]]:
    # Implementation here
    pass
```

### Validation Patterns

```python
# utils/validation.py
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, validator
import re

class BaseValidator(BaseModel):
    """Base validator with common validation methods"""

    @classmethod
    def validate_email(cls, email: str) -> str:
        """Validate email format"""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(pattern, email):
            raise ValueError("Invalid email format")
        return email.lower()

    @classmethod
    def validate_username(cls, username: str) -> str:
        """Validate username format"""
        if len(username) < 3 or len(username) > 20:
            raise ValueError("Username must be between 3 and 20 characters")

        if not re.match(r'^[a-zA-Z0-9_]+$', username):
            raise ValueError("Username can only contain letters, numbers, and underscores")

        return username.lower()

class UserValidator(BaseValidator):
    """User data validator"""
    username: str
    email: str
    password: str
    age: Optional[int] = None

    @validator('username')
    def validate_username_field(cls, v):
        return cls.validate_username(v)

    @validator('email')
    def validate_email_field(cls, v):
        return cls.validate_email(v)

    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v

    @validator('age')
    def validate_age(cls, v):
        if v is not None and (v < 0 or v > 150):
            raise ValueError("Age must be between 0 and 150")
        return v
```

## Testing Templates

### Service Test Template

```python
# tests/test_example_service.py
import pytest
from unittest.mock import AsyncMock, patch
from services.example_service import ExampleService

@pytest.fixture
async def example_service():
    """Fixture for example service testing"""
    service = ExampleService()
    await service.initialize()
    yield service
    await service.close()

@pytest.mark.asyncio
async def test_service_initialization(example_service):
    """Test service initialization"""
    assert example_service.is_initialized
    assert example_service.get_stats()["status"] == "initialized"

@pytest.mark.asyncio
async def test_service_reload_mode():
    """Test service behavior in reload mode"""
    with patch('services.example_service.IS_RELOAD_MODE', True):
        service = ExampleService()
        await service.initialize()

        # Should not be initialized in reload mode
        assert not service.is_initialized

@pytest.mark.asyncio
async def test_service_cleanup(example_service):
    """Test service cleanup"""
    assert example_service.is_initialized

    await example_service.close()
    assert not example_service.is_initialized
```

### Integration Test Template

```python
# tests/test_integration.py
import pytest
from fastapi.testclient import TestClient
from main import app

@pytest.fixture
def client():
    """Test client for FastAPI app"""
    return TestClient(app)

@pytest.fixture
def mock_services():
    """Mock services for testing"""
    with patch('main.services') as mock_services:
        # Configure mock services
        mock_services['database'] = AsyncMock()
        mock_services['cache'] = AsyncMock()

        yield mock_services

def test_health_endpoint(client):
    """Test health check endpoint"""
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_api_endpoint(client, mock_services):
    """Test API endpoint with mocked services"""
    # Configure mock behavior
    mock_services['database'].execute_query.return_value = {"rows": [], "affected": 0}
    mock_services['cache'].get.return_value = None

    response = client.get("/api/items")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
```

## Performance Patterns

### Lazy Loading Template

```python
# utils/lazy_loading.py
from typing import Any, Optional

class LazyLoader:
    """Simple lazy loading utility"""

    def __init__(self, loader_func: callable, *args, **kwargs):
        self.loader_func = loader_func
        self.args = args
        self.kwargs = kwargs
        self._value: Optional[Any] = None
        self._loaded = False

    def __call__(self) -> Any:
        """Get the loaded value"""
        if not self._loaded:
            self._value = self.loader_func(*self.args, **self.kwargs)
            self._loaded = True
        return self._value

    def reset(self):
        """Reset the loader to force reload"""
        self._loaded = False
        self._value = None

# Usage
heavy_module = LazyLoader(__import__, "heavy_package")
data = heavy_module()  # Only loads when first accessed
```

### Caching Template

```python
# utils/simple_cache.py
import time
from typing import Any, Optional, Dict
from functools import wraps

class SimpleCache:
    """Simple in-memory cache with TTL"""

    def __init__(self, default_ttl: int = 300):
        self.default_ttl = default_ttl
        self._cache: Dict[str, Dict[str, Any]] = {}

    def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        if key not in self._cache:
            return None

        entry = self._cache[key]
        if time.time() > entry["expires_at"]:
            del self._cache[key]
            return None

        return entry["value"]

    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        """Set value in cache"""
        ttl = ttl or self.default_ttl
        self._cache[key] = {
            "value": value,
            "expires_at": time.time() + ttl
        }

    def delete(self, key: str) -> bool:
        """Delete value from cache"""
        if key in self._cache:
            del self._cache[key]
            return True
        return False

def cached(ttl: int = 300):
    """Decorator for caching function results"""
    cache = SimpleCache(ttl)

    def decorator(func):
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            cache_key = f"{func.__name__}:{hash(str(args) + str(kwargs))}"

            cached_result = cache.get(cache_key)
            if cached_result is not None:
                return cached_result

            result = await func(*args, **kwargs)
            cache.set(cache_key, result, ttl)
            return result

        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            cache_key = f"{func.__name__}:{hash(str(args) + str(kwargs))}"

            cached_result = cache.get(cache_key)
            if cached_result is not None:
                return cached_result

            result = func(*args, **kwargs)
            cache.set(cache_key, result, ttl)
            return result

        return async_wrapper if asyncio.iscoroutinefunction(func) else sync_wrapper
    return decorator

# Usage
@cached(ttl=600)  # Cache for 10 minutes
async def expensive_operation(data: str) -> str:
    # Expensive operation here
    await asyncio.sleep(1)
    return f"processed_{data}"
```

## Common Utilities

### Logging Setup

```python
# utils/logging_config.py
import logging
import sys
from typing import Optional

def setup_logging(
    level: str = "INFO",
    format_string: Optional[str] = None,
    include_timestamp: bool = True
) -> None:
    """Setup application logging"""

    if format_string is None:
        if include_timestamp:
            format_string = "[%(asctime)s] %(levelname)s: %(name)s: %(message)s"
        else:
            format_string = "%(levelname)s: %(name)s: %(message)s"

    logging.basicConfig(
        level=getattr(logging, level.upper()),
        format=format_string,
        handlers=[
            logging.StreamHandler(sys.stdout)
        ]
    )

    # Set specific logger levels
    logging.getLogger("uvicorn").setLevel(logging.WARNING)
    logging.getLogger("fastapi").setLevel(logging.INFO)

# Usage
setup_logging(level="DEBUG", include_timestamp=True)
logger = logging.getLogger(__name__)
```

### Environment Configuration

```python
# utils/env_config.py
import os
from typing import Any, Optional, Union

def get_env_var(
    key: str,
    default: Any = None,
    required: bool = False,
    var_type: type = str
) -> Any:
    """Get environment variable with type conversion"""
    value = os.getenv(key, default)

    if value is None and required:
        raise ValueError(f"Required environment variable {key} is not set")

    if value is None:
        return default

    # Type conversion
    if var_type == bool:
        return value.lower() in ("true", "1", "yes", "on")
    elif var_type == int:
        try:
            return int(value)
        except ValueError:
            raise ValueError(f"Environment variable {key} must be an integer")
    elif var_type == float:
        try:
            return float(value)
        except ValueError:
            raise ValueError(f"Environment variable {key} must be a float")

    return value

# Usage
DATABASE_URL = get_env_var("DATABASE_URL", required=True)
DEBUG = get_env_var("DEBUG", default=False, var_type=bool)
PORT = get_env_var("PORT", default=8000, var_type=int)
```

### Async Utilities

```python
# utils/async_utils.py
import asyncio
from typing import List, Any, Callable, Coroutine
from concurrent.futures import ThreadPoolExecutor

async def run_in_thread(func: Callable, *args, **kwargs) -> Any:
    """Run a synchronous function in a thread pool"""
    loop = asyncio.get_event_loop()
    with ThreadPoolExecutor() as executor:
        return await loop.run_in_executor(executor, func, *args, **kwargs)

async def gather_with_concurrency_limit(
    coroutines: List[Coroutine],
    limit: int = 10
) -> List[Any]:
    """Run coroutines with concurrency limit"""
    semaphore = asyncio.Semaphore(limit)

    async def limited_coro(coro):
        async with semaphore:
            return await coro

    return await asyncio.gather(*[limited_coro(coro) for coro in coroutines])

async def timeout_after(seconds: float, coro: Coroutine) -> Any:
    """Run coroutine with timeout"""
    try:
        return await asyncio.wait_for(coro, timeout=seconds)
    except asyncio.TimeoutError:
        raise TimeoutError(f"Operation timed out after {seconds} seconds")

# Usage
result = await run_in_thread(heavy_sync_function, arg1, arg2)
results = await gather_with_concurrency_limit(coroutines, limit=5)
result = await timeout_after(30.0, slow_operation())
```

This quick reference provides templates and patterns for common development tasks in modular Python applications.

# Python Exception Chaining Guide

_Proper exception chaining with `raise ... from err` for better error context and debugging_

## Overview

Exception chaining in Python allows you to preserve the original exception context when
re-raising exceptions, providing crucial debugging information. This guide covers the proper use of `raise ... from
err` and `raise ... from None` patterns, with practical examples from real-world scenarios.

## The Problem: Lost Exception Context

### Without Exception Chaining

**❌ Poor Exception Handling:**

```python
try:
    from argon2 import PasswordHasher
    from argon2.exceptions import VerificationError
except ImportError:
    raise ImportError(
        "argon2-cffi is required for password hashing. "
        "Install with: pip install argon2-cffi"
    )
```

**Result:**

```text
ImportError: argon2-cffi is required for password hashing. Install with: pip install argon2-cffi
```

**Problems:**

- Original `ImportError` is lost
- No context about what actually failed
- Difficult to debug dependency issues

### With Exception Chaining

**✅ Proper Exception Chaining:**

```python
try:
    from argon2 import PasswordHasher
    from argon2.exceptions import VerificationError
except ImportError as exc:
    raise ImportError(
        "argon2-cffi is required for password hashing. "
        "Install with: pip install argon2-cffi"
    ) from exc
```

**Result:**

```text
ImportError: argon2-cffi is required for password hashing. Install with: pip install argon2-cffi

The above exception was the direct cause of the following exception:

ImportError: No module named 'argon2'
```

**Benefits:**

- Original exception context preserved
- Clear chain of causality
- Easier debugging and troubleshooting

## Exception Chaining Patterns

### Pattern 1: `raise ... from err` (Preserve Context)

Use this when you want to provide additional context while preserving the original exception.

```python
def load_configuration(config_path: str) -> dict:
    """Load configuration from file with proper error context."""
    try:
        with open(config_path, 'r') as f:
            return json.load(f)
    except FileNotFoundError as exc:
        raise ConfigurationError(
            f"Configuration file not found: {config_path}"
        ) from exc
    except json.JSONDecodeError as exc:
        raise ConfigurationError(
            f"Invalid JSON in configuration file: {config_path}"
        ) from exc
```

### Pattern 2: `raise ... from None` (Suppress Context)

Use this when the original exception is not relevant or would be confusing.

```python
def validate_user_input(data: dict) -> bool:
    """Validate user input, suppressing internal implementation details."""
    try:
        # Complex validation logic that might raise various exceptions
        return perform_validation(data)
    except Exception as exc:
        # Don't expose internal validation details
        raise ValidationError("Invalid user input provided") from None
```

### Pattern 3: Re-raising with Additional Context

```python
def process_payment(amount: float, card_token: str) -> PaymentResult:
    """Process payment with comprehensive error handling."""
    try:
        return payment_gateway.charge(amount, card_token)
    except PaymentGatewayError as exc:
        # Add business context to technical error
        raise PaymentProcessingError(
            f"Failed to process payment of ${amount:.2f}"
        ) from exc
    except NetworkError as exc:
        # Add retry context
        raise PaymentProcessingError(
            "Payment service temporarily unavailable"
        ) from exc
```

## Real-World Examples

### Database Connection Errors

```python
import psycopg2
from psycopg2 import OperationalError

class DatabaseManager:
    def __init__(self, connection_string: str):
        self.connection_string = connection_string

    def connect(self) -> psycopg2.connection:
        """Connect to database with proper error context."""
        try:
            return psycopg2.connect(self.connection_string)
        except OperationalError as exc:
            raise DatabaseConnectionError(
                f"Failed to connect to database: {self.connection_string}"
            ) from exc
        except psycopg2.ProgrammingError as exc:
            raise DatabaseConnectionError(
                "Invalid database connection parameters"
            ) from exc
```

### API Request Errors

```python
import requests
from requests.exceptions import RequestException, Timeout, ConnectionError

def fetch_user_data(user_id: str) -> dict:
    """Fetch user data from API with comprehensive error handling."""
    try:
        response = requests.get(f"/api/users/{user_id}", timeout=10)
        response.raise_for_status()
        return response.json()
    except Timeout as exc:
        raise APIError(f"Request timeout for user {user_id}") from exc
    except ConnectionError as exc:
        raise APIError("API service unavailable") from exc
    except requests.HTTPError as exc:
        if exc.response.status_code == 404:
            raise UserNotFoundError(f"User {user_id} not found") from exc
        else:
            raise APIError(f"HTTP error {exc.response.status_code}") from exc
    except RequestException as exc:
        raise APIError("Unexpected API error") from exc
```

### File Processing Errors

```python
import csv
import os

def process_csv_file(file_path: str) -> list[dict]:
    """Process CSV file with detailed error context."""
    if not os.path.exists(file_path):
        raise FileProcessingError(f"File not found: {file_path}")

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            return list(reader)
    except UnicodeDecodeError as exc:
        raise FileProcessingError(
            f"File encoding error in {file_path}. Expected UTF-8."
        ) from exc
    except csv.Error as exc:
        raise FileProcessingError(
            f"CSV parsing error in {file_path}"
        ) from exc
    except PermissionError as exc:
        raise FileProcessingError(
            f"Permission denied accessing {file_path}"
        ) from exc
```

## Custom Exception Classes

### Base Exception Classes

```python
class ReynardError(Exception):
    """Base exception for Reynard application errors."""
    pass

class ConfigurationError(ReynardError):
    """Configuration-related errors."""
    pass

class DatabaseError(ReynardError):
    """Database operation errors."""
    pass

class APIError(ReynardError):
    """API communication errors."""
    pass

class ValidationError(ReynardError):
    """Data validation errors."""
    pass
```

### Exception with Additional Context

```python
class PaymentProcessingError(ReynardError):
    """Payment processing errors with additional context."""

    def __init__(self, message: str, amount: float = None, user_id: str = None):
        super().__init__(message)
        self.amount = amount
        self.user_id = user_id

    def __str__(self) -> str:
        base_msg = super().__str__()
        if self.amount is not None:
            base_msg += f" (Amount: ${self.amount:.2f})"
        if self.user_id is not None:
            base_msg += f" (User: {self.user_id})"
        return base_msg
```

## Advanced Patterns

### Exception Chaining in Async Code

```python
import aiohttp
import asyncio

async def fetch_data_async(url: str) -> dict:
    """Async data fetching with proper exception chaining."""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url, timeout=10) as response:
                response.raise_for_status()
                return await response.json()
    except aiohttp.ClientTimeout as exc:
        raise APIError(f"Request timeout for {url}") from exc
    except aiohttp.ClientError as exc:
        raise APIError(f"Client error for {url}") from exc
    except asyncio.TimeoutError as exc:
        raise APIError(f"Async timeout for {url}") from exc
```

### Exception Chaining in Context Managers

```python
from contextlib import contextmanager

@contextmanager
def database_transaction():
    """Database transaction context manager with proper error handling."""
    conn = None
    try:
        conn = get_database_connection()
        conn.begin()
        yield conn
        conn.commit()
    except Exception as exc:
        if conn:
            conn.rollback()
        raise DatabaseTransactionError(
            "Transaction failed and was rolled back"
        ) from exc
    finally:
        if conn:
            conn.close()
```

### Exception Chaining in Decorators

```python
from functools import wraps

def handle_api_errors(func):
    """Decorator to handle API errors with proper chaining."""
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except requests.RequestException as exc:
            raise APIError(f"API call failed in {func.__name__}") from exc
        except ValueError as exc:
            raise ValidationError(f"Invalid data in {func.__name__}") from exc
    return wrapper

@handle_api_errors
def create_user(user_data: dict) -> dict:
    """Create user with automatic error handling."""
    response = requests.post("/api/users", json=user_data)
    response.raise_for_status()
    return response.json()
```

## Testing Exception Chaining

### Unit Tests for Exception Chaining

```python
import pytest

def test_import_error_chaining():
    """Test that ImportError is properly chained."""
    with pytest.raises(ImportError) as exc_info:
        try:
            import nonexistent_module
        except ImportError as e:
            raise ImportError("Custom error message") from e

    # Check that the original exception is chained
    assert exc_info.value.__cause__ is not None
    assert "nonexistent_module" in str(exc_info.value.__cause__)

def test_exception_suppression():
    """Test that exceptions can be suppressed with from None."""
    with pytest.raises(ValueError) as exc_info:
        try:
            raise RuntimeError("Internal error")
        except RuntimeError:
            raise ValueError("User-friendly error") from None

    # Check that the original exception is suppressed
    assert exc_info.value.__cause__ is None
```

### Integration Tests

```python
def test_database_connection_error_chaining():
    """Test database connection error chaining."""
    with pytest.raises(DatabaseConnectionError) as exc_info:
        db_manager = DatabaseManager("invalid://connection/string")
        db_manager.connect()

    # Verify the original psycopg2 error is chained
    assert exc_info.value.__cause__ is not None
    assert isinstance(exc_info.value.__cause__, psycopg2.OperationalError)
```

## Best Practices

### 1. Always Chain Exceptions in Except Clauses

```python
# ✅ Good: Preserve context
try:
    risky_operation()
except SpecificError as exc:
    raise CustomError("Operation failed") from exc

# ❌ Bad: Lose context
try:
    risky_operation()
except SpecificError:
    raise CustomError("Operation failed")
```

### 2. Use `from None` When Original Context is Irrelevant

```python
# ✅ Good: Suppress irrelevant technical details
try:
    complex_internal_operation()
except Exception:
    raise UserFriendlyError("Something went wrong") from None

# ❌ Bad: Expose internal implementation
try:
    complex_internal_operation()
except Exception as exc:
    raise UserFriendlyError("Something went wrong") from exc
```

### 3. Provide Meaningful Error Messages

```python
# ✅ Good: Clear, actionable error message
try:
    load_config("config.json")
except FileNotFoundError as exc:
    raise ConfigurationError(
        "Configuration file 'config.json' not found. "
        "Please ensure the file exists in the current directory."
    ) from exc

# ❌ Bad: Vague error message
try:
    load_config("config.json")
except FileNotFoundError as exc:
    raise ConfigurationError("Error") from exc
```

### 4. Log Exception Chains

```python
import logging

logger = logging.getLogger(__name__)

def process_data(data: dict) -> dict:
    """Process data with comprehensive logging."""
    try:
        return perform_processing(data)
    except ProcessingError as exc:
        # Log the full exception chain
        logger.error("Data processing failed", exc_info=True)
        raise DataError("Failed to process data") from exc
```

## Performance Considerations

### Exception Chaining Overhead

Exception chaining has minimal performance overhead:

```python
import time

def benchmark_exception_chaining():
    """Benchmark exception chaining performance."""
    start_time = time.time()

    for _ in range(10000):
        try:
            raise ValueError("Original error")
        except ValueError as exc:
            raise RuntimeError("Chained error") from exc

    end_time = time.time()
    print(f"Exception chaining: {end_time - start_time:.4f} seconds")
```

### Memory Usage

Exception chains use minimal additional memory:

```python
import sys

def measure_exception_memory():
    """Measure memory usage of exception chains."""
    try:
        raise ValueError("Original")
    except ValueError as exc:
        raise RuntimeError("Chained") from exc

    # Exception chains add ~100-200 bytes per level
    print(f"Exception size: {sys.getsizeof(exc)} bytes")
```

## Troubleshooting

### Common Issues

#### Issue: Exception Chain Not Showing

**Symptoms**: Only the final exception is displayed
**Causes**: Exception handling code not preserving the chain
**Solutions**:

```python
# Ensure proper chaining
try:
    risky_operation()
except OriginalError as exc:
    raise NewError("Context") from exc  # Use 'from exc'
```

#### Issue: Too Much Exception Context

**Symptoms**: Exception traces are too verbose
**Causes**: Chaining exceptions that don't add value
**Solutions**:

```python
# Suppress irrelevant context
try:
    internal_operation()
except Exception:
    raise UserError("User message") from None  # Use 'from None'
```

#### Issue: Exception Chain Broken

**Symptoms**: `__cause__` is None when it shouldn't be
**Causes**: Re-raising without proper chaining
**Solutions**:

```python
# Check your exception handling
try:
    operation()
except Error as exc:
    # Don't do this:
    # raise NewError("msg")  # Loses chain

    # Do this:
    raise NewError("msg") from exc  # Preserves chain
```

## Conclusion

🦊 _Exception chaining requires the cunning of a fox - knowing when to preserve context and
when to suppress it for the benefit of those who will debug your code._

Proper exception chaining is essential for:

- **Debugging**: Preserving the full context of errors
- **User Experience**: Providing clear, actionable error messages
- **Maintainability**: Making code easier to troubleshoot and fix
- **Professional Code**: Following Python best practices

Key principles:

- **Always use `from exc`** when re-raising exceptions in except clauses
- **Use `from None`** when the original context is irrelevant or confusing
- **Provide meaningful error messages** that help users understand what went wrong
- **Test exception chains** to ensure they work as expected
- **Log exception chains** for comprehensive error tracking

By following these patterns and best practices, you'll create robust,
maintainable Python code that provides excellent error context and debugging information.

_Build error handling that outfoxes complexity and provides clarity._ 🦊

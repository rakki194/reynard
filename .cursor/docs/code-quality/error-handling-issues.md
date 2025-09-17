# Error Handling Issues Guide

Implementing robust error handling for reliable and maintainable Python applications.

## Overview

Error handling issues include the try-except-pass anti-pattern, overly broad exception handling, and
improper error propagation. Poor error handling can lead to silent failures, difficult debugging, and
unreliable applications. This guide shows how to implement proper error handling patterns that
make code more robust and maintainable.

## Try-Except-Pass Anti-Pattern

### The Problem: Silent Failures

**❌ Silent Failure:**

```python
def parse_config(config_data: str) -> dict:
    try:
        return json.loads(config_data)
    except json.JSONDecodeError:
        pass  # Silent failure - bad!

    return {}

def process_file(file_path: str) -> bool:
    try:
        with open(file_path, 'r') as f:
            content = f.read()
        process_content(content)
        return True
    except FileNotFoundError:
        pass  # File not found, but we don't know why it failed
    except PermissionError:
        pass  # Permission denied, but we don't know why it failed
    except Exception:
        pass  # Any other error, but we don't know what happened

    return False
```

**Problems:**

- Silent failures hide important errors
- Difficult to debug issues
- No logging or monitoring
- Users get no feedback about failures
- Can lead to data corruption or inconsistent state

### The Solution: Proper Error Handling

**✅ Proper Error Handling:**

```python
import logging
import json
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

def parse_config(config_data: str) -> Dict[str, Any]:
    """Parse configuration with proper error handling."""
    try:
        return json.loads(config_data)
    except json.JSONDecodeError as e:
        logger.error("Invalid JSON configuration: %s", e)
        return {}
    except Exception as e:
        logger.error("Unexpected error parsing config: %s", e)
        return {}

def process_file(file_path: str) -> bool:
    """Process file with proper error handling."""
    try:
        with open(file_path, 'r') as f:
            content = f.read()
        process_content(content)
        return True
    except FileNotFoundError:
        logger.error("File not found: %s", file_path)
        return False
    except PermissionError:
        logger.error("Permission denied accessing file: %s", file_path)
        return False
    except Exception as e:
        logger.error("Unexpected error processing file %s: %s", file_path, e)
        return False
```

## Overly Broad Exception Handling

### The Problem: Catching Everything

**❌ Too Broad:**

```python
def process_data(data: list) -> list:
    try:
        return [item * 2 for item in data]
    except Exception:  # Too broad
        return []

def connect_to_database(connection_string: str) -> bool:
    try:
        # Database connection code
        return True
    except Exception:  # Catches everything
        return False

def send_email(recipient: str, message: str) -> bool:
    try:
        # Email sending code
        return True
    except Exception:  # Catches everything
        return False
```

**Problems:**

- Hides specific error types
- Makes debugging difficult
- Can catch system errors that should propagate
- No way to handle different errors differently
- Can mask programming errors

### The Solution: Specific Exception Handling

**✅ Specific Handling:**

```python
def process_data(data: list) -> list:
    """Process data with specific error handling."""
    try:
        return [item * 2 for item in data]
    except TypeError as e:
        logger.error("Invalid data type: %s", e)
        return []
    except ValueError as e:
        logger.error("Invalid data value: %s", e)
        return []
    except MemoryError as e:
        logger.error("Insufficient memory: %s", e)
        raise  # Re-raise system errors

def connect_to_database(connection_string: str) -> bool:
    """Connect to database with specific error handling."""
    try:
        # Database connection code
        return True
    except ConnectionError as e:
        logger.error("Database connection failed: %s", e)
        return False
    except TimeoutError as e:
        logger.error("Database connection timeout: %s", e)
        return False
    except PermissionError as e:
        logger.error("Database permission denied: %s", e)
        return False
    except Exception as e:
        logger.error("Unexpected database error: %s", e)
        raise  # Re-raise unexpected errors

def send_email(recipient: str, message: str) -> bool:
    """Send email with specific error handling."""
    try:
        # Email sending code
        return True
    except ConnectionError as e:
        logger.error("Email service connection failed: %s", e)
        return False
    except TimeoutError as e:
        logger.error("Email service timeout: %s", e)
        return False
    except ValueError as e:
        logger.error("Invalid email parameters: %s", e)
        return False
```

## Advanced Error Handling Patterns

### 1. Custom Exception Classes

```python
class ApplicationError(Exception):
    """Base exception for application errors."""
    pass

class ValidationError(ApplicationError):
    """Raised when data validation fails."""

    def __init__(self, message: str, field: str = None):
        super().__init__(message)
        self.field = field

class DatabaseError(ApplicationError):
    """Raised when database operations fail."""

    def __init__(self, message: str, operation: str = None):
        super().__init__(message)
        self.operation = operation

class ExternalServiceError(ApplicationError):
    """Raised when external service calls fail."""

    def __init__(self, message: str, service: str = None, status_code: int = None):
        super().__init__(message)
        self.service = service
        self.status_code = status_code

# Usage
def validate_user_data(user_data: dict) -> None:
    """Validate user data with custom exceptions."""
    if not user_data.get('email'):
        raise ValidationError("Email is required", field="email")

    if '@' not in user_data['email']:
        raise ValidationError("Invalid email format", field="email")

    if not user_data.get('name'):
        raise ValidationError("Name is required", field="name")

def save_user_to_database(user_data: dict) -> None:
    """Save user to database with custom exceptions."""
    try:
        # Database save operation
        pass
    except ConnectionError as e:
        raise DatabaseError(f"Database connection failed: {e}", operation="save")
    except IntegrityError as e:
        raise DatabaseError(f"Data integrity violation: {e}", operation="save")
```

### 2. Error Context and Chaining

```python
import traceback
from typing import Optional

class ErrorContext:
    """Context manager for error handling."""

    def __init__(self, operation: str, context: dict = None):
        self.operation = operation
        self.context = context or {}

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is not None:
            logger.error(
                "Error in %s: %s",
                self.operation,
                exc_val,
                extra={'context': self.context, 'traceback': traceback.format_exc()}
            )
        return False  # Don't suppress the exception

# Usage
def process_user_registration(user_data: dict) -> dict:
    """Process user registration with error context."""
    with ErrorContext("user_registration", {"user_email": user_data.get('email')}):
        validate_user_data(user_data)

        with ErrorContext("database_save", {"user_id": user_data.get('id')}):
            save_user_to_database(user_data)

        with ErrorContext("email_notification", {"recipient": user_data['email']}):
            send_welcome_email(user_data['email'])

        return {"status": "success", "user_id": user_data['id']}
```

### 3. Retry Mechanisms

```python
import time
import random
from functools import wraps
from typing import Callable, Type, Tuple

def retry(
    max_attempts: int = 3,
    delay: float = 1.0,
    backoff_factor: float = 2.0,
    exceptions: Tuple[Type[Exception], ...] = (Exception,)
):
    """Decorator for retrying functions with exponential backoff."""

    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            last_exception = None

            for attempt in range(max_attempts):
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    last_exception = e

                    if attempt == max_attempts - 1:
                        logger.error(
                            "Function %s failed after %d attempts: %s",
                            func.__name__, max_attempts, e
                        )
                        raise

                    wait_time = delay * (backoff_factor ** attempt)
                    jitter = random.uniform(0, wait_time * 0.1)
                    total_wait = wait_time + jitter

                    logger.warning(
                        "Function %s failed (attempt %d/%d), retrying in %.2f seconds: %s",
                        func.__name__, attempt + 1, max_attempts, total_wait, e
                    )

                    time.sleep(total_wait)

            raise last_exception

        return wrapper
    return decorator

# Usage
@retry(max_attempts=3, delay=1.0, exceptions=(ConnectionError, TimeoutError))
def fetch_data_from_api(url: str) -> dict:
    """Fetch data from API with retry logic."""
    # API call implementation
    pass

@retry(max_attempts=5, delay=0.5, exceptions=(DatabaseError,))
def save_to_database(data: dict) -> bool:
    """Save to database with retry logic."""
    # Database save implementation
    pass
```

### 4. Circuit Breaker Pattern

```python
import time
from enum import Enum
from typing import Callable, Any

class CircuitState(Enum):
    CLOSED = "closed"
    OPEN = "open"
    HALF_OPEN = "half_open"

class CircuitBreaker:
    """Circuit breaker for handling external service failures."""

    def __init__(
        self,
        failure_threshold: int = 5,
        recovery_timeout: float = 60.0,
        expected_exception: Type[Exception] = Exception
    ):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.expected_exception = expected_exception

        self.failure_count = 0
        self.last_failure_time = None
        self.state = CircuitState.CLOSED

    def call(self, func: Callable, *args, **kwargs) -> Any:
        """Call function through circuit breaker."""
        if self.state == CircuitState.OPEN:
            if self._should_attempt_reset():
                self.state = CircuitState.HALF_OPEN
            else:
                raise Exception("Circuit breaker is OPEN")

        try:
            result = func(*args, **kwargs)
            self._on_success()
            return result
        except self.expected_exception as e:
            self._on_failure()
            raise

    def _should_attempt_reset(self) -> bool:
        """Check if we should attempt to reset the circuit."""
        return (
            self.last_failure_time and
            time.time() - self.last_failure_time >= self.recovery_timeout
        )

    def _on_success(self):
        """Handle successful call."""
        self.failure_count = 0
        self.state = CircuitState.CLOSED

    def _on_failure(self):
        """Handle failed call."""
        self.failure_count += 1
        self.last_failure_time = time.time()

        if self.failure_count >= self.failure_threshold:
            self.state = CircuitState.OPEN

# Usage
api_circuit_breaker = CircuitBreaker(
    failure_threshold=3,
    recovery_timeout=30.0,
    expected_exception=ConnectionError
)

def call_external_api(url: str) -> dict:
    """Call external API through circuit breaker."""
    return api_circuit_breaker.call(fetch_data_from_api, url)
```

## Error Handling Best Practices

### 1. Fail Fast and Explicit

```python
# ✅ Good: Fail fast with clear error
def process_user_data(user_data: dict) -> dict:
    """Process user data with fail-fast validation."""
    if not user_data:
        raise ValueError("User data cannot be empty")

    if not user_data.get('email'):
        raise ValueError("Email is required")

    if not user_data.get('name'):
        raise ValueError("Name is required")

    # Process valid data
    return {"status": "processed", "user": user_data}

# ❌ Bad: Silent failure
def process_user_data(user_data: dict) -> dict:
    """Process user data with silent failures."""
    if not user_data:
        return {"error": "No data"}

    if not user_data.get('email'):
        return {"error": "No email"}

    # Continue processing even with missing data
    return {"status": "processed"}
```

### 2. Use Specific Exception Types

```python
# ✅ Good: Specific exceptions
def validate_email(email: str) -> None:
    """Validate email with specific exceptions."""
    if not email:
        raise ValueError("Email cannot be empty")

    if '@' not in email:
        raise ValueError("Email must contain @ symbol")

    if '.' not in email.split('@')[1]:
        raise ValueError("Email must have valid domain")

# ❌ Bad: Generic exception
def validate_email(email: str) -> None:
    """Validate email with generic exception."""
    if not email or '@' not in email:
        raise Exception("Invalid email")
```

### 3. Log Errors Appropriately

```python
import logging
import traceback

logger = logging.getLogger(__name__)

def process_data_with_logging(data: list) -> list:
    """Process data with appropriate logging."""
    try:
        return [item * 2 for item in data]
    except TypeError as e:
        logger.error("Type error in data processing: %s", e)
        logger.debug("Data that caused error: %s", data)
        raise
    except ValueError as e:
        logger.error("Value error in data processing: %s", e)
        logger.debug("Data that caused error: %s", data)
        raise
    except Exception as e:
        logger.error("Unexpected error in data processing: %s", e)
        logger.error("Full traceback: %s", traceback.format_exc())
        raise
```

### 4. Handle Errors at Appropriate Levels

```python
# Low-level function: Let errors propagate
def read_file_content(file_path: str) -> str:
    """Read file content, let errors propagate."""
    with open(file_path, 'r') as f:
        return f.read()

# Mid-level function: Handle specific errors
def process_file(file_path: str) -> dict:
    """Process file with error handling."""
    try:
        content = read_file_content(file_path)
        return {"content": content, "status": "success"}
    except FileNotFoundError:
        logger.error("File not found: %s", file_path)
        return {"error": "File not found", "status": "error"}
    except PermissionError:
        logger.error("Permission denied: %s", file_path)
        return {"error": "Permission denied", "status": "error"}

# High-level function: Handle all errors gracefully
def handle_file_processing_request(file_path: str) -> dict:
    """Handle file processing request with comprehensive error handling."""
    try:
        result = process_file(file_path)
        return result
    except Exception as e:
        logger.error("Unexpected error processing file %s: %s", file_path, e)
        return {"error": "Internal server error", "status": "error"}
```

## Error Recovery Strategies

### 1. Graceful Degradation

```python
def get_user_preferences(user_id: str) -> dict:
    """Get user preferences with graceful degradation."""
    try:
        # Try to get from cache
        preferences = get_from_cache(f"user_prefs_{user_id}")
        if preferences:
            return preferences
    except Exception as e:
        logger.warning("Cache lookup failed: %s", e)

    try:
        # Try to get from database
        preferences = get_from_database(user_id)
        # Cache for next time
        try:
            set_cache(f"user_prefs_{user_id}", preferences)
        except Exception as e:
            logger.warning("Cache write failed: %s", e)
        return preferences
    except DatabaseError as e:
        logger.error("Database lookup failed: %s", e)
        # Return default preferences
        return get_default_preferences()
```

### 2. Fallback Mechanisms

```python
def send_notification(user_id: str, message: str) -> bool:
    """Send notification with fallback mechanisms."""
    # Try primary notification service
    try:
        return send_via_primary_service(user_id, message)
    except ServiceUnavailableError:
        logger.warning("Primary notification service unavailable")

    # Try secondary notification service
    try:
        return send_via_secondary_service(user_id, message)
    except ServiceUnavailableError:
        logger.warning("Secondary notification service unavailable")

    # Try email as fallback
    try:
        user_email = get_user_email(user_id)
        return send_email(user_email, message)
    except Exception as e:
        logger.error("All notification methods failed: %s", e)
        return False
```

### 3. Data Validation and Sanitization

```python
def sanitize_user_input(data: dict) -> dict:
    """Sanitize user input with error handling."""
    sanitized = {}

    for key, value in data.items():
        try:
            if isinstance(value, str):
                # Remove dangerous characters
                sanitized[key] = value.strip().replace('<', '&lt;').replace('>', '&gt;')
            elif isinstance(value, (int, float)):
                sanitized[key] = value
            else:
                # Convert to string and sanitize
                sanitized[key] = str(value).strip()
        except Exception as e:
            logger.warning("Failed to sanitize field %s: %s", key, e)
            sanitized[key] = ""  # Default to empty string

    return sanitized
```

## Conclusion

🐺 _Error handling requires the ferocity of a wolf - hunting down every possible failure mode and
eliminating weaknesses with relentless determination._

Implementing proper error handling provides:

- **Reliability**: Applications continue to function despite errors
- **Debugging**: Clear error messages and logging for troubleshooting
- **User Experience**: Graceful handling of failures
- **Monitoring**: Visibility into system health and issues
- **Maintainability**: Easier to identify and fix problems

Key principles:

- **Fail fast and explicit** with clear error messages
- **Use specific exception types** instead of generic ones
- **Log errors appropriately** with context and severity
- **Handle errors at appropriate levels** in the call stack
- **Implement recovery strategies** for graceful degradation
- **Use retry mechanisms** for transient failures
- **Apply circuit breakers** for external service calls

_Build code that howls with confidence, knowing every error has been hunted down and handled._ 🐺

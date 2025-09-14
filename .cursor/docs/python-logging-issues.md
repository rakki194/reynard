# Python Logging Issues

_Comprehensive guide to logging warnings and errors in Python development_

## Overview

This document covers common logging issues encountered during Python development, particularly when working with modern Python codebases. Each issue includes the error message, explanation, and practical solutions with real-world examples from the Reynard project.

## Lazy Logging Format

### Warning Message

```
Use lazy % formatting in logging functions
```

### Problem

F-strings in logging calls are evaluated even when the log level would prevent output. This can cause significant performance issues in production environments.

### ❌ Inefficient

```python
logger.info(f"Initialized Argon2 with {level} security (t={time}, m={memory})")
logger.warning(f"Rate limit exceeded for IP: {client_ip}")
logger.error(f"Error during email authentication: {e}")
```

### ✅ Lazy Formatting

```python
logger.info(
    "Initialized Argon2 with %s security (t=%d, m=%d, p=%d)",
    level, time, memory, parallelism
)
logger.warning("Rate limit exceeded for IP: %s", client_ip)
logger.error("Error during email authentication: %s", e)
```

### Performance Impact

- **F-strings are always evaluated** - even when logging is disabled
- **Lazy formatting only evaluates when logging level allows output** - significant performance improvement
- **Memory usage** - f-strings create temporary string objects
- **CPU usage** - string formatting happens regardless of log level

### Real-World Example from Reynard

```python
# libraries/gatekeeper/gatekeeper/core/auth_manager.py
async def authenticate(
    self, username: str, password: str, client_ip: str | None = None
) -> TokenResponse | None:
    # Rate limiting check
    if client_ip and not self.token_manager.check_rate_limit(client_ip):
        logger.warning("Rate limit exceeded for IP: %s", client_ip)
        return None

    # Get user from backend
    user = await self.backend.get_user_by_username(username)
    if not user:
        logger.warning("Authentication failed: user '%s' not found", username)
        return None

    # Check if user is active
    if not user.is_active:
        logger.warning("Authentication failed: user '%s' is inactive", username)
        return None

    # Verify password
    is_valid, updated_hash = self.password_manager.verify_and_update_password(
        password, user.password_hash
    )

    if not is_valid:
        logger.warning(
            "Authentication failed: invalid password for user '%s'", username
        )
        return None

    # Create tokens
    token_data: dict[str, Any] = {
        "sub": user.username,
        "role": user.role.value,
        "permissions": user.permissions or [],
        "user_id": str(user.id),
    }

    tokens = self.token_manager.create_tokens(token_data)
    logger.info("User '%s' authenticated successfully", username)
    return tokens
```

### When F-strings Are Acceptable

```python
# When the string is simple and performance is not critical
logger.debug(f"Processing item {item_id}")  # Debug level is often disabled

# When you need complex formatting
logger.info(f"User {user.name} ({user.email}) logged in from {client_ip}")
# Better as:
logger.info("User %s (%s) logged in from %s", user.name, user.email, client_ip)
```

## Logging Exception Handling

### Warning Message

```
Use `logging.exception` instead of `logging.error`
```

### Problem

When logging exceptions, using `logging.exception` automatically includes the exception traceback, making debugging easier.

### ❌ Manual Exception Logging

```python
try:
    risky_operation()
except Exception as e:
    logger.error("Error during operation: %s", e)
    # Traceback is lost
```

### ✅ Automatic Exception Logging

```python
try:
    risky_operation()
except Exception as e:
    logger.exception("Error during operation")
    # Traceback is automatically included
```

### Real-World Example from Reynard

```python
# libraries/gatekeeper/gatekeeper/core/auth_manager.py
async def authenticate_by_email(
    self, email: str, password: str
) -> TokenResponse | None:
    """Authenticate a user with email and password."""
    try:
        # Get user from backend by email
        user = await self.backend.get_user_by_email(email)
        if not user:
            logger.warning(
                "Authentication failed: user with email '%s' not found", email
            )
            return None

        # ... authentication logic ...

        logger.info("User with email '%s' authenticated successfully", email)
        return tokens

    except Exception as e:
        logger.exception("Error during email authentication")
        return None
```

### Logging Levels and Exception Handling

```python
# Different levels for different scenarios
try:
    result = operation()
    logger.debug("Operation completed successfully: %s", result)
except ValueError as e:
    logger.warning("Invalid input: %s", e)
except PermissionError as e:
    logger.error("Permission denied: %s", e)
except Exception as e:
    logger.exception("Unexpected error during operation")
```

## Logging Configuration

### Basic Logging Setup

```python
import logging
import sys

# Configure root logger
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('app.log')
    ]
)

# Create logger for your module
logger = logging.getLogger(__name__)
```

### Advanced Logging Configuration

```python
import logging
import logging.config
import sys
from pathlib import Path

# Logging configuration
LOGGING_CONFIG = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'standard': {
            'format': '%(asctime)s [%(levelname)s] %(name)s: %(message)s'
        },
        'detailed': {
            'format': '%(asctime)s [%(levelname)s] %(name)s:%(lineno)d: %(message)s'
        },
    },
    'handlers': {
        'default': {
            'level': 'INFO',
            'formatter': 'standard',
            'class': 'logging.StreamHandler',
            'stream': sys.stdout,
        },
        'file': {
            'level': 'DEBUG',
            'formatter': 'detailed',
            'class': 'logging.FileHandler',
            'filename': 'app.log',
            'mode': 'a',
        },
        'error_file': {
            'level': 'ERROR',
            'formatter': 'detailed',
            'class': 'logging.FileHandler',
            'filename': 'errors.log',
            'mode': 'a',
        },
    },
    'loggers': {
        '': {  # Root logger
            'handlers': ['default', 'file'],
            'level': 'DEBUG',
            'propagate': False
        },
        'gatekeeper': {  # Gatekeeper-specific logger
            'handlers': ['default', 'file', 'error_file'],
            'level': 'DEBUG',
            'propagate': False
        },
    }
}

# Apply configuration
logging.config.dictConfig(LOGGING_CONFIG)
```

## Logging Best Practices

### 1. Use Appropriate Log Levels

```python
# DEBUG: Detailed information for debugging
logger.debug("Processing user %s with %d items", user_id, item_count)

# INFO: General information about program execution
logger.info("User %s authenticated successfully", username)

# WARNING: Something unexpected happened but the program can continue
logger.warning("Rate limit exceeded for IP: %s", client_ip)

# ERROR: A serious problem occurred
logger.error("Failed to connect to database")

# CRITICAL: A very serious error occurred
logger.critical("System is out of memory")
```

### 2. Include Context in Log Messages

```python
# ✅ Good context
logger.info("User %s (%s) logged in from %s", username, user_id, client_ip)
logger.warning("Authentication failed for user %s from IP %s", username, client_ip)

# ❌ Poor context
logger.info("User logged in")
logger.warning("Authentication failed")
```

### 3. Use Structured Logging

```python
import json
import logging

class StructuredFormatter(logging.Formatter):
    def format(self, record):
        log_entry = {
            'timestamp': self.formatTime(record),
            'level': record.levelname,
            'logger': record.name,
            'message': record.getMessage(),
            'module': record.module,
            'function': record.funcName,
            'line': record.lineno,
        }

        # Add extra fields if present
        if hasattr(record, 'user_id'):
            log_entry['user_id'] = record.user_id
        if hasattr(record, 'request_id'):
            log_entry['request_id'] = record.request_id

        return json.dumps(log_entry)

# Usage
logger = logging.getLogger(__name__)
logger.info("User authenticated", extra={'user_id': user_id, 'request_id': request_id})
```

### 4. Avoid Logging Sensitive Information

```python
# ❌ Never log sensitive data
logger.info("User %s logged in with password %s", username, password)
logger.debug("Token: %s", access_token)

# ✅ Log safely
logger.info("User %s logged in successfully", username)
logger.debug("Token length: %d", len(access_token))
```

## Performance Considerations

### Logging Performance Impact

```python
# ❌ Expensive operations in logging calls
logger.debug(f"Processing {expensive_operation()}")  # Always executed

# ✅ Conditional logging
if logger.isEnabledFor(logging.DEBUG):
    logger.debug("Processing %s", expensive_operation())

# ✅ Use lazy evaluation
logger.debug("Processing %s", expensive_operation)  # Only executed if DEBUG enabled
```

### Logging in Loops

```python
# ❌ Logging in tight loops
for item in items:
    logger.debug(f"Processing item {item}")  # Can be expensive

# ✅ Batch logging or conditional logging
if logger.isEnabledFor(logging.DEBUG):
    for item in items:
        logger.debug("Processing item %s", item)

# ✅ Log summary instead
logger.info("Processing %d items", len(items))
```

## Tools and Configuration

### Pylint Configuration

```toml
# pyproject.toml
[tool.pylint.messages_control]
disable = [
    "logging-fstring-interpolation",  # Check for f-strings in logging
    "logging-format-interpolation",   # Check for lazy formatting
]
```

### Flake8 Configuration

```toml
# pyproject.toml
[tool.flake8]
extend-ignore = ["G201"]  # Allow logging.exception
```

### Pre-commit Hooks

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/pycqa/flake8
    rev: 6.0.0
    hooks:
      - id: flake8
        args: [--select=G201, G202] # Check logging issues
```

## Troubleshooting

### Common Issues

#### Issue: Logs Not Appearing

**Symptoms**: Log messages not showing up
**Causes**: Incorrect log level configuration or handler setup
**Solutions**:

```python
# Check logger level
logger = logging.getLogger(__name__)
print(f"Logger level: {logger.level}")
print(f"Effective level: {logger.getEffectiveLevel()}")

# Check handler levels
for handler in logger.handlers:
    print(f"Handler level: {handler.level}")

# Force log level
logger.setLevel(logging.DEBUG)
```

#### Issue: Duplicate Log Messages

**Symptoms**: Same log message appearing multiple times
**Causes**: Logger propagation or multiple handlers
**Solutions**:

```python
# Disable propagation
logger.propagate = False

# Remove duplicate handlers
logger.handlers.clear()
```

#### Issue: Performance Issues with Logging

**Symptoms**: Slow application performance
**Causes**: Expensive operations in logging calls
**Solutions**:

```python
# Use lazy evaluation
logger.debug("Processing %s", expensive_operation)

# Check log level before expensive operations
if logger.isEnabledFor(logging.DEBUG):
    logger.debug("Processing %s", expensive_operation())
```

## Real-World Examples

### Authentication System Logging

```python
# libraries/gatekeeper/gatekeeper/core/auth_manager.py
class AuthManager:
    def __init__(self, backend: UserBackend, token_config: TokenConfig):
        self.logger = logging.getLogger(__name__)
        self.backend = backend
        self.token_config = token_config

    async def create_user(self, user: UserCreate) -> User:
        """Create a new user with hashed password."""
        try:
            # Hash the password
            password_hash = self.password_manager.hash_password(user.password)

            # Create user in backend
            created_user = await self.backend.create_user(user)

            # Update the password hash
            await self.backend.update_user_password(created_user.username, password_hash)

            self.logger.info("Created user '%s' with role '%s'", user.username, user.role)
            return created_user

        except Exception as e:
            self.logger.exception("Failed to create user '%s'", user.username)
            raise

    async def authenticate(
        self, username: str, password: str, client_ip: str | None = None
    ) -> TokenResponse | None:
        """Authenticate a user with username and password."""
        try:
            # Rate limiting check
            if client_ip and not self.token_manager.check_rate_limit(client_ip):
                self.logger.warning("Rate limit exceeded for IP: %s", client_ip)
                return None

            # Get user from backend
            user = await self.backend.get_user_by_username(username)
            if not user:
                self.logger.warning("Authentication failed: user '%s' not found", username)
                return None

            # Check if user is active
            if not user.is_active:
                self.logger.warning("Authentication failed: user '%s' is inactive", username)
                return None

            # Verify password
            is_valid, updated_hash = self.password_manager.verify_and_update_password(
                password, user.password_hash
            )

            if not is_valid:
                self.logger.warning(
                    "Authentication failed: invalid password for user '%s'", username
                )
                return None

            # Update password hash if needed
            if updated_hash:
                await self.backend.update_user_password(username, updated_hash)
                self.logger.info("Password hash updated for user '%s'", username)

            # Create tokens
            token_data: dict[str, Any] = {
                "sub": user.username,
                "role": user.role.value,
                "permissions": user.permissions or [],
                "user_id": str(user.id),
            }

            tokens = self.token_manager.create_tokens(token_data)
            self.logger.info("User '%s' authenticated successfully", username)
            return tokens

        except Exception as e:
            self.logger.exception("Error during authentication for user '%s'", username)
            return None
```

## Conclusion

🦊 _Logging requires the precision of a fox - knowing exactly what to log and when to log it._

Proper logging is essential for debugging and monitoring Python applications. The key principles are:

- **Use lazy formatting** to avoid performance issues
- **Use appropriate log levels** for different types of messages
- **Include context** in log messages for better debugging
- **Use logging.exception** for automatic traceback inclusion
- **Avoid logging sensitive information** for security
- **Consider performance** when logging in tight loops

By following these guidelines and using the provided examples, you can create Python applications with excellent logging that aids in debugging and monitoring.

_Build logging that outfoxes complexity and provides clarity._ 🦊

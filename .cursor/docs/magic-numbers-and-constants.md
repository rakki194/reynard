# Magic Numbers and Constants Guide

Eliminating hard-coded values for maintainable and self-documenting code.

## Overview

Magic numbers are hard-coded numeric values that appear in code without explanation of their meaning or
purpose. They make code difficult to understand, maintain, and
modify. This guide shows how to replace magic numbers with named constants that clearly communicate intent and
make code more maintainable.

## The Problem: Hard-coded Values

**❌ Magic Numbers:**

```python
def parse_hash(hashed_password: str) -> bool:
    parts = hashed_password.split("$")
    if len(parts) < 5:  # What does 5 represent?
        return True

    param_parts = params_str.split(",")
    if len(param_parts) != 3:  # What does 3 represent?
        return True

    if len(password) < 8:  # Why 8?
        return False

    if len(password) > 128:  # Why 128?
        return False
```

**Problems:**

- Unclear meaning of numbers
- Difficult to maintain and update
- No documentation of constraints
- Hard to understand business logic
- Makes code reviews challenging

## The Solution: Named Constants

**✅ Named Constants:**

```python
# Constants for hash parsing
ARGON2_HASH_MIN_PARTS = 5
ARGON2_PARAMS_COUNT = 3

# Password validation constants
MIN_PASSWORD_LENGTH = 8
MAX_PASSWORD_LENGTH = 128

def parse_hash(hashed_password: str) -> bool:
    parts = hashed_password.split("$")
    if len(parts) < ARGON2_HASH_MIN_PARTS:
        return True

    param_parts = params_str.split(",")
    if len(param_parts) != ARGON2_PARAMS_COUNT:
        return True

    if len(password) < MIN_PASSWORD_LENGTH:
        return False

    if len(password) > MAX_PASSWORD_LENGTH:
        return False
```

## Advanced Constant Patterns

### Enum-based Constants

```python
from enum import Enum
from dataclasses import dataclass

class SecurityLevel(Enum):
    """Security levels for cryptographic operations."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    PARANOID = "paranoid"

@dataclass
class SecurityParams:
    """Security parameters for cryptographic operations."""
    time_cost: int
    memory_cost: int
    parallelism: int
    hash_len: int
    salt_len: int

# Security parameter presets
SECURITY_PARAMS = {
    SecurityLevel.LOW: SecurityParams(
        time_cost=2,
        memory_cost=2**16,  # 64 MiB
        parallelism=1,
        hash_len=32,
        salt_len=16,
    ),
    SecurityLevel.MEDIUM: SecurityParams(
        time_cost=3,
        memory_cost=2**17,  # 128 MiB
        parallelism=2,
        hash_len=32,
        salt_len=16,
    ),
    SecurityLevel.HIGH: SecurityParams(
        time_cost=4,
        memory_cost=2**18,  # 256 MiB
        parallelism=4,
        hash_len=32,
        salt_len=16,
    ),
    SecurityLevel.PARANOID: SecurityParams(
        time_cost=5,
        memory_cost=2**19,  # 512 MiB
        parallelism=8,
        hash_len=32,
        salt_len=16,
    ),
}

def get_security_params(level: SecurityLevel) -> SecurityParams:
    """Get security parameters for the specified level."""
    return SECURITY_PARAMS[level]
```

### Configuration-based Constants

```python
from typing import Dict, Any
import os

class Config:
    """Application configuration with environment variable support."""

    # Database settings
    DB_HOST: str = os.getenv("DB_HOST", "localhost")
    DB_PORT: int = int(os.getenv("DB_PORT", "5432"))
    DB_NAME: str = os.getenv("DB_NAME", "reynard")

    # API settings
    API_TIMEOUT: int = int(os.getenv("API_TIMEOUT", "30"))
    MAX_RETRY_ATTEMPTS: int = int(os.getenv("MAX_RETRY_ATTEMPTS", "3"))
    RETRY_DELAY: float = float(os.getenv("RETRY_DELAY", "1.0"))

    # Security settings
    JWT_EXPIRY_HOURS: int = int(os.getenv("JWT_EXPIRY_HOURS", "24"))
    PASSWORD_MIN_LENGTH: int = int(os.getenv("PASSWORD_MIN_LENGTH", "8"))
    PASSWORD_MAX_LENGTH: int = int(os.getenv("PASSWORD_MAX_LENGTH", "128"))

    # File upload settings
    MAX_FILE_SIZE_MB: int = int(os.getenv("MAX_FILE_SIZE_MB", "10"))
    ALLOWED_EXTENSIONS: set = set(os.getenv("ALLOWED_EXTENSIONS", "jpg,png,pdf").split(","))

    @classmethod
    def get_database_url(cls) -> str:
        """Get complete database URL."""
        return f"postgresql://{cls.DB_HOST}:{cls.DB_PORT}/{cls.DB_NAME}"
```

### Class-based Constants

```python
class HTTPStatus:
    """HTTP status codes as class constants."""
    OK = 200
    CREATED = 201
    BAD_REQUEST = 400
    UNAUTHORIZED = 401
    FORBIDDEN = 403
    NOT_FOUND = 404
    INTERNAL_SERVER_ERROR = 500

class ErrorCodes:
    """Application-specific error codes."""
    VALIDATION_ERROR = "VALIDATION_ERROR"
    AUTHENTICATION_FAILED = "AUTHENTICATION_FAILED"
    PERMISSION_DENIED = "PERMISSION_DENIED"
    RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND"
    INTERNAL_ERROR = "INTERNAL_ERROR"

class Limits:
    """Application limits and thresholds."""
    MAX_ITEMS_PER_PAGE = 100
    MIN_ITEMS_PER_PAGE = 1
    DEFAULT_PAGE_SIZE = 20
    MAX_SEARCH_TERM_LENGTH = 255
    CACHE_TTL_SECONDS = 3600
```

## Best Practices

### 1. Use Descriptive Names

```python
# ✅ Good: Clear and descriptive
MAX_RETRY_ATTEMPTS = 3
DEFAULT_TIMEOUT_SECONDS = 30
MIN_PASSWORD_LENGTH = 8

# ❌ Bad: Unclear purpose
MAX_ATTEMPTS = 3
TIMEOUT = 30
MIN_LEN = 8
```

### 2. Group Related Constants

```python
# ✅ Good: Grouped by purpose
class DatabaseConfig:
    HOST = "localhost"
    PORT = 5432
    TIMEOUT = 30
    MAX_CONNECTIONS = 100

class APIConfig:
    BASE_URL = "https://api.example.com"
    TIMEOUT = 30
    MAX_RETRIES = 3
    RATE_LIMIT = 1000
```

### 3. Use Type Hints

```python
# ✅ Good: With type hints
MAX_RETRY_ATTEMPTS: int = 3
DEFAULT_TIMEOUT: float = 30.0
API_BASE_URL: str = "https://api.example.com"

# ❌ Bad: No type information
MAX_RETRY_ATTEMPTS = 3
DEFAULT_TIMEOUT = 30.0
API_BASE_URL = "https://api.example.com"
```

### 4. Document Complex Constants

```python
# ✅ Good: Well documented
# Argon2 hash format: $argon2id$v=19$m=65536,t=2,p=1$salt$hash
ARGON2_HASH_MIN_PARTS = 5  # Must have at least 5 parts for valid Argon2 hash
ARGON2_PARAMS_COUNT = 3    # Memory, time, and parallelism parameters

# Password strength requirements
MIN_PASSWORD_LENGTH = 8    # Minimum length for security
MAX_PASSWORD_LENGTH = 128  # Maximum length to prevent DoS attacks
```

## Common Magic Number Patterns

### Time and Duration

```python
# ❌ Magic numbers
time.sleep(5)
if timeout > 30:
    raise TimeoutError()

# ✅ Named constants
DEFAULT_SLEEP_DURATION = 5
MAX_TIMEOUT_SECONDS = 30

time.sleep(DEFAULT_SLEEP_DURATION)
if timeout > MAX_TIMEOUT_SECONDS:
    raise TimeoutError()
```

### Array and String Operations

```python
# ❌ Magic numbers
if len(items) > 100:
    items = items[:100]

if len(name) < 3:
    raise ValueError("Name too short")

# ✅ Named constants
MAX_ITEMS_DISPLAY = 100
MIN_NAME_LENGTH = 3

if len(items) > MAX_ITEMS_DISPLAY:
    items = items[:MAX_ITEMS_DISPLAY]

if len(name) < MIN_NAME_LENGTH:
    raise ValueError("Name too short")
```

### Mathematical Constants

```python
# ❌ Magic numbers
area = 3.14159 * radius ** 2
if temperature > 100:
    print("Boiling point reached")

# ✅ Named constants
PI = 3.14159
WATER_BOILING_POINT_CELSIUS = 100

area = PI * radius ** 2
if temperature > WATER_BOILING_POINT_CELSIUS:
    print("Boiling point reached")
```

## Tools and Detection

### Static Analysis Tools

```python
# Using pylint to detect magic numbers
# pylint: disable=magic-value-comparison
if len(data) > 100:  # This will trigger a warning
    process_data(data[:100])

# Better approach
MAX_DATA_SIZE = 100
if len(data) > MAX_DATA_SIZE:
    process_data(data[:MAX_DATA_SIZE])
```

### Custom Detection Script

```python
import ast
import re
from typing import List, Tuple

class MagicNumberDetector(ast.NodeVisitor):
    """Detect magic numbers in Python code."""

    def __init__(self):
        self.magic_numbers: List[Tuple[int, int, str]] = []  # line, col, value
        self.allowed_numbers = {0, 1, -1}  # Commonly acceptable numbers

    def visit_Constant(self, node):
        """Visit constant nodes (Python 3.8+)."""
        if isinstance(node.value, (int, float)):
            if node.value not in self.allowed_numbers:
                self.magic_numbers.append((
                    node.lineno,
                    node.col_offset,
                    str(node.value)
                ))
        self.generic_visit(node)

    def visit_Num(self, node):
        """Visit number nodes (Python < 3.8)."""
        if node.n not in self.allowed_numbers:
            self.magic_numbers.append((
                node.lineno,
                node.col_offset,
                str(node.n)
            ))
        self.generic_visit(node)

def find_magic_numbers(file_path: str) -> List[Tuple[int, int, str]]:
    """Find magic numbers in a Python file."""
    with open(file_path, 'r') as f:
        tree = ast.parse(f.read())

    detector = MagicNumberDetector()
    detector.visit(tree)
    return detector.magic_numbers
```

## Migration Strategy

### Step 1: Identify Magic Numbers

```python
# Before: Magic numbers everywhere
def process_user_data(user_data: dict) -> bool:
    if len(user_data.get('email', '')) < 5:
        return False

    if len(user_data.get('password', '')) < 8:
        return False

    if user_data.get('age', 0) < 13:
        return False

    return True
```

### Step 2: Extract Constants

```python
# After: Named constants
MIN_EMAIL_LENGTH = 5
MIN_PASSWORD_LENGTH = 8
MIN_AGE_REQUIREMENT = 13

def process_user_data(user_data: dict) -> bool:
    if len(user_data.get('email', '')) < MIN_EMAIL_LENGTH:
        return False

    if len(user_data.get('password', '')) < MIN_PASSWORD_LENGTH:
        return False

    if user_data.get('age', 0) < MIN_AGE_REQUIREMENT:
        return False

    return True
```

### Step 3: Organize and Document

```python
# Final: Well-organized constants with documentation
class UserValidationLimits:
    """Validation limits for user data."""

    # Email validation
    MIN_EMAIL_LENGTH = 5      # Minimum email length for basic validation
    MAX_EMAIL_LENGTH = 254    # RFC 5321 limit

    # Password requirements
    MIN_PASSWORD_LENGTH = 8   # Security best practice
    MAX_PASSWORD_LENGTH = 128 # Prevent DoS attacks

    # Age requirements
    MIN_AGE_REQUIREMENT = 13  # COPPA compliance
    MAX_AGE_REQUIREMENT = 150 # Reasonable upper limit

def process_user_data(user_data: dict) -> bool:
    """Process user data with validation limits."""
    email = user_data.get('email', '')
    password = user_data.get('password', '')
    age = user_data.get('age', 0)

    if not (UserValidationLimits.MIN_EMAIL_LENGTH <= len(email) <= UserValidationLimits.MAX_EMAIL_LENGTH):
        return False

    if not (UserValidationLimits.MIN_PASSWORD_LENGTH <= len(password) <= UserValidationLimits.MAX_PASSWORD_LENGTH):
        return False

    if not (UserValidationLimits.MIN_AGE_REQUIREMENT <= age <= UserValidationLimits.MAX_AGE_REQUIREMENT):
        return False

    return True
```

## Conclusion

🦊 _Mastering constants requires the cunning of a fox - knowing when
to extract values, how to name them meaningfully, and where to organize them for maximum clarity._

Replacing magic numbers with named constants provides:

- **Clarity**: Code becomes self-documenting
- **Maintainability**: Easy to update values in one place
- **Consistency**: Same values used throughout the codebase
- **Testability**: Constants can be easily mocked or overridden
- **Reviewability**: Code reviews become more meaningful

Key principles:

- **Extract all hard-coded values** into named constants
- **Use descriptive names** that explain the purpose
- **Group related constants** logically
- **Document complex constants** with comments
- **Use type hints** for better tooling support
- **Organize constants** in classes or modules

_Build code that outfoxes confusion with clear, maintainable constants._ 🦊

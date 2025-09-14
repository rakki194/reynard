# Python Type Safety Issues

Guide to type safety warnings and errors in Python development.

## Overview

## Table of Contents

- [Python Type Safety Issues](#python-type-safety-issues)
  - [Overview](#overview)
  - [Table of Contents](#table-of-contents)
  - [Returning Any from Typed Function](#returning-any-from-typed-function)
    - [Error Message](#error-message)
    - [Problem](#problem)
    - [❌ Type Mismatch](#-type-mismatch)
    - [✅ Explicit Type](#-explicit-type)
    - [Real-World Example from Reynard](#real-world-example-from-reynard)
    - [Common Scenarios](#common-scenarios)
  - [Missing Type Annotations](#missing-type-annotations)
    - [Error Message](#error-message-1)
    - [Problem](#problem-1)
    - [❌ Missing Annotation](#-missing-annotation)
    - [✅ Explicit Annotation](#-explicit-annotation)
    - [Real-World Example from Reynard](#real-world-example-from-reynard-1)
    - [Common Scenarios Requiring Type Annotations](#common-scenarios-requiring-type-annotations)
  - [Type Compatibility Issues](#type-compatibility-issues)
    - [Error Message](#error-message-2)
    - [Problem](#problem-2)
    - [❌ Type Mismatch](#-type-mismatch-1)
    - [✅ Correct Type](#-correct-type)
    - [Real-World Example from Reynard](#real-world-example-from-reynard-2)
  - [Generic Type Issues](#generic-type-issues)
    - [Error Message](#error-message-3)
    - [Problem](#problem-3)
    - [❌ Undefined Type Variable](#-undefined-type-variable)
    - [✅ Proper Generic Definition](#-proper-generic-definition)
    - [Real-World Example](#real-world-example)
  - [Protocol and Interface Issues](#protocol-and-interface-issues)
    - [Error Message](#error-message-4)
    - [Problem](#problem-4)
    - [❌ Missing Protocol Definition](#-missing-protocol-definition)
    - [✅ Proper Protocol Definition](#-proper-protocol-definition)
  - [Type Narrowing Issues](#type-narrowing-issues)
    - [Error Message](#error-message-5)
    - [Problem](#problem-5)
    - [❌ Insufficient Type Narrowing](#-insufficient-type-narrowing)
    - [✅ Proper Type Narrowing](#-proper-type-narrowing)
    - [Real-World Example from Reynard](#real-world-example-from-reynard-3)
  - [Type Safety Best Practices](#type-safety-best-practices)
    - [1. Use Type Guards](#1-use-type-guards)
    - [2. Use Assertions for Type Narrowing](#2-use-assertions-for-type-narrowing)
    - [3. Use TypedDict for Structured Data](#3-use-typeddict-for-structured-data)
    - [4. Use Union Types Properly](#4-use-union-types-properly)
    - [5. Handle Optional Types Explicitly](#5-handle-optional-types-explicitly)
  - [Tools and Configuration](#tools-and-configuration)
    - [MyPy Configuration](#mypy-configuration)
    - [Pylint Configuration](#pylint-configuration)
  - [Troubleshooting](#troubleshooting)
    - [Common Issues](#common-issues)
      - [Issue: Type Checker Still Complains After Fixes](#issue-type-checker-still-complains-after-fixes)
      - [Issue: Import Errors with Type Annotations](#issue-import-errors-with-type-annotations)
      - [Issue: Complex Generic Types](#issue-complex-generic-types)
  - [Performance Considerations](#performance-considerations)
    - [Type Annotation Performance](#type-annotation-performance)
    - [Import Performance](#import-performance)
  - [Conclusion](#conclusion)

This document covers common type safety issues encountered during Python development, particularly when
working with modern Python codebases. Each issue includes the error message, explanation, and
practical solutions with real-world examples from the Reynard project.

## Returning Any from Typed Function

### Error Message

```text
Returning Any from function declared to return "bool"
```

### Problem

Type checker can't guarantee the return type matches the annotation. This often happens when
calling functions that return `Any` or when the type checker can't infer the return type.

### ❌ Type Mismatch

```python
def is_valid() -> bool:
    return some_comparison()  # Returns Any
```

### ✅ Explicit Type

```python
def is_valid() -> bool:
    return bool(some_comparison())
```

### Real-World Example from Reynard

```python
# libraries/gatekeeper/gatekeeper/core/auth_manager.py
def verify_token(self, token: str) -> bool:
    """Verify if a token is valid."""
    result = self.token_manager.verify_token(token, "access")
    return result.is_valid  # This returns a boolean, not Any
```

### Common Scenarios

```python
# ❌ Dictionary access returns Any
def get_user_id(user_data: dict) -> str:
    return user_data["user_id"]  # Returns Any

# ✅ Explicit type annotation
def get_user_id(user_data: dict) -> str:
    return str(user_data["user_id"])

# ❌ Method call returns Any
def is_authenticated(user: User) -> bool:
    return user.check_auth()  # Returns Any

# ✅ Explicit type conversion
def is_authenticated(user: User) -> bool:
    return bool(user.check_auth())
```

## Missing Type Annotations

### Error Message

```text
Need type annotation for "variable_name"
```

### Problem

Type checker can't infer the type of a variable, especially for complex data structures or when the type is ambiguous.

### ❌ Missing Annotation

```python
def get_hash_info(hashed_password: str) -> dict[str, Any]:
    info = {  # Type checker can't infer this
        "algorithm": self.get_hash_algorithm(hashed_password),
        "variant": None,
    }
    return info
```

### ✅ Explicit Annotation

```python
def get_hash_info(hashed_password: str) -> dict[str, Any]:
    info: dict[str, Any] = {
        "algorithm": self.get_hash_algorithm(hashed_password),
        "variant": None,
    }
    return info
```

### Real-World Example from Reynard

```python
# libraries/gatekeeper/gatekeeper/core/auth_manager.py
async def authenticate(
    self, username: str, password: str, client_ip: str | None = None
) -> TokenResponse | None:
    # Create tokens
    token_data: dict[str, Any] = {
        "sub": user.username,
        "role": user.role.value,
        "permissions": user.permissions or [],
        "user_id": str(user.id),
    }

    tokens = self.token_manager.create_tokens(token_data)
    return tokens
```

### Common Scenarios Requiring Type Annotations

```python
# Complex data structures
def process_user_data(data: dict) -> dict[str, Any]:
    result: dict[str, Any] = {
        "processed": True,
        "user_id": data.get("id"),
        "metadata": data.get("metadata", {}),
    }
    return result

# List comprehensions with complex types
def get_user_permissions(users: list[User]) -> list[list[str]]:
    permissions: list[list[str]] = [
        user.permissions or [] for user in users
    ]
    return permissions

# Function assignments
def create_validator(validation_type: str) -> Callable[[str], bool]:
    if validation_type == "email":
        validator: Callable[[str], bool] = lambda x: "@" in x
    else:
        validator: Callable[[str], bool] = lambda x: len(x) > 0
    return validator
```

## Type Compatibility Issues

### Error Message

```text
Incompatible default for argument "client_ip" (default has type "None", argument has type "str")
```

### Problem

Default parameter types don't match the annotated parameter type.

### ❌ Type Mismatch

```python
def authenticate(
    self, username: str, password: str, client_ip: str = None
) -> TokenResponse | None:
    pass
```

### ✅ Correct Type

```python
def authenticate(
    self, username: str, password: str, client_ip: str | None = None
) -> TokenResponse | None:
    pass
```

### Real-World Example from Reynard

```python
# libraries/gatekeeper/gatekeeper/core/auth_manager.py
async def authenticate(
    self, username: str, password: str, client_ip: str | None = None
) -> TokenResponse | None:
    """Authenticate a user with username and password."""
    # Implementation...

async def refresh_tokens(
    self, refresh_token: str, client_ip: str | None = None
) -> TokenResponse | None:
    """Refresh access token using a valid refresh token."""
    # Implementation...

async def revoke_tokens(self, username: str, token: str | None = None) -> bool:
    """Revoke tokens for a user."""
    # Implementation...

async def validate_token(self, token: str, required_role: str | None = None) -> bool:
    """Validate a token and optionally check role requirements."""
    # Implementation...
```

## Generic Type Issues

### Error Message

```text
Type variable "T" is not defined
```

### Problem

Using generic type variables without proper definition or import.

### ❌ Undefined Type Variable

```python
def process_data(data: T) -> T:  # T is not defined
    return data
```

### ✅ Proper Generic Definition

```python
from typing import TypeVar

T = TypeVar('T')

def process_data(data: T) -> T:
    return data
```

### Real-World Example

```python
from typing import TypeVar, Generic

T = TypeVar('T')

class Container(Generic[T]):
    def __init__(self, value: T):
        self.value = value

    def get(self) -> T:
        return self.value

    def set(self, value: T) -> None:
        self.value = value

# Usage
string_container = Container("hello")  # T is str
int_container = Container(42)  # T is int
```

## Protocol and Interface Issues

### Error Message

```text
"UserBackend" has no attribute "create_user"
```

### Problem

Type checker can't find the method on the interface or protocol.

### ❌ Missing Protocol Definition

```python
class AuthManager:
    def __init__(self, backend: UserBackend):
        self.backend = backend

    async def create_user(self, user: UserCreate) -> User:
        return await self.backend.create_user(user)  # Method not found
```

### ✅ Proper Protocol Definition

```python
from typing import Protocol

class UserBackend(Protocol):
    async def create_user(self, user: UserCreate) -> User:
        """Create a new user."""
        ...

    async def get_user_by_username(self, username: str) -> User | None:
        """Get user by username."""
        ...

    async def update_user_password(self, username: str, password_hash: str) -> bool:
        """Update user password."""
        ...

class AuthManager:
    def __init__(self, backend: UserBackend):
        self.backend = backend

    async def create_user(self, user: UserCreate) -> User:
        return await self.backend.create_user(user)
```

## Type Narrowing Issues

### Error Message

```text
Object of type "str | None" has no attribute "split"
```

### Problem

Type checker can't narrow the type after a check, or the check isn't sufficient.

### ❌ Insufficient Type Narrowing

```python
def process_username(username: str | None) -> list[str]:
    if username:  # This doesn't narrow the type enough
        return username.split("@")  # Error: str | None has no split
    return []
```

### ✅ Proper Type Narrowing

```python
def process_username(username: str | None) -> list[str]:
    if username is not None:
        return username.split("@")
    return []

# Or use type guard
def is_valid_username(username: str | None) -> bool:
    return username is not None and len(username) > 0

def process_username(username: str | None) -> list[str]:
    if is_valid_username(username):
        return username.split("@")  # Type checker knows username is str
    return []
```

### Real-World Example from Reynard

```python
# libraries/gatekeeper/gatekeeper/core/auth_manager.py
async def get_current_user(self, token: str) -> User | None:
    """Get the current user from a valid token."""
    # Verify the token
    result = self.token_manager.verify_token(token, "access")
    if not result.is_valid:
        logger.warning("Failed to get current user: invalid token")
        return None

    # Extract username from token
    username = result.payload.sub if result.payload else None
    if not username:
        logger.warning("Failed to get current user: missing username in token")
        return None

    # Get user from backend
    user = await self.backend.get_user_by_username(username)
    if not user or not user.is_active:
        logger.warning(
            "Failed to get current user: user '%s' not found or inactive", username
        )
        return None

    return user
```

## Type Safety Best Practices

### 1. Use Type Guards

```python
from typing import TypeGuard

def is_string(value: str | None) -> TypeGuard[str]:
    """Type guard to check if value is a string."""
    return value is not None

def process_value(value: str | None) -> str:
    if is_string(value):
        return value.upper()  # Type checker knows value is str
    return "default"
```

### 2. Use Assertions for Type Narrowing

```python
def process_user_data(data: dict) -> str:
    assert "username" in data, "Username is required"
    username = data["username"]
    assert isinstance(username, str), "Username must be a string"
    return username.upper()
```

### 3. Use TypedDict for Structured Data

```python
from typing import TypedDict

class UserData(TypedDict):
    username: str
    email: str
    is_active: bool

def process_user(user_data: UserData) -> str:
    return f"User: {user_data['username']} ({user_data['email']})"
```

### 4. Use Union Types Properly

```python
from typing import Union

# ✅ Modern union syntax
def process_id(user_id: str | int) -> str:
    return str(user_id)

# ❌ Deprecated union syntax
def process_id(user_id: Union[str, int]) -> str:
    return str(user_id)
```

### 5. Handle Optional Types Explicitly

```python
def get_user_email(user: User | None) -> str:
    if user is None:
        return "unknown@example.com"
    return user.email

# Or use default value
def get_user_email(user: User | None) -> str:
    return user.email if user else "unknown@example.com"
```

## Tools and Configuration

### MyPy Configuration

```toml
# pyproject.toml
[tool.mypy]
python_version = "3.11"
warn_return_any = true
warn_unused_configs = true
disallow_untyped_defs = true
disallow_incomplete_defs = true
check_untyped_defs = true
disallow_untyped_decorators = true
no_implicit_optional = true
warn_redundant_casts = true
warn_unused_ignores = true
warn_no_return = true
warn_unreachable = true
strict_equality = true
```

### Pylint Configuration

```toml
# pyproject.toml
[tool.pylint.messages_control]
disable = [
    "missing-module-docstring",
    "missing-class-docstring",
    "missing-function-docstring",
]

[tool.pylint.format]
max-line-length = 88
```

## Troubleshooting

### Common Issues

#### Issue: Type Checker Still Complains After Fixes

**Symptoms**: MyPy or other type checkers still show errors
**Causes**: Cached type information or missing imports
**Solutions**:

```bash
# Clear MyPy cache
mypy --clear-cache

# Reinstall type stubs
pip install --upgrade types-requests types-PyYAML
```

#### Issue: Import Errors with Type Annotations

**Symptoms**: ImportError when using type annotations
**Causes**: Missing type stubs or incorrect imports
**Solutions**:

```python
# Use TYPE_CHECKING for imports only needed for type annotations
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .models import User

def get_user() -> "User":
    pass
```

#### Issue: Complex Generic Types

**Symptoms**: Type checker can't understand complex generic types
**Causes**: Overly complex type annotations
**Solutions**:

```python
# Use type aliases for complex types
from typing import TypeAlias

UserDict: TypeAlias = dict[str, str | list[str] | None]

def process_users(users: list[UserDict]) -> list[UserDict]:
    pass
```

## Performance Considerations

### Type Annotation Performance

```python
# Type annotations have zero runtime cost in Python
def process_data(items: list[str]) -> dict[str, int]:
    # This function runs at the same speed with or without type annotations
    return {item: len(item) for item in items}
```

### Import Performance

```python
# Use TYPE_CHECKING for expensive imports
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    import pandas as pd  # Only imported during type checking

def process_dataframe(df: "pd.DataFrame") -> "pd.DataFrame":
    # Implementation...
```

## Conclusion

🦊 _Type safety requires the precision of a fox - knowing exactly what types to use and when to use them._

Type safety is crucial for robust Python applications. The key principles are:

- **Use explicit type annotations** for complex variables
- **Handle optional types properly** with `| None`
- **Use type guards** for type narrowing
- **Define protocols** for interfaces
- **Use modern union syntax** with `|`
- **Leverage tooling** for better development experience

By following these guidelines and using the provided examples, you can create Python code that is both type-safe and
maintainable.

_Build type safety that outfoxes complexity and provides clarity._ 🦊

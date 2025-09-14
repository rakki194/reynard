# Python Type Annotation Issues

Guide to type annotation warnings and errors in Python development.

## Overview

This document covers common type annotation issues encountered during Python development, particularly when
working with modern Python codebases. Each issue includes the error message, explanation, and
practical solutions with real-world examples from the Reynard project.

## Deprecated Type Imports

### Error Message

```text
`typing.Dict` is deprecated, use `dict` instead
`typing.Tuple` is deprecated, use `tuple` instead
`typing.List` is deprecated, use `list` instead
```

### Problem

Python 3.9+ supports built-in generic types, making `typing.Dict`, `typing.Tuple`, and
`typing.List` deprecated. Using the built-in types is more efficient and follows modern Python best practices.

### ❌ Deprecated

```python
from typing import Dict, Tuple, List, Any

def get_params() -> Dict[str, Any]:
    pass

def verify_password() -> Tuple[bool, str | None]:
    pass

def get_users() -> List[User]:
    pass
```

### ✅ Modern

```python
from typing import Any

def get_params() -> dict[str, Any]:
    pass

def verify_password() -> tuple[bool, str | None]:
    pass

def get_users() -> list[User]:
    pass
```

### Migration Strategy

1. **Remove deprecated imports** from `typing`
2. **Use built-in types** directly in type annotations
3. **Keep complex types** like `Any`, `Optional`, `Union` from `typing`
4. **Update all references** consistently

### Real-World Example from Reynard

```python
# libraries/gatekeeper/gatekeeper/core/auth_manager.py
from typing import Any

class AuthManager:
    async def get_token_stats(self) -> dict[str, Any]:
        """Get statistics about token usage and blacklist."""
        return self.token_manager.get_blacklist_stats()

    async def get_user_settings(self, username: str) -> dict[str, Any]:
        """Get user settings."""
        return await self.backend.get_user_settings(username)

    async def update_user_settings(
        self, username: str, settings: dict[str, Any]
    ) -> bool:
        """Update user settings."""
        return await self.backend.update_user_settings(username, settings)

    async def list_users(self, skip: int = 0, limit: int = 100) -> list[UserPublic]:
        """List users in the system."""
        return await self.backend.list_users(skip=skip, limit=limit)
```

## Undefined Type Variables

### Error Message

```text
Undefined name 'Dict'
Undefined name 'Tuple'
Undefined name 'List'
```

### Problem

Using deprecated type imports without importing them, or importing them incorrectly.

### ❌ Incorrect

```python
# Missing import
def process_data() -> Dict[str, Any]:  # NameError: name 'Dict' is not defined
    pass

# Wrong import
from typing import Any
def get_result() -> Tuple[bool, str]:  # NameError: name 'Tuple' is not defined
    pass
```

### ✅ Correct

```python
from typing import Any

def process_data() -> dict[str, Any]:
    pass

def get_result() -> tuple[bool, str]:
    pass
```

## Modern Union Syntax

### Error Message

```text
Use `X | Y` for type annotations
```

### Problem

Python 3.10+ supports the `|` operator for union types, making `Union[X, Y]` and `Optional[X]` deprecated.

### ❌ Deprecated

```python
from typing import Union, Optional

def authenticate(
    self, username: str, password: str, client_ip: Optional[str] = None
) -> Optional[TokenResponse]:
    pass

def get_user(self, user_id: Union[str, int]) -> Optional[User]:
    pass
```

### ✅ Modern

```python
def authenticate(
    self, username: str, password: str, client_ip: str | None = None
) -> TokenResponse | None:
    pass

def get_user(self, user_id: str | int) -> User | None:
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

async def get_current_user(self, token: str) -> User | None:
    """Get the current user from a valid token."""
    # Implementation...

async def update_user(
    self, username: str, user_update: UserUpdate
) -> User | None:
    """Update user information."""
    # Implementation...
```

## Missing Type Annotations

### Error Message

```text
Need type annotation for "variable_name"
```

### Problem

Type checker can't infer the type of a variable, especially for complex data structures.

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

## Type Safety Issues

### Returning Any from Typed Function

### Error Message

```text
Returning Any from function declared to return "bool"
```

### Problem

Type checker can't guarantee the return type matches the annotation.

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

### Real-World Example

```python
# libraries/gatekeeper/gatekeeper/core/auth_manager.py
def verify_token(self, token: str) -> bool:
    """Verify if a token is valid."""
    result = self.token_manager.verify_token(token, "access")
    return result.is_valid  # This returns a boolean, not Any
```

## Complex Type Annotations

### Generic Types

```python
from typing import TypeVar, Generic

T = TypeVar('T')

class Container(Generic[T]):
    def __init__(self, value: T):
        self.value = value

    def get(self) -> T:
        return self.value

# Usage
string_container = Container("hello")  # T is str
int_container = Container(42)  # T is int
```

### Callable Types

```python
from typing import Callable

def process_with_callback(
    data: list[str],
    callback: Callable[[str], bool]
) -> list[str]:
    return [item for item in data if callback(item)]
```

### Protocol Types

```python
from typing import Protocol

class Drawable(Protocol):
    def draw(self) -> None: ...

def render_shape(shape: Drawable) -> None:
    shape.draw()
```

## Type Annotation Best Practices

### 1. Use Modern Syntax

```python
# ✅ Modern Python 3.9+ syntax
def process_data(items: list[str]) -> dict[str, int]:
    return {item: len(item) for item in items}

# ❌ Deprecated syntax
def process_data(items: List[str]) -> Dict[str, int]:
    return {item: len(item) for item in items}
```

### 2. Be Explicit with Complex Types

```python
# ✅ Explicit type annotation
def create_user_data(
    username: str,
    permissions: list[str]
) -> dict[str, str | list[str]]:
    user_data: dict[str, str | list[str]] = {
        "username": username,
        "permissions": permissions,
    }
    return user_data
```

### 3. Use Type Aliases for Complex Types

```python
from typing import TypeAlias

# Define complex types once
UserData: TypeAlias = dict[str, str | list[str]]
TokenData: TypeAlias = dict[str, str | list[str] | int]

def create_user(user_data: UserData) -> User:
    pass

def create_token(token_data: TokenData) -> str:
    pass
```

### 4. Handle Optional Values Properly

```python
# ✅ Clear optional handling
def get_user_by_id(user_id: str | None) -> User | None:
    if user_id is None:
        return None
    return database.get_user(user_id)

# ✅ Default parameter handling
def authenticate(
    username: str,
    password: str,
    client_ip: str | None = None
) -> TokenResponse | None:
    pass
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

🦊 _Type annotations require the precision of a fox - knowing exactly what types to use and when to use them._

Modern Python type annotations provide excellent tooling support and code clarity. The key principles are:

- **Use modern syntax** with built-in generic types
- **Be explicit** with complex type annotations
- **Handle optional values** properly with `| None`
- **Use type aliases** for complex types
- **Leverage tooling** for better development experience

By following these guidelines and using the provided examples, you can create Python code that is both type-safe and
maintainable.

_Build type annotations that outfox complexity and provide clarity._ 🦊

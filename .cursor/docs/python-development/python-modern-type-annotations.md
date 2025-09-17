# Python Modern Type Annotations Guide

Migration from deprecated typing imports to modern built-in generic types.

## Overview

Python 3.9+ introduced built-in generic types,
making many `typing` module imports deprecated. This guide covers the migration from `typing.Dict`, `typing.Tuple`,
and other deprecated types to their modern equivalents, with practical examples and migration strategies.

## The Evolution of Python Type Annotations

### Python 3.8 and Earlier

```python
from typing import Dict, List, Tuple, Set, Optional, Union

def process_data() -> Dict[str, List[int]]:
    pass

def get_coordinates() -> Tuple[float, float]:
    pass

def find_items() -> Set[str]:
    pass
```

### Python 3.9+ (Modern)

```python
from typing import Optional, Union  # Only import what's still needed

def process_data() -> dict[str, list[int]]:
    pass

def get_coordinates() -> tuple[float, float]:
    pass

def find_items() -> set[str]:
    pass
```

## Deprecated Types and Their Modern Equivalents

### Built-in Generic Types

| Deprecated             | Modern          | Notes           |
| ---------------------- | --------------- | --------------- |
| `typing.Dict[K, V]`    | `dict[K, V]`    | Dictionary type |
| `typing.List[T]`       | `list[T]`       | List type       |
| `typing.Tuple[T, ...]` | `tuple[T, ...]` | Tuple type      |
| `typing.Set[T]`        | `set[T]`        | Set type        |
| `typing.FrozenSet[T]`  | `frozenset[T]`  | Frozen set type |

### Still Required from typing

| Type          | Usage                      | Example                           |
| ------------- | -------------------------- | --------------------------------- |
| `Any`         | When type is truly unknown | `dict[str, Any]`                  |
| `Optional[T]` | Union with None            | `Optional[str]` or `str \| None`  |
| `Union[T, U]` | Multiple possible types    | `Union[str, int]` or `str \| int` |
| `Callable`    | Function types             | `Callable[[int], str]`            |
| `TypeVar`     | Generic type variables     | `T = TypeVar('T')`                |
| `Generic`     | Generic base classes       | `class Container(Generic[T])`     |

## Migration Examples

### Basic Type Annotations

**❌ Deprecated (Python 3.8 style):**

```python
from typing import Dict, List, Tuple, Set, Optional

def get_user_data() -> Dict[str, str]:
    return {"name": "John", "email": "john@example.com"}

def process_numbers() -> List[int]:
    return [1, 2, 3, 4, 5]

def get_coordinates() -> Tuple[float, float]:
    return (40.7128, -74.0060)

def get_tags() -> Set[str]:
    return {"python", "typing", "annotations"}

def find_user(user_id: str) -> Optional[Dict[str, str]]:
    return None
```

**✅ Modern (Python 3.9+ style):**

```python
from typing import Optional

def get_user_data() -> dict[str, str]:
    return {"name": "John", "email": "john@example.com"}

def process_numbers() -> list[int]:
    return [1, 2, 3, 4, 5]

def get_coordinates() -> tuple[float, float]:
    return (40.7128, -74.0060)

def get_tags() -> set[str]:
    return {"python", "typing", "annotations"}

def find_user(user_id: str) -> dict[str, str] | None:
    return None
```

### Complex Type Annotations

**❌ Deprecated:**

```python
from typing import Dict, List, Tuple, Optional, Union, Any

def process_api_response() -> Dict[str, Union[str, int, List[Dict[str, Any]]]]:
    pass

def get_paginated_results() -> Tuple[List[Dict[str, Any]], int, bool]:
    pass

def validate_data(data: Dict[str, Any]) -> Optional[Dict[str, str]]:
    pass
```

**✅ Modern:**

```python
from typing import Any

def process_api_response() -> dict[str, str | int | list[dict[str, Any]]]:
    pass

def get_paginated_results() -> tuple[list[dict[str, Any]], int, bool]:
    pass

def validate_data(data: dict[str, Any]) -> dict[str, str] | None:
    pass
```

### Class Definitions

**❌ Deprecated:**

```python
from typing import Dict, List, Optional, Generic, TypeVar

T = TypeVar('T')

class DataContainer(Generic[T]):
    def __init__(self, data: Dict[str, T]):
        self.data = data

    def get_items(self) -> List[T]:
        return list(self.data.values())

    def find_item(self, key: str) -> Optional[T]:
        return self.data.get(key)
```

**✅ Modern:**

```python
from typing import Generic, TypeVar

T = TypeVar('T')

class DataContainer(Generic[T]):
    def __init__(self, data: dict[str, T]):
        self.data = data

    def get_items(self) -> list[T]:
        return list(self.data.values())

    def find_item(self, key: str) -> T | None:
        return self.data.get(key)
```

## Real-World Migration Examples

### Password Manager Migration

**Before (Deprecated):**

```python
from typing import Dict, Tuple, Any, Optional

class PasswordManager:
    def get_argon2_params(self) -> Dict[str, Any]:
        return SECURITY_PARAMS[self.security_level].copy()

    def verify_and_update_password(
        self, password: str, hashed_password: str
    ) -> Tuple[bool, Optional[str]]:
        pass

    def benchmark_hash_time(
        self, password: str, iterations: int = 10
    ) -> Dict[str, float]:
        pass

    def validate_password_strength(self, password: str) -> Tuple[bool, str]:
        pass

    def get_hash_info(self, hashed_password: str) -> Dict[str, Any]:
        pass
```

**After (Modern):**

```python
from typing import Any

class PasswordManager:
    def get_argon2_params(self) -> dict[str, Any]:
        return SECURITY_PARAMS[self.security_level].copy()

    def verify_and_update_password(
        self, password: str, hashed_password: str
    ) -> tuple[bool, str | None]:
        pass

    def benchmark_hash_time(
        self, password: str, iterations: int = 10
    ) -> dict[str, float]:
        pass

    def validate_password_strength(self, password: str) -> tuple[bool, str]:
        pass

    def get_hash_info(self, hashed_password: str) -> dict[str, Any]:
        pass
```

### API Response Handling

**Before (Deprecated):**

```python
from typing import Dict, List, Optional, Union, Any
import requests

def fetch_user_data(user_id: str) -> Optional[Dict[str, Any]]:
    response = requests.get(f"/api/users/{user_id}")
    if response.status_code == 200:
        return response.json()
    return None

def get_user_list() -> List[Dict[str, Union[str, int]]]:
    response = requests.get("/api/users")
    return response.json()

def process_batch_data(data: List[Dict[str, Any]]) -> Dict[str, List[str]]:
    results = {"success": [], "errors": []}
    for item in data:
        try:
            process_item(item)
            results["success"].append(item["id"])
        except Exception:
            results["errors"].append(item["id"])
    return results
```

**After (Modern):**

```python
from typing import Any
import requests

def fetch_user_data(user_id: str) -> dict[str, Any] | None:
    response = requests.get(f"/api/users/{user_id}")
    if response.status_code == 200:
        return response.json()
    return None

def get_user_list() -> list[dict[str, str | int]]:
    response = requests.get("/api/users")
    return response.json()

def process_batch_data(data: list[dict[str, Any]]) -> dict[str, list[str]]:
    results = {"success": [], "errors": []}
    for item in data:
        try:
            process_item(item)
            results["success"].append(item["id"])
        except Exception:
            results["errors"].append(item["id"])
    return results
```

## Advanced Type Annotations

### Union Types with `|` Operator

**Python 3.10+ Union Syntax:**

```python
# Modern union syntax (Python 3.10+)
def process_value(value: str | int | float) -> str:
    return str(value)

def get_config() -> dict[str, str | int | bool] | None:
    return None

# Still works with typing.Union
from typing import Union
def process_value_old(value: Union[str, int, float]) -> str:
    return str(value)
```

### Optional Types

**Modern Optional Syntax:**

```python
# Modern optional syntax
def find_user(user_id: str) -> dict[str, str] | None:
    return None

def get_setting(key: str) -> str | None:
    return None

# Still works with typing.Optional
from typing import Optional
def find_user_old(user_id: str) -> Optional[dict[str, str]]:
    return None
```

### Generic Classes

```python
from typing import Generic, TypeVar, Protocol

T = TypeVar('T')

class Repository(Generic[T]):
    def __init__(self, items: dict[str, T]):
        self.items = items

    def get(self, key: str) -> T | None:
        return self.items.get(key)

    def get_all(self) -> list[T]:
        return list(self.items.values())

    def add(self, key: str, item: T) -> None:
        self.items[key] = item

# Usage
user_repo = Repository[dict[str, str]]({})
user = user_repo.get("user1")  # Type: dict[str, str] | None
```

## Migration Strategy

### Step 1: Identify Deprecated Imports

```bash
# Search for deprecated imports
grep -r "from typing import.*Dict\|from typing import.*List\|from typing import.*Tuple" .

# Or use a more comprehensive search
grep -r "typing\.Dict\|typing\.List\|typing\.Tuple\|typing\.Set" .
```

### Step 2: Update Imports

**Before:**

```python
from typing import Dict, List, Tuple, Set, Optional, Union, Any
```

**After:**

```python
from typing import Optional, Union, Any  # Only keep what's still needed
```

### Step 3: Update Type Annotations

**Automated Migration Script:**

```python
#!/usr/bin/env python3
"""Script to migrate deprecated type annotations."""

import re
import sys

def migrate_file(file_path: str) -> None:
    """Migrate a single file from deprecated to modern type annotations."""
    with open(file_path, 'r') as f:
        content = f.read()

    # Replace deprecated types
    replacements = [
        (r'\bDict\[', 'dict['),
        (r'\bList\[', 'list['),
        (r'\bTuple\[', 'tuple['),
        (r'\bSet\[', 'set['),
        (r'\bFrozenSet\[', 'frozenset['),
        (r'Optional\[([^\]]+)\]', r'\1 | None'),
        (r'Union\[([^\]]+)\]', r'\1'),  # Note: This is simplified
    ]

    for pattern, replacement in replacements:
        content = re.sub(pattern, replacement, content)

    with open(file_path, 'w') as f:
        f.write(content)

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python migrate_types.py <file_path>")
        sys.exit(1)

    migrate_file(sys.argv[1])
```

### Step 4: Update Import Statements

**Manual Process:**

1. Remove `Dict`, `List`, `Tuple`, `Set`, `FrozenSet` from imports
2. Keep `Any`, `Optional`, `Union`, `Callable`, `TypeVar`, `Generic`
3. Update all type annotations to use built-in types

## Compatibility Considerations

### Python Version Support

```python
# For projects supporting Python 3.8 and earlier
from typing import Dict, List, Tuple, Set, Optional, Union, Any

# For projects supporting Python 3.9+
from typing import Optional, Union, Any

# For projects supporting Python 3.10+
# Can use | operator for unions
```

### Type Checker Compatibility

**MyPy Configuration:**

```toml
# pyproject.toml
[tool.mypy]
python_version = "3.11"
warn_return_any = true
warn_unused_configs = true
disallow_untyped_defs = true

# Enable modern syntax
enable_error_code = ["misc"]
```

**Pylint Configuration:**

```toml
[tool.pylint.messages_control]
disable = [
    "import-outside-toplevel",
    "too-few-public-methods",
]

[tool.pylint.format]
max-line-length = 88
```

## Best Practices

### 1. Use Modern Syntax Consistently

```python
# ✅ Good: Consistent modern syntax
def process_data(items: list[dict[str, str]]) -> dict[str, list[str]]:
    return {"processed": [item["id"] for item in items]}

# ❌ Bad: Mixed old and new syntax
def process_data(items: List[dict[str, str]]) -> Dict[str, list[str]]:
    return {"processed": [item["id"] for item in items]}
```

### 2. Prefer `|` Over `Union` (Python 3.10+)

```python
# ✅ Good: Modern union syntax
def handle_value(value: str | int | None) -> str:
    return str(value) if value is not None else ""

# ❌ Less preferred: typing.Union
from typing import Union
def handle_value(value: Union[str, int, None]) -> str:
    return str(value) if value is not None else ""
```

### 3. Use `| None` Over `Optional` (Python 3.10+)

```python
# ✅ Good: Modern optional syntax
def find_item(key: str) -> dict[str, str] | None:
    return None

# ❌ Less preferred: typing.Optional
from typing import Optional
def find_item(key: str) -> Optional[dict[str, str]]:
    return None
```

### 4. Keep Complex Types in typing

```python
# ✅ Good: Keep complex types in typing
from typing import Callable, TypeVar, Generic, Protocol

T = TypeVar('T')

def process_with_callback(
    data: list[T],
    callback: Callable[[T], bool]
) -> list[T]:
    return [item for item in data if callback(item)]
```

## Performance Considerations

### Import Performance

Modern type annotations have better import performance:

```python
# Faster imports (fewer typing imports)
from typing import Any, Optional

# vs slower imports (more typing imports)
from typing import Dict, List, Tuple, Set, Optional, Union, Any
```

### Runtime Performance

Type annotations have no runtime performance impact, but modern syntax is cleaner:

```python
# Both have identical runtime performance
def old_style(data: Dict[str, List[int]]) -> Tuple[bool, str]:
    pass

def new_style(data: dict[str, list[int]]) -> tuple[bool, str]:
    pass
```

## Testing Type Annotations

### Type Checker Validation

```python
# test_types.py
from typing import get_type_hints
import inspect

def validate_function_types(func):
    """Validate that function type annotations are correct."""
    hints = get_type_hints(func)
    sig = inspect.signature(func)

    for param_name, param in sig.parameters.items():
        if param_name in hints:
            print(f"{param_name}: {hints[param_name]}")

    if 'return' in hints:
        print(f"return: {hints['return']}")

# Usage
def example_func(data: dict[str, list[int]]) -> tuple[bool, str]:
    return True, "success"

validate_function_types(example_func)
```

### Runtime Type Checking

```python
from typing import get_type_hints, get_origin, get_args

def check_type_compatibility(obj, expected_type):
    """Check if object matches expected type annotation."""
    if expected_type is None:
        return obj is None

    origin = get_origin(expected_type)
    args = get_args(expected_type)

    if origin is None:
        return isinstance(obj, expected_type)

    if origin is dict:
        if not isinstance(obj, dict):
            return False
        key_type, value_type = args
        return all(
            isinstance(k, key_type) and isinstance(v, value_type)
            for k, v in obj.items()
        )

    if origin is list:
        if not isinstance(obj, list):
            return False
        item_type = args[0]
        return all(isinstance(item, item_type) for item in obj)

    return True
```

## Troubleshooting

### Common Issues

#### Issue: Type Checker Doesn't Recognize Modern Syntax

**Symptoms**: MyPy or other type checkers show errors with modern syntax
**Causes**: Outdated type checker or Python version
**Solutions**:

```bash
# Update type checkers
pip install --upgrade mypy pylint

# Check Python version
python --version  # Should be 3.9+
```

#### Issue: Import Errors After Migration

**Symptoms**: ImportError for typing modules
**Causes**: Removed imports that are still needed
**Solutions**:

```python
# Check what's still needed from typing
from typing import Any, Optional, Union, Callable, TypeVar, Generic

# Don't remove these:
# - Any: For truly unknown types
# - Optional: For Union with None (or use | None)
# - Union: For multiple types (or use |)
# - Callable: For function types
# - TypeVar: For generic type variables
# - Generic: For generic base classes
```

#### Issue: Backward Compatibility

**Symptoms**: Code doesn't work with older Python versions
**Causes**: Using Python 3.9+ features in older environments
**Solutions**:

```python
# Use conditional imports for compatibility
import sys

if sys.version_info >= (3, 9):
    # Modern syntax
    def process_data(data: dict[str, list[int]]) -> tuple[bool, str]:
        pass
else:
    # Legacy syntax
    from typing import Dict, List, Tuple
    def process_data(data: Dict[str, List[int]]) -> Tuple[bool, str]:
        pass
```

## Conclusion

🦊 _Modern type annotations require the cunning of a fox - knowing when to embrace new syntax while
maintaining compatibility and clarity._

The migration to modern Python type annotations provides:

- **Cleaner Code**: Fewer imports and more readable syntax
- **Better Performance**: Faster imports and cleaner bytecode
- **Future-Proof**: Aligned with Python's evolution
- **Maintainability**: Easier to read and understand

Key principles:

- **Migrate Gradually**: Update one module at a time
- **Test Thoroughly**: Ensure type checkers still work
- **Maintain Compatibility**: Consider Python version support
- **Use Modern Syntax**: Prefer `|` over `Union`, `| None` over `Optional`
- **Keep Complex Types**: Import `Callable`, `TypeVar`, `Generic` from typing

By following this migration guide, you'll modernize your Python codebase while maintaining type safety and
improving readability.

_Build type annotations that outfox complexity and embrace the future._ 🦊

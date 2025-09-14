# Type Safety Issues Guide

*Enhancing code reliability through proper type annotations and type checking*

## Overview

Type safety issues in Python include missing type annotations, type mismatches, and improper use of generic types. While Python is dynamically typed, adding type hints improves code reliability, IDE support, and catches errors at development time. This guide shows how to implement proper type safety in Python applications.

## Missing Type Annotations

### The Problem: Unclear Types

**❌ Missing Annotations:**

```python
def get_hash_info(hashed_password: str) -> dict[str, Any]:
    info = {  # Type checker can't infer this
        "algorithm": self.get_hash_algorithm(hashed_password),
        "variant": None,
        "parameters": {},
        "needs_update": False,
    }
    return info

def process_items(items):
    result = {}
    for item in items:
        if isinstance(item, dict):
            result.update(item)
    return result
```

**Problems:**

- Type checker can't infer types
- IDE can't provide proper autocomplete
- Runtime errors from type mismatches
- Difficult to understand function contracts

### The Solution: Explicit Annotations

**✅ Explicit Annotations:**

```python
from typing import Any, Dict, List, Optional, Union

def get_hash_info(hashed_password: str) -> Dict[str, Any]:
    info: Dict[str, Any] = {
        "algorithm": self.get_hash_algorithm(hashed_password),
        "variant": None,
        "parameters": {},
        "needs_update": False,
    }
    return info

def process_items(items: List[Dict[str, Any]]) -> Dict[str, Any]:
    result: Dict[str, Any] = {}
    for item in items:
        result.update(item)
    return result
```

## Type Mismatches

### The Problem: Implicit Type Conversions

**❌ Type Mismatch:**

```python
def is_valid() -> bool:
    return some_comparison()  # Returns Any, not guaranteed bool

def calculate_average(numbers) -> float:
    return sum(numbers) / len(numbers)  # Could return int or float

def process_data(data: dict) -> str:
    return data.get('key', 'default')  # Could return Any
```

**Problems:**

- Implicit type conversions
- Unexpected return types
- Runtime type errors
- Inconsistent behavior

### The Solution: Explicit Type Handling

**✅ Explicit Type Handling:**

```python
def is_valid() -> bool:
    return bool(some_comparison())  # Explicitly convert to bool

def calculate_average(numbers: List[int]) -> float:
    if not numbers:
        return 0.0
    return float(sum(numbers)) / len(numbers)  # Explicit float conversion

def process_data(data: Dict[str, Any]) -> str:
    result = data.get('key', 'default')
    return str(result)  # Explicit string conversion
```

## Generic Type Issues

### The Problem: Poor Generic Usage

**❌ Poor Generic Usage:**

```python
from typing import Any, Dict, List

def process_items(items: List[Any]) -> Dict[str, Any]:
    result = {}
    for item in items:
        if isinstance(item, dict):
            result.update(item)
    return result

def get_first_item(items: List[Any]) -> Any:
    return items[0] if items else None
```

**Problems:**

- Overuse of `Any` type
- Loss of type information
- No compile-time type checking
- Poor IDE support

### The Solution: Proper Generic Usage

**✅ Better Generic Usage:**

```python
from typing import TypeVar, Generic, List, Dict, Optional

T = TypeVar('T')
K = TypeVar('K')
V = TypeVar('V')

def process_items(items: List[Dict[K, V]]) -> Dict[K, V]:
    """Process items with proper generic typing."""
    result: Dict[K, V] = {}
    for item in items:
        result.update(item)
    return result

def get_first_item(items: List[T]) -> Optional[T]:
    """Get first item with proper generic typing."""
    return items[0] if items else None

def map_items(items: List[T], func: callable[[T], V]) -> List[V]:
    """Map items with generic types."""
    return [func(item) for item in items]
```

## Advanced Type Patterns

### 1. Union Types and Optional

```python
from typing import Union, Optional, Literal

# Union types
def process_id(user_id: Union[int, str]) -> str:
    """Process user ID that can be int or string."""
    return str(user_id)

# Optional types (equivalent to Union[T, None])
def find_user(user_id: int) -> Optional[Dict[str, Any]]:
    """Find user by ID, return None if not found."""
    # Implementation would query database
    return None

# Literal types for specific values
def set_status(status: Literal["pending", "approved", "rejected"]) -> None:
    """Set status to specific literal values."""
    print(f"Status set to: {status}")

# Multiple literals
def handle_event(event_type: Literal["click", "hover", "focus"]) -> None:
    """Handle specific UI events."""
    pass
```

### 2. Protocol and Structural Typing

```python
from typing import Protocol, runtime_checkable

@runtime_checkable
class Drawable(Protocol):
    """Protocol for drawable objects."""
    
    def draw(self) -> None:
        """Draw the object."""
        ...
    
    def get_area(self) -> float:
        """Get the area of the object."""
        ...

class Circle:
    """Circle implementation."""
    
    def __init__(self, radius: float):
        self.radius = radius
    
    def draw(self) -> None:
        print(f"Drawing circle with radius {self.radius}")
    
    def get_area(self) -> float:
        return 3.14159 * self.radius ** 2

class Rectangle:
    """Rectangle implementation."""
    
    def __init__(self, width: float, height: float):
        self.width = width
        self.height = height
    
    def draw(self) -> None:
        print(f"Drawing rectangle {self.width}x{self.height}")
    
    def get_area(self) -> float:
        return self.width * self.height

def render_shapes(shapes: List[Drawable]) -> None:
    """Render a list of drawable shapes."""
    for shape in shapes:
        shape.draw()
        print(f"Area: {shape.get_area()}")

# Usage
shapes: List[Drawable] = [
    Circle(5.0),
    Rectangle(10.0, 8.0)
]
render_shapes(shapes)
```

### 3. Generic Classes

```python
from typing import TypeVar, Generic, List, Optional

T = TypeVar('T')

class Stack(Generic[T]):
    """Generic stack implementation."""
    
    def __init__(self) -> None:
        self._items: List[T] = []
    
    def push(self, item: T) -> None:
        """Push item onto stack."""
        self._items.append(item)
    
    def pop(self) -> Optional[T]:
        """Pop item from stack."""
        return self._items.pop() if self._items else None
    
    def peek(self) -> Optional[T]:
        """Peek at top item without removing."""
        return self._items[-1] if self._items else None
    
    def is_empty(self) -> bool:
        """Check if stack is empty."""
        return len(self._items) == 0

# Usage with specific types
string_stack: Stack[str] = Stack()
string_stack.push("hello")
string_stack.push("world")

int_stack: Stack[int] = Stack()
int_stack.push(1)
int_stack.push(2)
```

### 4. TypedDict for Structured Data

```python
from typing import TypedDict, List, Optional

class UserData(TypedDict):
    """Type definition for user data."""
    id: int
    name: str
    email: str
    age: Optional[int]
    roles: List[str]

class UserCreateData(TypedDict):
    """Type definition for user creation data."""
    name: str
    email: str
    age: Optional[int]

def create_user(user_data: UserCreateData) -> UserData:
    """Create user with typed data."""
    return {
        "id": 1,  # Would be generated
        "name": user_data["name"],
        "email": user_data["email"],
        "age": user_data.get("age"),
        "roles": ["user"]
    }

def update_user(user_id: int, updates: UserCreateData) -> UserData:
    """Update user with typed data."""
    # Implementation would update user
    return {
        "id": user_id,
        "name": updates["name"],
        "email": updates["email"],
        "age": updates.get("age"),
        "roles": ["user"]
    }
```

## Type Checking Tools

### MyPy Configuration

```ini
# mypy.ini
[mypy]
python_version = 3.11
warn_return_any = True
warn_unused_configs = True
disallow_untyped_defs = True
disallow_incomplete_defs = True
check_untyped_defs = True
disallow_untyped_decorators = True
no_implicit_optional = True
warn_redundant_casts = True
warn_unused_ignores = True
warn_no_return = True
warn_unreachable = True
strict_equality = True

[mypy-tests.*]
disallow_untyped_defs = False
```

### Pyright Configuration

```json
{
  "include": [
    "src"
  ],
  "exclude": [
    "**/node_modules",
    "**/__pycache__"
  ],
  "reportMissingImports": true,
  "reportMissingTypeStubs": false,
  "pythonVersion": "3.11",
  "pythonPlatform": "Linux",
  "executionEnvironments": [
    {
      "root": "src"
    }
  ],
  "typeCheckingMode": "strict"
}
```

### Type Checking in CI/CD

```python
# scripts/type_check.py
import subprocess
import sys
from pathlib import Path

def run_mypy() -> bool:
    """Run mypy type checking."""
    try:
        result = subprocess.run(
            ['mypy', 'src/', '--config-file', 'mypy.ini'],
            capture_output=True,
            text=True
        )
        
        if result.returncode != 0:
            print("Type checking failed:")
            print(result.stdout)
            return False
        
        print("Type checking passed!")
        return True
        
    except FileNotFoundError:
        print("MyPy not found. Install with: pip install mypy")
        return False

def run_pyright() -> bool:
    """Run pyright type checking."""
    try:
        result = subprocess.run(
            ['pyright', 'src/'],
            capture_output=True,
            text=True
        )
        
        if result.returncode != 0:
            print("Type checking failed:")
            print(result.stdout)
            return False
        
        print("Type checking passed!")
        return True
        
    except FileNotFoundError:
        print("Pyright not found. Install with: npm install -g pyright")
        return False

if __name__ == "__main__":
    success = run_mypy() and run_pyright()
    sys.exit(0 if success else 1)
```

## Common Type Safety Patterns

### 1. Type Guards

```python
from typing import TypeGuard, Union, List

def is_string(value: Union[str, int]) -> TypeGuard[str]:
    """Type guard to check if value is string."""
    return isinstance(value, str)

def is_list_of_strings(value: Union[List[str], List[int]]) -> TypeGuard[List[str]]:
    """Type guard to check if value is list of strings."""
    return isinstance(value, list) and all(isinstance(item, str) for item in value)

def process_value(value: Union[str, int]) -> str:
    """Process value using type guard."""
    if is_string(value):
        # value is now typed as str
        return value.upper()
    else:
        # value is now typed as int
        return str(value)
```

### 2. Overloaded Functions

```python
from typing import overload, Union, List

@overload
def process_data(data: str) -> str:
    """Process string data."""
    ...

@overload
def process_data(data: List[str]) -> List[str]:
    """Process list of strings."""
    ...

def process_data(data: Union[str, List[str]]) -> Union[str, List[str]]:
    """Process data with overloaded types."""
    if isinstance(data, str):
        return data.upper()
    else:
        return [item.upper() for item in data]

# Usage with proper type inference
result1: str = process_data("hello")  # Type checker knows this returns str
result2: List[str] = process_data(["hello", "world"])  # Type checker knows this returns List[str]
```

### 3. Generic Constraints

```python
from typing import TypeVar, Generic, Protocol

class Comparable(Protocol):
    """Protocol for comparable objects."""
    
    def __lt__(self, other: 'Comparable') -> bool:
        ...
    
    def __eq__(self, other: object) -> bool:
        ...

T = TypeVar('T', bound=Comparable)

class SortedList(Generic[T]):
    """Generic sorted list with type constraints."""
    
    def __init__(self) -> None:
        self._items: List[T] = []
    
    def add(self, item: T) -> None:
        """Add item in sorted order."""
        self._items.append(item)
        self._items.sort()
    
    def get_min(self) -> Optional[T]:
        """Get minimum item."""
        return self._items[0] if self._items else None
    
    def get_max(self) -> Optional[T]:
        """Get maximum item."""
        return self._items[-1] if self._items else None
```

## Error Handling with Types

### 1. Result Types

```python
from typing import Generic, TypeVar, Union
from dataclasses import dataclass

T = TypeVar('T')
E = TypeVar('E')

@dataclass
class Ok(Generic[T]):
    """Success result."""
    value: T

@dataclass
class Err(Generic[E]):
    """Error result."""
    error: E

Result = Union[Ok[T], Err[E]]

def divide(a: float, b: float) -> Result[float, str]:
    """Divide with Result type."""
    if b == 0:
        return Err("Division by zero")
    return Ok(a / b)

def process_division(a: float, b: float) -> None:
    """Process division with proper error handling."""
    result = divide(a, b)
    
    if isinstance(result, Ok):
        print(f"Result: {result.value}")
    else:
        print(f"Error: {result.error}")
```

### 2. Optional with Defaults

```python
from typing import Optional, Dict, Any

def get_config_value(config: Dict[str, Any], key: str, default: str = "") -> str:
    """Get config value with type safety."""
    value = config.get(key, default)
    return str(value) if value is not None else default

def process_user_data(user_data: Dict[str, Any]) -> Dict[str, str]:
    """Process user data with type safety."""
    return {
        "name": get_config_value(user_data, "name", "Unknown"),
        "email": get_config_value(user_data, "email", ""),
        "role": get_config_value(user_data, "role", "user")
    }
```

## Best Practices

### 1. Use Type Hints Consistently

```python
# ✅ Good: Consistent type hints
def calculate_total(items: List[Dict[str, Union[int, float]]]) -> float:
    """Calculate total with proper type hints."""
    return sum(item.get('price', 0) for item in items)

# ❌ Bad: Missing type hints
def calculate_total(items):
    return sum(item.get('price', 0) for item in items)
```

### 2. Avoid Any When Possible

```python
# ✅ Good: Specific types
def process_user(user: Dict[str, str]) -> str:
    return user.get('name', 'Unknown')

# ❌ Bad: Using Any
def process_user(user: Dict[str, Any]) -> Any:
    return user.get('name', 'Unknown')
```

### 3. Use Type Aliases for Complex Types

```python
# ✅ Good: Type aliases
from typing import Dict, List, Union

UserData = Dict[str, Union[str, int, List[str]]]
UserList = List[UserData]

def process_users(users: UserList) -> List[str]:
    """Process users with clear type alias."""
    return [user.get('name', 'Unknown') for user in users]

# ❌ Bad: Complex inline types
def process_users(users: List[Dict[str, Union[str, int, List[str]]]]) -> List[str]:
    return [user.get('name', 'Unknown') for user in users]
```

### 4. Use Generic Types Appropriately

```python
# ✅ Good: Proper generics
T = TypeVar('T')

def get_first_item(items: List[T]) -> Optional[T]:
    """Get first item with proper generic."""
    return items[0] if items else None

# ❌ Bad: Overuse of Any
def get_first_item(items: List[Any]) -> Any:
    return items[0] if items else None
```

## Conclusion

🦦 *Type safety requires the playful thoroughness of an otter - diving deep into every type annotation to ensure code flows smoothly and safely.*

Implementing proper type safety provides:

- **Reliability**: Catch errors at development time
- **Documentation**: Types serve as inline documentation
- **IDE Support**: Better autocomplete and refactoring
- **Maintainability**: Easier to understand and modify code
- **Refactoring**: Safer code changes with type checking

Key principles:

- **Add type hints consistently** to all functions and classes
- **Use specific types** instead of `Any` when possible
- **Leverage generic types** for reusable code
- **Use type guards** for runtime type checking
- **Configure type checkers** for strict checking
- **Integrate type checking** into CI/CD pipelines

*Build code that flows like a crystal-clear stream, with every type carefully considered and every annotation purposeful.* 🦦

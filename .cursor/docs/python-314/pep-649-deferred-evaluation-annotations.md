# PEP 649: Deferred Evaluation of Annotations

## Overview

PEP 649 introduces deferred evaluation of annotations in Python 3.14, fundamentally changing how function and class annotations are processed. This enhancement addresses long-standing issues with forward references and improves performance by deferring annotation evaluation until runtime.

## The Problem with Current Annotations

### Forward Reference Issues

In Python 3.13 and earlier, annotations are evaluated at definition time, causing problems with forward references:

```python
# This fails in Python 3.13 and earlier
class Node:
    def __init__(self, value: int, next_node: 'Node' = None):
        self.value = value
        self.next_node = next_node

# Must use string literals for forward references
class TreeNode:
    def __init__(self, value: int, left: 'TreeNode' = None, right: 'TreeNode' = None):
        self.value = value
        self.left = left
        self.right = right
```

### Performance Overhead

Annotations are evaluated even when not needed:

```python
# This creates expensive objects at definition time
import numpy as np

def process_data(data: np.ndarray) -> np.ndarray:
    # Annotation evaluation happens here, even if function is never called
    return data * 2

# Expensive imports and computations in annotations
def complex_function(x: list[dict[str, Any]]) -> pd.DataFrame:
    # pd.DataFrame is imported and evaluated at definition time
    pass
```

## PEP 649 Solution: Deferred Evaluation

### How It Works

Annotations are now stored as strings and evaluated only when accessed:

```python
# Python 3.14 - annotations are deferred
class Node:
    def __init__(self, value: int, next_node: Node = None):
        # No quotes needed for forward references!
        self.value = value
        self.next_node = next_node

class TreeNode:
    def __init__(self, value: int, left: TreeNode = None, right: TreeNode = None):
        # Clean, readable annotations without string literals
        self.value = value
        self.left = left
        self.right = right
```

### Accessing Annotations

```python
import inspect
from typing import get_type_hints

def example_function(x: int, y: str) -> float:
    return float(x) + len(y)

# Get annotations (triggers evaluation)
annotations = example_function.__annotations__
print(annotations)  # {'x': <class 'int'>, 'y': <class 'str'>, 'return': <class 'float'>}

# Using typing.get_type_hints
type_hints = get_type_hints(example_function)
print(type_hints)  # {'x': <class 'int'>, 'y': <class 'str'>, 'return': <class 'float'>}

# Using inspect
sig = inspect.signature(example_function)
for param_name, param in sig.parameters.items():
    print(f"{param_name}: {param.annotation}")
```

## Advanced Features

### Generic Type Annotations

```python
from typing import TypeVar, Generic, List, Dict, Any

T = TypeVar('T')

class Container(Generic[T]):
    def __init__(self, items: List[T]) -> None:
        self.items = items

    def get(self, index: int) -> T:
        return self.items[index]

    def add(self, item: T) -> None:
        self.items.append(item)

# Forward references work seamlessly
class Node(Generic[T]):
    def __init__(self, value: T, next_node: Node[T] = None) -> None:
        self.value = value
        self.next_node = next_node
```

### Complex Type Annotations

```python
from typing import Union, Optional, Callable, Protocol
from dataclasses import dataclass

@dataclass
class User:
    name: str
    age: int
    email: str

# Complex nested types work without quotes
def process_users(
    users: List[User],
    filter_func: Callable[[User], bool],
    default_user: Optional[User] = None
) -> Dict[str, List[User]]:
    # All annotations are deferred until accessed
    pass

# Protocol definitions
class Drawable(Protocol):
    def draw(self) -> None: ...

class Shape:
    def draw(self) -> None:
        print("Drawing shape")

def render_shapes(shapes: List[Drawable]) -> None:
    for shape in shapes:
        shape.draw()
```

## Performance Benefits

### Benchmark Example

```python
import time
from typing import List, Dict, Any

# Expensive annotation that would be evaluated at definition time in Python 3.13
def expensive_annotation_function(data: List[Dict[str, Any]]) -> Dict[str, Any]:
    # In Python 3.13, this would be evaluated at definition time
    # In Python 3.14, this is deferred until accessed
    return {"processed": len(data)}

# Performance comparison
def benchmark_annotations():
    start_time = time.time()

    # Create many functions with expensive annotations
    for i in range(1000):
        def func(x: List[Dict[str, Any]]) -> Dict[str, Any]:
            return {"id": i, "data": x}

    definition_time = time.time() - start_time
    print(f"Function definition time: {definition_time:.4f}s")

    # Access annotations (triggers evaluation)
    start_time = time.time()
    annotations = func.__annotations__
    access_time = time.time() - start_time
    print(f"Annotation access time: {access_time:.4f}s")

benchmark_annotations()
```

## Migration Guide

### From String Annotations

```python
# Python 3.13 and earlier
class OldNode:
    def __init__(self, value: int, next_node: 'OldNode' = None):
        self.value = value
        self.next_node = next_node

# Python 3.14 - remove quotes
class NewNode:
    def __init__(self, value: int, next_node: NewNode = None):
        self.value = value
        self.next_node = next_node
```

### Handling Complex Imports

```python
# Python 3.13 - imports at module level
import pandas as pd
import numpy as np

def process_data(data: pd.DataFrame) -> np.ndarray:
    return data.values

# Python 3.14 - imports can be deferred
def process_data(data: 'pd.DataFrame') -> 'np.ndarray':
    # Imports happen only when annotations are accessed
    import pandas as pd
    import numpy as np
    return data.values
```

## Best Practices

### 1. Use Forward References Naturally

```python
# Good: Clean, readable annotations
class BinaryTree:
    def __init__(self, value: int, left: BinaryTree = None, right: BinaryTree = None):
        self.value = value
        self.left = left
        self.right = right
```

### 2. Avoid Expensive Operations in Annotations

```python
# Bad: Expensive computation in annotation
def bad_function(data: list[expensive_computation()]) -> None:
    pass

# Good: Use string annotation for expensive operations
def good_function(data: 'list[ExpensiveType]') -> None:
    pass
```

### 3. Use Type Hints Consistently

```python
# Good: Consistent use of deferred annotations
from typing import List, Dict, Optional

def process_data(
    items: List[Dict[str, Any]],
    filter_func: Optional[Callable[[Dict[str, Any]], bool]] = None
) -> List[Dict[str, Any]]:
    if filter_func:
        return [item for item in items if filter_func(item)]
    return items
```

## Compatibility

### Backward Compatibility

PEP 649 maintains backward compatibility:

```python
# String annotations still work
def old_style(x: 'int') -> 'str':
    return str(x)

# New style works too
def new_style(x: int) -> str:
    return str(x)
```

### Runtime Behavior

```python
import sys

def example(x: int) -> str:
    return str(x)

# Check if annotations are deferred
if sys.version_info >= (3, 14):
    print("Annotations are deferred")
    # Accessing annotations triggers evaluation
    annotations = example.__annotations__
    print(f"Annotations: {annotations}")
else:
    print("Annotations are evaluated at definition time")
```

## Common Pitfalls

### 1. Circular Imports

```python
# This can still cause issues if not handled properly
# module_a.py
from module_b import ClassB

class ClassA:
    def method(self, b: ClassB) -> None:
        pass

# module_b.py
from module_a import ClassA

class ClassB:
    def method(self, a: ClassA) -> None:
        pass
```

### 2. Runtime Type Checking

```python
# Be careful with runtime type checking
def process_data(data: List[int]) -> int:
    # This will work, but type checking happens at runtime
    if not isinstance(data, list):
        raise TypeError("Expected list")
    return sum(data)
```

## Tools and Libraries

### Type Checkers

```python
# mypy configuration for PEP 649
# mypy.ini
[mypy]
python_version = 3.14
enable_incomplete_feature = ["deferred-annotations"]
```

### Runtime Type Checking

```python
from typing import get_type_hints, get_origin, get_args

def check_types(func, *args, **kwargs):
    """Runtime type checking with deferred annotations"""
    type_hints = get_type_hints(func)

    # Check positional arguments
    for i, (param_name, param_type) in enumerate(type_hints.items()):
        if param_name == 'return':
            continue
        if i < len(args):
            if not isinstance(args[i], param_type):
                raise TypeError(f"Expected {param_type}, got {type(args[i])}")

    return func(*args, **kwargs)
```

## Conclusion

PEP 649 represents a significant improvement to Python's type annotation system, providing:

- **Better Performance**: Annotations are only evaluated when needed
- **Cleaner Syntax**: No more string literals for forward references
- **Improved Developer Experience**: More intuitive and readable code
- **Backward Compatibility**: Existing code continues to work

This enhancement makes Python's type system more efficient and user-friendly while maintaining the flexibility and power that developers expect.

## References

- [PEP 649: Deferred Evaluation of Annotations](https://peps.python.org/pep-0649/)
- [Python 3.14 What's New](https://docs.python.org/3.14/whatsnew/3.14.html)
- [typing module documentation](https://docs.python.org/3.14/library/typing.html)

# Performance Issues Guide

Optimizing Python code for better runtime performance and efficiency.

## Overview

Performance issues in Python include inefficient string operations, unnecessary list comprehensions,
poor dictionary operations, and other patterns that can slow down code execution. While
Python prioritizes readability, understanding performance implications helps write efficient code. This guide shows how
to identify and fix common performance bottlenecks.

## Inefficient String Operations

### The Problem: String Concatenation

**❌ Inefficient String Building:**

```python
def build_message(parts: list[str]) -> str:
    message = ""
    for part in parts:
        message += part + " "  # Creates new string each time
    return message.strip()

def format_user_info(users: list[dict]) -> str:
    result = ""
    for user in users:
        result += f"Name: {user['name']}, Email: {user['email']}\n"
    return result
```

**Problems:**

- Creates new string objects on each concatenation
- O(n²) time complexity for n concatenations
- High memory usage due to temporary objects
- Poor performance with large datasets

### The Solution: Efficient String Building

**✅ Efficient String Building:**

```python
def build_message(parts: list[str]) -> str:
    return " ".join(parts)  # Single operation

def format_user_info(users: list[dict]) -> str:
    lines = []
    for user in users:
        lines.append(f"Name: {user['name']}, Email: {user['email']}")
    return "\n".join(lines)

# Even better with list comprehension
def format_user_info(users: list[dict]) -> str:
    return "\n".join(
        f"Name: {user['name']}, Email: {user['email']}"
        for user in users
    )
```

### Advanced String Optimization

```python
from io import StringIO
from typing import List, Dict, Any

def build_large_report(data: List[Dict[str, Any]]) -> str:
    """Build large report efficiently."""
    buffer = StringIO()

    for item in data:
        buffer.write(f"ID: {item['id']}\n")
        buffer.write(f"Name: {item['name']}\n")
        buffer.write(f"Status: {item['status']}\n")
        buffer.write("-" * 40 + "\n")

    return buffer.getvalue()

# Using f-strings for better performance
def format_user_data(user: Dict[str, Any]) -> str:
    """Format user data with f-strings."""
    return f"User: {user['name']} ({user['email']}) - {user['role']}"

# Template-based formatting for repeated patterns
from string import Template

def format_email_template(template: str, data: Dict[str, str]) -> str:
    """Format email template efficiently."""
    t = Template(template)
    return t.substitute(data)
```

## Unnecessary List Comprehensions

### The Problem: Overuse of Comprehensions

**❌ Unnecessary Comprehension:**

```python
def get_even_numbers(numbers: list[int]) -> list[int]:
    return [n for n in numbers if n % 2 == 0]  # Could use filter

def process_items(items: list[str]) -> list[str]:
    return [item.upper() for item in items]  # Could use map

def find_matching_items(items: list[dict], key: str, value: str) -> list[dict]:
    return [item for item in items if item.get(key) == value]  # Could use filter
```

**Problems:**

- Memory overhead for large datasets
- Unnecessary list creation
- Less efficient than generator expressions
- Can be replaced with more appropriate functions

### The Solution: Appropriate Iteration

**✅ More Efficient Approaches:**

```python
def get_even_numbers(numbers: list[int]) -> list[int]:
    return list(filter(lambda n: n % 2 == 0, numbers))

def process_items(items: list[str]) -> list[str]:
    return list(map(str.upper, items))

def find_matching_items(items: list[dict], key: str, value: str) -> list[dict]:
    return list(filter(lambda item: item.get(key) == value, items))

# Use generator expressions for memory efficiency
def process_large_dataset(data: list[dict]) -> None:
    """Process large dataset without loading all into memory."""
    processed = (transform_item(item) for item in data if is_valid(item))

    for item in processed:
        save_item(item)

# Use any() and all() for boolean checks
def has_valid_users(users: list[dict]) -> bool:
    """Check if any users are valid."""
    return any(user.get('email') and user.get('name') for user in users)

def all_users_complete(users: list[dict]) -> bool:
    """Check if all users have complete data."""
    return all(
        user.get('email') and user.get('name') and user.get('role')
        for user in users
    )
```

## Inefficient Dictionary Operations

### The Problem: Poor Dict Operations

**❌ Inefficient Dict Operations:**

```python
def merge_dicts(dict1: dict, dict2: dict) -> dict:
    result = dict1.copy()
    for key, value in dict2.items():
        result[key] = value
    return result

def filter_dict(data: dict, keys: list[str]) -> dict:
    result = {}
    for key in keys:
        if key in data:
            result[key] = data[key]
    return result

def update_dict_values(data: dict, updates: dict) -> dict:
    result = data.copy()
    for key, value in updates.items():
        if key in result:
            result[key] = value
    return result
```

**Problems:**

- Unnecessary copying
- Inefficient iteration
- Memory overhead
- Can be simplified with built-in methods

### The Solution: Efficient Dict Operations

**✅ Efficient Dict Operations:**

```python
def merge_dicts(dict1: dict, dict2: dict) -> dict:
    return {**dict1, **dict2}  # Python 3.5+ syntax

def filter_dict(data: dict, keys: list[str]) -> dict:
    return {key: data[key] for key in keys if key in data}

def update_dict_values(data: dict, updates: dict) -> dict:
    return {**data, **{k: v for k, v in updates.items() if k in data}}

# Use dict.get() for safe access
def safe_dict_access(data: dict, key: str, default: Any = None) -> Any:
    """Safe dictionary access with default."""
    return data.get(key, default)

# Use dict.setdefault() for conditional updates
def add_to_dict(data: dict, key: str, value: Any) -> None:
    """Add to dict only if key doesn't exist."""
    data.setdefault(key, value)

# Use collections.defaultdict for automatic defaults
from collections import defaultdict

def group_items_by_category(items: list[dict]) -> dict:
    """Group items by category efficiently."""
    grouped = defaultdict(list)
    for item in items:
        grouped[item['category']].append(item)
    return dict(grouped)
```

## Memory and CPU Optimization

### 1. Generator Expressions

```python
# ❌ Memory inefficient
def process_large_file(file_path: str) -> list[str]:
    with open(file_path, 'r') as f:
        lines = f.readlines()  # Loads entire file into memory

    processed = []
    for line in lines:
        if line.strip():
            processed.append(line.strip().upper())

    return processed

# ✅ Memory efficient with generators
def process_large_file(file_path: str) -> None:
    """Process large file without loading into memory."""
    with open(file_path, 'r') as f:
        for line in f:  # Iterate line by line
            if line.strip():
                process_line(line.strip().upper())

def get_processed_lines(file_path: str):
    """Generator for processed lines."""
    with open(file_path, 'r') as f:
        for line in f:
            if line.strip():
                yield line.strip().upper()

# Usage
for processed_line in get_processed_lines('large_file.txt'):
    print(processed_line)
```

### 2. Lazy Evaluation

```python
# ❌ Eager evaluation
def get_expensive_data() -> list[str]:
    """Get expensive data (always computed)."""
    print("Computing expensive data...")
    return ["data1", "data2", "data3"]

def process_data():
    data = get_expensive_data()  # Always computed
    if some_condition():
        return data
    return []

# ✅ Lazy evaluation
def get_expensive_data():
    """Generator for expensive data (computed on demand)."""
    print("Computing expensive data...")
    yield "data1"
    yield "data2"
    yield "data3"

def process_data():
    if some_condition():
        return list(get_expensive_data())  # Only computed if needed
    return []
```

### 3. Caching and Memoization

```python
from functools import lru_cache, cache
import time

# ❌ No caching
def expensive_calculation(n: int) -> int:
    """Expensive calculation without caching."""
    time.sleep(0.1)  # Simulate expensive operation
    return n * n * n

def process_numbers(numbers: list[int]) -> list[int]:
    results = []
    for num in numbers:
        result = expensive_calculation(num)  # Recalculated each time
        results.append(result)
    return results

# ✅ With caching
@lru_cache(maxsize=128)
def expensive_calculation(n: int) -> int:
    """Expensive calculation with caching."""
    time.sleep(0.1)  # Simulate expensive operation
    return n * n * n

# Python 3.9+ with cache decorator
@cache
def fibonacci(n: int) -> int:
    """Fibonacci with automatic caching."""
    if n < 2:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# Manual caching for complex cases
class DataProcessor:
    """Data processor with manual caching."""

    def __init__(self):
        self._cache: dict = {}

    def process_data(self, data: str) -> str:
        """Process data with manual caching."""
        if data in self._cache:
            return self._cache[data]

        # Expensive processing
        result = data.upper() + "_processed"
        self._cache[data] = result
        return result
```

## Algorithm Optimization

### 1. Choosing Right Data Structures

```python
# ❌ Inefficient list operations
def find_duplicates(items: list[str]) -> list[str]:
    """Find duplicates using list (O(n²))."""
    duplicates = []
    for i, item in enumerate(items):
        if item in items[i+1:]:  # O(n) operation
            if item not in duplicates:
                duplicates.append(item)
    return duplicates

# ✅ Efficient set operations
def find_duplicates(items: list[str]) -> list[str]:
    """Find duplicates using set (O(n))."""
    seen = set()
    duplicates = set()

    for item in items:
        if item in seen:
            duplicates.add(item)
        else:
            seen.add(item)

    return list(duplicates)

# Use collections.Counter for counting
from collections import Counter

def get_item_counts(items: list[str]) -> dict[str, int]:
    """Get item counts efficiently."""
    return dict(Counter(items))
```

### 2. Optimizing Loops

```python
# ❌ Nested loops
def find_common_items(list1: list[str], list2: list[str]) -> list[str]:
    """Find common items with nested loops (O(n²))."""
    common = []
    for item1 in list1:
        for item2 in list2:
            if item1 == item2 and item1 not in common:
                common.append(item1)
    return common

# ✅ Set intersection
def find_common_items(list1: list[str], list2: list[str]) -> list[str]:
    """Find common items with set intersection (O(n))."""
    return list(set(list1) & set(list2))

# Use enumerate for index access
def find_items_with_indices(items: list[str], target: str) -> list[int]:
    """Find indices of target items."""
    return [i for i, item in enumerate(items) if item == target]

# Use zip for parallel iteration
def combine_lists(list1: list[str], list2: list[str]) -> list[tuple[str, str]]:
    """Combine two lists efficiently."""
    return list(zip(list1, list2))
```

### 3. Early Exit Strategies

```python
# ❌ Always processes all items
def has_expensive_item(items: list[dict]) -> bool:
    """Check if any item is expensive."""
    expensive_items = []
    for item in items:
        if item.get('price', 0) > 100:
            expensive_items.append(item)
    return len(expensive_items) > 0

# ✅ Early exit
def has_expensive_item(items: list[dict]) -> bool:
    """Check if any item is expensive with early exit."""
    for item in items:
        if item.get('price', 0) > 100:
            return True  # Exit as soon as found
    return False

# Use any() for cleaner early exit
def has_expensive_item(items: list[dict]) -> bool:
    """Check if any item is expensive using any()."""
    return any(item.get('price', 0) > 100 for item in items)
```

## Profiling and Measurement

### 1. Time Profiling

```python
import time
import cProfile
import pstats
from functools import wraps

def time_function(func):
    """Decorator to time function execution."""
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.perf_counter()
        result = func(*args, **kwargs)
        end_time = time.perf_counter()
        print(f"{func.__name__} took {end_time - start_time:.4f} seconds")
        return result
    return wrapper

@time_function
def slow_function():
    """Function to profile."""
    total = 0
    for i in range(1000000):
        total += i
    return total

# Profile with cProfile
def profile_function():
    """Profile function with cProfile."""
    profiler = cProfile.Profile()
    profiler.enable()

    # Your code here
    slow_function()

    profiler.disable()
    stats = pstats.Stats(profiler)
    stats.sort_stats('cumulative')
    stats.print_stats(10)  # Top 10 functions
```

### 2. Memory Profiling

```python
import tracemalloc
import psutil
import os

def profile_memory():
    """Profile memory usage."""
    tracemalloc.start()

    # Your code here
    data = [i for i in range(1000000)]

    current, peak = tracemalloc.get_traced_memory()
    print(f"Current memory usage: {current / 1024 / 1024:.2f} MB")
    print(f"Peak memory usage: {peak / 1024 / 1024:.2f} MB")

    tracemalloc.stop()

def get_memory_usage():
    """Get current memory usage."""
    process = psutil.Process(os.getpid())
    return process.memory_info().rss / 1024 / 1024  # MB
```

### 3. Performance Testing

```python
import timeit
from typing import Callable, Any

def benchmark_functions(functions: list[Callable], *args, **kwargs) -> dict[str, float]:
    """Benchmark multiple functions."""
    results = {}

    for func in functions:
        time_taken = timeit.timeit(
            lambda: func(*args, **kwargs),
            number=1000
        )
        results[func.__name__] = time_taken

    return results

# Example usage
def inefficient_string_build(parts: list[str]) -> str:
    result = ""
    for part in parts:
        result += part
    return result

def efficient_string_build(parts: list[str]) -> str:
    return "".join(parts)

# Benchmark
parts = ["part1", "part2", "part3", "part4", "part5"]
results = benchmark_functions(
    [inefficient_string_build, efficient_string_build],
    parts
)

for func_name, time_taken in results.items():
    print(f"{func_name}: {time_taken:.4f} seconds")
```

## Best Practices

### 1. Choose Right Data Structures

```python
# ✅ Use sets for membership testing
def is_valid_user(user_id: str, valid_ids: set[str]) -> bool:
    return user_id in valid_ids

# ✅ Use deque for queue operations
from collections import deque

def process_queue(items: list[str]) -> None:
    queue = deque(items)
    while queue:
        item = queue.popleft()
        process_item(item)

# ✅ Use defaultdict for grouping
from collections import defaultdict

def group_by_category(items: list[dict]) -> dict:
    grouped = defaultdict(list)
    for item in items:
        grouped[item['category']].append(item)
    return dict(grouped)
```

### 2. Optimize I/O Operations

```python
# ✅ Batch I/O operations
def write_data_batch(data: list[str], file_path: str) -> None:
    """Write data in batches."""
    with open(file_path, 'w') as f:
        f.write('\n'.join(data))

# ✅ Use context managers
def process_file(file_path: str) -> None:
    """Process file with proper resource management."""
    with open(file_path, 'r') as f:
        for line in f:
            process_line(line)
```

### 3. Use Built-in Functions

```python
# ✅ Use built-in functions
def calculate_sum(numbers: list[int]) -> int:
    return sum(numbers)

def find_maximum(numbers: list[int]) -> int:
    return max(numbers)

def check_all_true(conditions: list[bool]) -> bool:
    return all(conditions)
```

## Conclusion

🦊 _Performance optimization requires the cunning of a fox - knowing when to optimize, what to measure, and
how to balance readability with efficiency._

Optimizing Python performance provides:

- **Speed**: Faster execution times
- **Memory**: Lower memory usage
- **Scalability**: Better handling of large datasets
- **Responsiveness**: Improved user experience
- **Cost**: Reduced computational resources

Key principles:

- **Measure first** before optimizing
- **Use appropriate data structures** for the task
- **Leverage built-in functions** and libraries
- **Consider memory vs. CPU trade-offs**
- **Profile regularly** to identify bottlenecks
- **Optimize the critical path** first

_Build code that runs like a fox - fast, efficient, and purposeful._ 🦊

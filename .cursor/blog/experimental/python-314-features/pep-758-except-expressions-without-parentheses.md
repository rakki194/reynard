# PEP 758: Allow except and except\* expressions without parentheses

_Comprehensive guide to the new exception handling syntax in Python 3.14_

## Overview

PEP 758 introduces a more concise syntax for exception handling by allowing parentheses to be omitted when there are multiple exception types and the `as` clause is not used. This enhancement makes exception handling more readable and reduces syntactic noise in common cases.

## What Changed

### Before Python 3.14

```python
# Required parentheses for multiple exception types
try:
    connect_to_server()
except (TimeoutError, ConnectionRefusedError):
    print("Network issue encountered.")

# Also required for except* (exception groups)
try:
    connect_to_server()
except* (TimeoutError, ConnectionRefusedError):
    print("Network issue encountered.")
```

### Python 3.14 and Later

```python
# Parentheses can now be omitted
try:
    connect_to_server()
except TimeoutError, ConnectionRefusedError:
    print("Network issue encountered.")

# Same applies to except* (for exception groups)
try:
    connect_to_server()
except* TimeoutError, ConnectionRefusedError:
    print("Network issue encountered.")
```

## Syntax Rules

### When Parentheses Can Be Omitted

1. **Multiple exception types**: You have more than one exception type
2. **No `as` clause**: You're not capturing the exception in a variable
3. **Valid for both `except` and `except*`**: Works with regular exceptions and exception groups

### When Parentheses Are Still Required

```python
# Still need parentheses when using 'as' clause
try:
    risky_operation()
except (ValueError, TypeError) as e:
    print(f"Error: {e}")

# Still need parentheses for single exception types (optional but recommended)
try:
    risky_operation()
except (ValueError,):
    print("Value error occurred")
```

## Practical Examples

### Network Operations

```python
import socket
import requests

def robust_network_call(url):
    try:
        response = requests.get(url, timeout=5)
        return response.json()
    except requests.Timeout, requests.ConnectionError, socket.timeout:
        return {"error": "Network timeout or connection failed"}
    except requests.HTTPError, requests.RequestException:
        return {"error": "HTTP or request error occurred"}
```

### File Operations

```python
import os
import shutil

def safe_file_operation(source, destination):
    try:
        shutil.copy2(source, destination)
    except FileNotFoundError, PermissionError, OSError:
        print("File operation failed - check permissions and file existence")
    except shutil.SameFileError, shutil.Error:
        print("File system error occurred")
```

### Exception Groups (PEP 654)

```python
import asyncio

async def multiple_operations():
    try:
        await asyncio.gather(
            operation1(),
            operation2(),
            operation3()
        )
    except* ValueError, TypeError:
        print("Data validation errors occurred")
    except* ConnectionError, TimeoutError:
        print("Network-related errors occurred")
    except* RuntimeError, NotImplementedError:
        print("Implementation errors occurred")
```

## Migration Guide

### Updating Existing Code

**Option 1: Keep existing syntax (recommended for now)**

```python
# No changes needed - existing code continues to work
try:
    operation()
except (ValueError, TypeError):
    handle_error()
```

**Option 2: Adopt new syntax gradually**

```python
# Update to new syntax for better readability
try:
    operation()
except ValueError, TypeError:
    handle_error()
```

### Best Practices

1. **Consistency**: Choose one style and use it consistently throughout your codebase
2. **Readability**: The new syntax is more readable for simple cases
3. **Team agreement**: Discuss with your team which style to adopt
4. **Gradual adoption**: You can migrate gradually without breaking existing code

## Error Handling Patterns

### Hierarchical Exception Handling

```python
def process_data(data):
    try:
        # Primary operation
        result = complex_operation(data)
        return result
    except ValueError, TypeError:
        # Data validation errors
        print("Invalid data format")
        return None
    except ArithmeticError, OverflowError:
        # Mathematical errors
        print("Mathematical operation failed")
        return None
    except MemoryError, RecursionError:
        # Resource errors
        print("Insufficient resources")
        return None
    except Exception:
        # Catch-all for unexpected errors
        print("Unexpected error occurred")
        return None
```

### Exception Group Processing

```python
async def parallel_processing(tasks):
    try:
        results = await asyncio.gather(*tasks, return_exceptions=True)
        return results
    except* ValueError, TypeError:
        # Handle data validation errors from any task
        print("Data validation errors in parallel tasks")
    except* ConnectionError, TimeoutError:
        # Handle network errors from any task
        print("Network errors in parallel tasks")
    except* Exception:
        # Handle any other errors
        print("Other errors in parallel tasks")
```

## Performance Considerations

- **No performance impact**: The new syntax is purely syntactic sugar
- **Same bytecode**: Generates identical bytecode to the parenthesized version
- **Parsing efficiency**: Minimal impact on parsing performance

## Compatibility

- **Backward compatible**: All existing code continues to work unchanged
- **Forward compatible**: New syntax works in Python 3.14+
- **No deprecation**: Old syntax is not deprecated and remains valid

## Common Use Cases

### 1. API Error Handling

```python
import requests

def api_call(endpoint):
    try:
        response = requests.get(endpoint)
        response.raise_for_status()
        return response.json()
    except requests.HTTPError, requests.ConnectionError:
        return {"error": "API request failed"}
    except requests.Timeout, requests.RequestException:
        return {"error": "Request timeout or error"}
```

### 2. Database Operations

```python
import sqlite3

def database_operation(query):
    try:
        conn = sqlite3.connect('database.db')
        cursor = conn.cursor()
        cursor.execute(query)
        return cursor.fetchall()
    except sqlite3.OperationalError, sqlite3.IntegrityError:
        print("Database operation failed")
        return []
    except sqlite3.DatabaseError, sqlite3.Error:
        print("Database error occurred")
        return []
```

### 3. File System Operations

```python
import os
import pathlib

def file_operations(file_path):
    try:
        path = pathlib.Path(file_path)
        if path.exists():
            return path.read_text()
        else:
            return None
    except PermissionError, FileNotFoundError:
        print("File access denied or not found")
        return None
    except OSError, IOError:
        print("File system error")
        return None
```

## Testing the New Syntax

```python
def test_except_syntax():
    """Test the new except syntax without parentheses"""

    # Test regular exceptions
    try:
        raise ValueError("Test error")
    except ValueError, TypeError:
        print("Caught ValueError or TypeError")

    # Test exception groups
    try:
        raise ExceptionGroup("test", [ValueError("error1"), TypeError("error2")])
    except* ValueError, TypeError:
        print("Caught ValueError or TypeError in exception group")

    print("New except syntax works correctly!")

if __name__ == "__main__":
    test_except_syntax()
```

## Summary

PEP 758 makes Python exception handling more concise and readable by allowing parentheses to be omitted in common cases. This enhancement:

- **Reduces syntactic noise** in exception handling
- **Improves readability** for multiple exception types
- **Maintains full backward compatibility**
- **Works with both regular exceptions and exception groups**
- **Has no performance impact**

The new syntax is particularly beneficial for:

- Network and API error handling
- File system operations
- Database operations
- Parallel processing with exception groups
- Any scenario with multiple related exception types

This change represents Python's continued evolution toward more readable and expressive syntax while maintaining the language's principle of explicit over implicit behavior.

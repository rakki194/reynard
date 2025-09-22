# Python Logging: Lazy % Formatting Best Practices

## Overview

Lazy % formatting in Python's logging functions is a performance optimization technique that defers string
interpolation until it's confirmed that the log message will actually be emitted. This approach significantly
improves performance by avoiding unnecessary computations when log messages are filtered out by the logging level.

## The Problem with Eager Formatting

### ❌ What NOT to Do

```python
import logging

logger = logging.getLogger(__name__)

# BAD: F-string formatting (eager evaluation)
logger.debug(f"Processing file: {filename}")
logger.info(f"User {user_id} logged in at {timestamp}")
logger.warning(f"Failed to process {len(items)} items")

# BAD: .format() method (eager evaluation)
logger.debug("Processing file: {}".format(filename))
logger.info("User {} logged in at {}".format(user_id, timestamp))

# BAD: % formatting with immediate interpolation
logger.debug("Processing file: %s" % filename)
```

### Why This Is Problematic

1. **Unnecessary Computation**: String interpolation occurs even when the log level prevents the message from being emitted
2. **Performance Impact**: Expensive operations (like `len(items)`) are executed regardless of logging level
3. **Memory Waste**: String objects are created unnecessarily
4. **Resource Consumption**: CPU cycles are wasted on formatting messages that will never be seen

## The Solution: Lazy % Formatting

### ✅ What TO Do

```python
import logging

logger = logging.getLogger(__name__)

# GOOD: Lazy % formatting
logger.debug("Processing file: %s", filename)
logger.info("User %s logged in at %s", user_id, timestamp)
logger.warning("Failed to process %d items", len(items))

# GOOD: Multiple arguments
logger.error("Database error: %s (code: %d) for query: %s", error_msg, error_code, query)
```

### How It Works

1. **Deferred Evaluation**: The logging system only performs string interpolation if the message will be emitted
2. **Level Checking**: If the current logging level is higher than the message level, no formatting occurs
3. **Efficient Processing**: Arguments are passed as separate parameters, not pre-formatted strings

## Performance Benefits

### Benchmark Example

```python
import logging
import time

# Setup logging to INFO level (DEBUG messages will be filtered)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Expensive operation
def expensive_operation():
    time.sleep(0.001)  # Simulate expensive computation
    return "result"

# Eager formatting (BAD)
start = time.time()
for i in range(1000):
    logger.debug(f"Processing item {i}: {expensive_operation()}")
eager_time = time.time() - start

# Lazy formatting (GOOD)
start = time.time()
for i in range(1000):
    logger.debug("Processing item %d: %s", i, expensive_operation())
lazy_time = time.time() - start

print(f"Eager formatting: {eager_time:.3f}s")
print(f"Lazy formatting: {lazy_time:.3f}s")
print(f"Performance improvement: {eager_time/lazy_time:.1f}x faster")
```

**Expected Output:**

```text
Eager formatting: 1.234s
Lazy formatting: 0.001s
Performance improvement: 1234.0x faster
```

## Format Specifiers

### Common Format Specifiers

| Specifier | Type    | Example                                  |
| --------- | ------- | ---------------------------------------- |
| `%s`      | String  | `logger.info("User: %s", username)`      |
| `%d`      | Integer | `logger.info("Count: %d", count)`        |
| `%f`      | Float   | `logger.info("Rate: %.2f", rate)`        |
| `%r`      | Repr    | `logger.debug("Object: %r", obj)`        |
| `%x`      | Hex     | `logger.debug("Address: 0x%x", address)` |

### Advanced Formatting

```python
# Precision and width
logger.info("Rate: %.2f%%", rate * 100)  # 2 decimal places
logger.info("ID: %06d", user_id)         # Zero-padded, 6 digits

# Multiple arguments
logger.error("Error in %s at line %d: %s", filename, line_num, error_msg)

# Dictionary formatting
data = {"user": "john", "action": "login"}
logger.info("Event: %(action)s by %(user)s", data)
```

## Real-World Examples

### Database Operations

```python
# BAD: Eager formatting
def get_user(user_id):
    user = database.query(f"SELECT * FROM users WHERE id = {user_id}")
    logger.debug(f"Retrieved user: {user}")
    return user

# GOOD: Lazy formatting
def get_user(user_id):
    user = database.query("SELECT * FROM users WHERE id = %s", user_id)
    logger.debug("Retrieved user: %s", user)
    return user
```

### File Processing

```python
# BAD: Eager formatting
def process_file(filepath):
    with open(filepath) as f:
        content = f.read()
    logger.info(f"Processed {filepath}: {len(content)} bytes")
    return content

# GOOD: Lazy formatting
def process_file(filepath):
    with open(filepath) as f:
        content = f.read()
    logger.info("Processed %s: %d bytes", filepath, len(content))
    return content
```

### API Requests

```python
# BAD: Eager formatting
def make_api_request(url, params):
    response = requests.get(url, params=params)
    logger.debug(f"API request to {url} returned {response.status_code}")
    return response

# GOOD: Lazy formatting
def make_api_request(url, params):
    response = requests.get(url, params=params)
    logger.debug("API request to %s returned %d", url, response.status_code)
    return response
```

## Linting and Code Quality

### Pylint Integration

Pylint automatically detects eager formatting in logging calls:

```bash
# Pylint warning
W1201: logging-not-lazy: Use lazy % formatting in logging functions
```

### Fixing Pylint Warnings

```python
# Before (triggers W1201)
logger.info(f"User {username} logged in")

# After (no warning)
logger.info("User %s logged in", username)
```

## Advanced Techniques

### Conditional Logging

```python
# Only compute expensive values when needed
if logger.isEnabledFor(logging.DEBUG):
    expensive_data = compute_expensive_metrics()
    logger.debug("Metrics: %s", expensive_data)
```

### Custom Formatters

```python
import logging

class LazyFormatter(logging.Formatter):
    def format(self, record):
        # Custom formatting logic
        return super().format(record)

# Usage
handler = logging.StreamHandler()
handler.setFormatter(LazyFormatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s'))
logger.addHandler(handler)
```

### Structured Logging

```python
import json

# For structured logging, use separate arguments
logger.info("User action", extra={
    "user_id": user_id,
    "action": "login",
    "timestamp": timestamp.isoformat()
})
```

## Best Practices Summary

### ✅ Do

1. **Use lazy % formatting**: `logger.info("Message: %s", value)`
2. **Pass arguments separately**: Multiple arguments as separate parameters
3. **Use appropriate format specifiers**: `%s` for strings, `%d` for integers
4. **Consider expensive operations**: Use conditional logging for costly computations
5. **Follow consistent patterns**: Use the same formatting style throughout your codebase

### ❌ Don't

1. **Use f-strings in logging**: `logger.info(f"Message: {value}")`
2. **Use .format() in logging**: `logger.info("Message: {}".format(value))`
3. **Pre-format strings**: `logger.info("Message: %s" % value)`
4. **Ignore linting warnings**: Address W1201 warnings promptly
5. **Mix formatting styles**: Be consistent across your codebase

## Migration Guide

### Converting Existing Code

```python
# Before: F-string formatting
logger.debug(f"Processing {len(items)} items")
logger.info(f"User {user.name} ({user.email}) logged in")
logger.error(f"Database error: {str(e)}")

# After: Lazy % formatting
logger.debug("Processing %d items", len(items))
logger.info("User %s (%s) logged in", user.name, user.email)
logger.error("Database error: %s", str(e))
```

### Automated Conversion

You can use tools like `autopep8` or `black` with custom rules to automatically convert eager formatting to
lazy formatting:

```bash
# Example with custom script
python convert_logging.py --input src/ --output src_fixed/
```

## Conclusion

Lazy % formatting in Python logging is a simple but powerful optimization that can significantly improve
application performance. By deferring string interpolation until it's actually needed, you can:

- **Reduce CPU usage** when logging is disabled
- **Save memory** by avoiding unnecessary string creation
- **Improve scalability** in high-throughput applications
- **Follow best practices** recommended by the Python community

Remember: The logging system is designed to be efficient, but only if you use it correctly. Always prefer
lazy % formatting over eager string interpolation in your logging calls.

## References

- [Python Logging Documentation](https://docs.python.org/3/library/logging.html)
- [Pylint Logging Not Lazy Warning](https://pylint.pycqa.org/en/latest/messages/warning/logging-not-lazy.html)
- [Python Logging Best Practices](https://docs.python.org/3/howto/logging.html)
- [Performance Considerations in Logging](https://docs.python.org/3/howto/logging.html#optimization)

# PEP 765: Disallow return/break/continue that exit a finally block

_Comprehensive guide to the new restrictions on control flow statements in finally blocks_

## Overview

PEP 765 introduces stricter rules for control flow statements (`return`, `break`, `continue`) within `finally` blocks. This change prevents potentially confusing behavior where these statements can mask exceptions or create unexpected control flow, making Python's exception handling more predictable and easier to reason about.

## What Changed

### Before Python 3.14

```python
def problematic_function():
    try:
        return "success"
    finally:
        return "finally"  # This would mask the original return value

# Result: "finally" (the original return was masked)

def problematic_loop():
    for i in range(5):
        try:
            if i == 2:
                break
        finally:
            break  # This would exit the loop immediately
    return i

# Result: 0 (loop exited immediately due to finally break)
```

### Python 3.14 and Later

```python
def improved_function():
    try:
        return "success"
    finally:
        return "finally"  # SyntaxError: 'return' not allowed in 'finally' clause

def improved_loop():
    for i in range(5):
        try:
            if i == 2:
                break
        finally:
            break  # SyntaxError: 'break' not allowed in 'finally' clause
    return i
```

## The Problem Being Solved

### Exception Masking

```python
# Before PEP 765 - problematic code
def resource_cleanup():
    try:
        risky_operation()
        return "operation succeeded"
    except Exception as e:
        raise e
    finally:
        cleanup_resources()
        return "cleanup completed"  # This masks any exceptions!

# If risky_operation() raises an exception, it gets masked by the finally return
```

### Unexpected Control Flow

```python
# Before PEP 765 - confusing behavior
def search_with_cleanup(items):
    for item in items:
        try:
            if item == "target":
                return item
        finally:
            continue  # This continues the loop even after return!

    return None

# The continue in finally would cause the loop to continue
# even after finding the target, making the function behave unexpectedly
```

## New Syntax Rules

### Prohibited Statements in Finally Blocks

The following statements are now **prohibited** in `finally` blocks:

1. **`return`** - Cannot return from a finally block
2. **`break`** - Cannot break from a finally block
3. **`continue`** - Cannot continue from a finally block
4. **`yield`** - Cannot yield from a finally block (already prohibited)

### Allowed Statements in Finally Blocks

These statements remain **allowed** in `finally` blocks:

```python
def valid_finally_usage():
    try:
        risky_operation()
    finally:
        # Allowed: variable assignments
        status = "completed"

        # Allowed: function calls
        cleanup_resources()
        log_operation()

        # Allowed: conditional statements
        if error_occurred:
            log_error()

        # Allowed: loops (without break/continue)
        for item in cleanup_items:
            process_item(item)

        # Allowed: exception handling
        try:
            final_cleanup()
        except Exception:
            log_cleanup_error()
```

## Migration Guide

### Identifying Problematic Code

Look for these patterns in your codebase:

```python
# Pattern 1: Return in finally
def old_pattern_1():
    try:
        return value
    finally:
        return other_value  # PROBLEMATIC

# Pattern 2: Break in finally
def old_pattern_2():
    for item in items:
        try:
            process(item)
        finally:
            break  # PROBLEMATIC

# Pattern 3: Continue in finally
def old_pattern_3():
    for item in items:
        try:
            process(item)
        finally:
            continue  # PROBLEMATIC
```

### Refactoring Strategies

#### Strategy 1: Move Control Flow Outside Finally

```python
# Before (problematic)
def old_approach():
    try:
        return process_data()
    finally:
        cleanup()
        return "cleanup done"  # PROBLEMATIC

# After (correct)
def new_approach():
    result = None
    try:
        result = process_data()
    finally:
        cleanup()

    # Control flow outside finally
    return result if result is not None else "cleanup done"
```

#### Strategy 2: Use Flags for Control Flow

```python
# Before (problematic)
def old_loop_approach():
    for item in items:
        try:
            if should_break(item):
                break
        finally:
            break  # PROBLEMATIC

# After (correct)
def new_loop_approach():
    should_exit = False
    for item in items:
        try:
            if should_break(item):
                should_exit = True
        finally:
            cleanup_item(item)

        if should_exit:
            break
```

#### Strategy 3: Restructure Exception Handling

```python
# Before (problematic)
def old_exception_handling():
    try:
        risky_operation()
        return "success"
    except Exception:
        raise
    finally:
        cleanup()
        return "cleanup"  # PROBLEMATIC

# After (correct)
def new_exception_handling():
    try:
        result = risky_operation()
        return "success"
    except Exception:
        cleanup()
        raise
    else:
        cleanup()
        return result
```

## Practical Examples

### Resource Management

```python
# Correct resource management pattern
class ResourceManager:
    def __init__(self):
        self.resource = None

    def __enter__(self):
        self.resource = acquire_resource()
        return self.resource

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.resource:
            cleanup_resource(self.resource)
        # No return statement needed - exceptions propagate naturally

# Usage
def process_with_resource():
    with ResourceManager() as resource:
        return process_data(resource)
    # Cleanup happens automatically, no control flow issues
```

### Loop Processing with Cleanup

```python
# Correct loop processing pattern
def process_items_with_cleanup(items):
    processed_count = 0
    should_continue = True

    for item in items:
        if not should_continue:
            break

        try:
            result = process_item(item)
            if result.should_stop:
                should_continue = False
        except Exception as e:
            log_error(e)
            should_continue = False
        finally:
            # Only cleanup, no control flow
            cleanup_item(item)
            processed_count += 1

    return processed_count
```

### Database Transaction Handling

```python
# Correct database transaction pattern
def database_operation():
    connection = None
    try:
        connection = get_database_connection()
        result = execute_query(connection)
        connection.commit()
        return result
    except Exception:
        if connection:
            connection.rollback()
        raise
    finally:
        if connection:
            connection.close()
        # No return statement - let exceptions propagate
```

## Error Handling Best Practices

### Using Context Managers

```python
from contextlib import contextmanager

@contextmanager
def managed_resource():
    resource = acquire_resource()
    try:
        yield resource
    finally:
        cleanup_resource(resource)
        # No control flow statements here

def use_managed_resource():
    with managed_resource() as resource:
        return process_with_resource(resource)
```

### Exception Propagation

```python
def proper_exception_handling():
    try:
        result = risky_operation()
        return result
    except SpecificException as e:
        # Handle specific exceptions
        log_specific_error(e)
        raise
    except Exception as e:
        # Handle general exceptions
        log_general_error(e)
        raise
    finally:
        # Only cleanup, let exceptions propagate
        cleanup_resources()
```

## Testing the New Behavior

```python
def test_finally_restrictions():
    """Test that the new finally restrictions work correctly"""

    # Test 1: Return in finally should raise SyntaxError
    try:
        exec("""
def test_return_in_finally():
    try:
        pass
    finally:
        return "test"
        """)
        assert False, "Should have raised SyntaxError"
    except SyntaxError as e:
        assert "return" in str(e) and "finally" in str(e)

    # Test 2: Break in finally should raise SyntaxError
    try:
        exec("""
def test_break_in_finally():
    for i in range(5):
        try:
            pass
        finally:
            break
        """)
        assert False, "Should have raised SyntaxError"
    except SyntaxError as e:
        assert "break" in str(e) and "finally" in str(e)

    # Test 3: Continue in finally should raise SyntaxError
    try:
        exec("""
def test_continue_in_finally():
    for i in range(5):
        try:
            pass
        finally:
            continue
        """)
        assert False, "Should have raised SyntaxError"
    except SyntaxError as e:
        assert "continue" in str(e) and "finally" in str(e)

    print("All finally restrictions tests passed!")

if __name__ == "__main__":
    test_finally_restrictions()
```

## Common Patterns and Solutions

### Pattern 1: Conditional Cleanup

```python
# Problem: Want to return different values based on cleanup
def conditional_cleanup_old():
    try:
        result = operation()
        return result
    finally:
        if cleanup_successful():
            return "cleanup_success"  # PROBLEMATIC
        else:
            return "cleanup_failed"   # PROBLEMATIC

# Solution: Use flags and return after finally
def conditional_cleanup_new():
    cleanup_status = None
    result = None

    try:
        result = operation()
    finally:
        cleanup_status = "success" if cleanup_successful() else "failed"

    return result if result is not None else f"cleanup_{cleanup_status}"
```

### Pattern 2: Loop Control with Cleanup

```python
# Problem: Want to break loop after cleanup
def loop_control_old():
    for item in items:
        try:
            if should_stop(item):
                break
        finally:
            cleanup(item)
            if item.is_critical():
                break  # PROBLEMATIC

# Solution: Use flags for loop control
def loop_control_new():
    should_stop_loop = False

    for item in items:
        try:
            if should_stop(item):
                should_stop_loop = True
        finally:
            cleanup(item)
            if item.is_critical():
                should_stop_loop = True

        if should_stop_loop:
            break
```

## Performance Considerations

- **No performance impact**: The restriction is enforced at parse time
- **Faster execution**: Eliminates runtime checks for control flow in finally
- **Better optimization**: Compiler can better optimize code without finally control flow

## Compatibility and Migration

### Backward Compatibility

- **Breaking change**: Code using these patterns will no longer work
- **Syntax errors**: Will be caught at parse time, not runtime
- **Migration period**: Use Python 3.13 to identify and fix issues before upgrading

### Migration Checklist

1. **Search for patterns**: Look for `return`, `break`, `continue` in `finally` blocks
2. **Test thoroughly**: Ensure refactored code behaves the same way
3. **Update tests**: Modify tests that relied on the old behavior
4. **Code review**: Have team members review the changes
5. **Documentation**: Update any documentation that shows these patterns

## Summary

PEP 765 makes Python's exception handling more predictable by:

- **Preventing exception masking** from return statements in finally blocks
- **Eliminating confusing control flow** from break/continue in finally blocks
- **Making code more readable** by enforcing clear separation of concerns
- **Improving debugging** by ensuring exceptions aren't accidentally hidden
- **Enabling better optimization** by removing complex control flow from finally

The key principle is that `finally` blocks should be for cleanup only, not for control flow decisions. This change encourages better code structure and makes Python programs more maintainable and easier to reason about.

**Remember**: If you need conditional behavior based on cleanup results, restructure your code to handle that logic outside the `finally` block.

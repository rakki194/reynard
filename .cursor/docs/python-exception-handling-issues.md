# Python Exception Handling Issues

_Comprehensive guide to exception handling warnings and errors in Python development_

## Overview

This document covers common exception handling issues encountered during Python development, particularly when
working with modern Python codebases. Each issue includes the error message, explanation, and
practical solutions with real-world examples from the Reynard project.

## Exception Chaining with `raise ... from err`

### Error Message

```
Within an `except` clause, raise exceptions with `raise ... from err` or `raise ... from None` to distinguish them from errors in exception handling
```

### Problem

When re-raising exceptions in an `except` clause,
failing to preserve the original exception context can make debugging difficult. This is especially important in
production environments where you need to trace the root cause of issues.

### ❌ Incorrect

```python
try:
    from argon2 import PasswordHasher
except ImportError:
    raise ImportError(
        "argon2-cffi is required for password hashing. "
        "Install with: pip install argon2-cffi"
    )
```

### ✅ Correct

```python
try:
    from argon2 import PasswordHasher
except ImportError as exc:
    raise ImportError(
        "argon2-cffi is required for password hashing. "
        "Install with: pip install argon2-cffi"
    ) from exc
```

### Why This Matters

- **Preserves the original exception traceback** - You can see the full chain of errors
- **Provides context for debugging** - The original error message is preserved
- **Follows Python best practices** - PEP 3134 defines exception chaining
- **Improves error reporting** - Users get more helpful error messages

### Real-World Example

```python
# libraries/gatekeeper/gatekeeper/core/password_manager.py
try:
    from argon2 import PasswordHasher
    from argon2.exceptions import VerificationError, HashingError
except ImportError as exc:
    raise ImportError(
        "argon2-cffi is required for password hashing. "
        "Install with: pip install argon2-cffi"
    ) from exc
```

## Catching Too General Exceptions

### Warning Message

```
Catching too general exception Exception
```

### Problem

Using `except Exception:` can mask unexpected errors and
make debugging difficult. It's often better to catch specific exceptions that you know how to handle.

### ❌ Too Broad

```python
try:
    password_hasher.verify(hashed_password, password)
    return True
except Exception as e:
    logger.warning(f"Error verifying Argon2 hash: {e}")
    return False
```

### ✅ More Specific

```python
try:
    password_hasher.verify(hashed_password, password)
    return True
except VerificationError:
    return False
except (ValueError, TypeError) as e:
    logger.warning("Error verifying Argon2 hash: %s", e)
    return False
```

### When General Exception Handling is Acceptable

There are legitimate cases where catching `Exception` is appropriate:

```python
# In cryptographic operations where any error should be treated as failure
try:
    result = cryptographic_operation()
    return result
except Exception as e:
    logger.warning("Cryptographic operation failed: %s", e)
    return None

# In cleanup operations where you want to ensure cleanup happens
try:
    # Main operation
    perform_main_operation()
finally:
    try:
        cleanup_resources()
    except Exception as e:
        logger.warning("Cleanup failed: %s", e)
        # Don't re-raise - cleanup failure shouldn't mask main operation failure
```

### Best Practices

1. **Catch specific exceptions** when you know how to handle them
2. **Use general Exception** only when appropriate (cryptographic operations, cleanup)
3. **Always log exceptions** to help with debugging
4. **Consider the context** - what should happen if this operation fails?

## Try-Except-Pass Anti-Pattern

### Warning Message

```
`try`-`except`-`pass` detected, consider logging the exception
```

### Problem

Silently ignoring exceptions can hide important errors and make debugging extremely difficult.

### ❌ Silent Failure

```python
try:
    variant = parts[1]
except Exception:
    pass  # Silent failure - this could hide important errors
```

### ✅ Proper Error Handling

```python
try:
    variant = parts[1]
except Exception as e:
    logger.debug("Error parsing hash variant: %s", e)
    # Handle the error appropriately
```

### When Silent Failure Might Be Acceptable

```python
# When you're checking for optional functionality
try:
    import optional_module
    HAS_OPTIONAL_MODULE = True
except ImportError:
    HAS_OPTIONAL_MODULE = False
    # This is acceptable - the module is truly optional
```

### Best Practices

1. **Never use bare `pass`** in exception handlers
2. **Always log exceptions** at an appropriate level
3. **Consider the impact** of silent failures
4. **Document why** you're ignoring specific exceptions

## Exception Handling in Authentication Systems

### Real-World Example from Reynard

```python
# libraries/gatekeeper/gatekeeper/core/auth_manager.py
async def authenticate_by_email(
    self, email: str, password: str
) -> TokenResponse | None:
    """Authenticate a user with email and password."""
    try:
        # Get user from backend by email
        user = await self.backend.get_user_by_email(email)
        if not user:
            logger.warning(
                "Authentication failed: user with email '%s' not found", email
            )
            return None

        # Verify password
        is_valid, updated_hash = self.password_manager.verify_and_update_password(
            password, user.password_hash
        )

        if not is_valid:
            logger.warning(
                "Authentication failed: invalid password for user with email '%s'", email
            )
            return None

        # Create token pair
        token_data: dict[str, Any] = {
            "sub": user.username,
            "role": user.role.value,
            "permissions": user.permissions or [],
            "user_id": str(user.id),
        }
        tokens = self.token_manager.create_tokens(token_data)

        logger.info("User with email '%s' authenticated successfully", email)
        return tokens

    except Exception as e:
        logger.error("Error during email authentication: %s", e)
        return None
```

### Key Principles

1. **Log at appropriate levels** - warnings for expected failures, errors for unexpected ones
2. **Return meaningful values** - None for failure, actual data for success
3. **Handle exceptions gracefully** - don't let authentication errors crash the system
4. **Preserve security** - don't leak sensitive information in error messages

## Performance Considerations

### Exception Handling Performance

```python
# ❌ Inefficient - exception handling in tight loops
def process_items(items):
    results = []
    for item in items:
        try:
            result = expensive_operation(item)
            results.append(result)
        except Exception:
            pass  # Silent failure
    return results

# ✅ Efficient - check conditions before expensive operations
def process_items(items):
    results = []
    for item in items:
        if is_valid_item(item):
            try:
                result = expensive_operation(item)
                results.append(result)
            except SpecificError as e:
                logger.warning("Failed to process item %s: %s", item, e)
    return results
```

## Tools and Configuration

### Linter Configuration

```toml
# pyproject.toml
[tool.pylint.messages_control]
disable = [
    "broad-except",  # Allow broad exceptions in specific contexts
]

[tool.pylint.exceptions]
overgeneral-exceptions = ["Exception"]
```

### Pre-commit Hooks

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/pycqa/flake8
    rev: 6.0.0
    hooks:
      - id: flake8
        args: [--select=E722] # Check for bare except clauses
```

## Troubleshooting

### Common Issues

#### Issue: Exception Chaining Not Working

**Symptoms**: Still getting "During handling of the above exception, another exception occurred"
**Causes**: Not using `from exc` or `from None`
**Solutions**:

```python
# Use from exc to chain exceptions
try:
    risky_operation()
except SpecificError as exc:
    raise NewError("Operation failed") from exc

# Use from None to suppress chaining
try:
    risky_operation()
except SpecificError:
    raise NewError("Operation failed") from None
```

#### Issue: Too Many Specific Exceptions

**Symptoms**: Long chains of except clauses
**Causes**: Over-specification of exception types
**Solutions**:

```python
# Group related exceptions
except (ValueError, TypeError, AttributeError) as e:
    logger.warning("Input validation error: %s", e)
    return None
```

## Conclusion

🦊 _Exception handling requires the cunning of a fox - knowing when to catch, when to re-raise, and
when to let errors bubble up._

Proper exception handling is crucial for robust Python applications. The key principles are:

- **Preserve context** with exception chaining
- **Catch specific exceptions** when possible
- **Log appropriately** for debugging
- **Handle gracefully** without masking important errors
- **Consider performance** in exception-heavy code paths

By following these guidelines and using the provided examples,
you can create Python code that handles errors gracefully while maintaining excellent debugging capabilities.

_Build exception handling that outfoxes complexity and preserves clarity._ 🦊

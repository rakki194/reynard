# Python Linter Warnings & Errors Guide

Guide to common Python linter warnings and errors with practical solutions.

## Overview

## Table of Contents

- [Python Linter Warnings \& Errors Guide](#python-linter-warnings--errors-guide)
  - [Overview](#overview)
  - [Table of Contents](#table-of-contents)
  - [Individual Issue Guides](#individual-issue-guides)
  - [Quick Reference](#quick-reference)
    - [Common Error Messages and Solutions](#common-error-messages-and-solutions)
  - [Exception Handling Issues](#exception-handling-issues)
    - [Exception Chaining with `raise ... from err`](#exception-chaining-with-raise--from-err)
    - [Catching Too General Exceptions](#catching-too-general-exceptions)
  - [Type Annotation Issues](#type-annotation-issues)
    - [Deprecated Type Imports](#deprecated-type-imports)
    - [Undefined Type Variables](#undefined-type-variables)
  - [Code Quality Issues](#code-quality-issues)
    - [Magic Numbers](#magic-numbers)
    - [Unused Variables](#unused-variables)
  - [Logging Issues](#logging-issues)
    - [Lazy Logging Format](#lazy-logging-format)
    - [Try-Except-Pass Anti-Pattern](#try-except-pass-anti-pattern)
  - [Code Structure Issues](#code-structure-issues)
    - [Unnecessary Else Blocks](#unnecessary-else-blocks)
    - [Return Condition Directly](#return-condition-directly)
  - [Type Safety Issues](#type-safety-issues)
    - [Returning Any from Typed Function](#returning-any-from-typed-function)
    - [Missing Type Annotations](#missing-type-annotations)
  - [Best Practices Summary](#best-practices-summary)
    - [Exception Handling](#exception-handling)
    - [Type Annotations](#type-annotations)
    - [Code Quality](#code-quality)
    - [Performance](#performance)
  - [Tools and Configuration](#tools-and-configuration)
    - [Recommended Linter Configuration](#recommended-linter-configuration)
    - [Pre-commit Hooks](#pre-commit-hooks)
  - [Troubleshooting](#troubleshooting)
    - [Common Issues](#common-issues)
      - [Issue: Type Checker Still Complains After Fixes](#issue-type-checker-still-complains-after-fixes)
      - [Issue: Linter Configuration Conflicts](#issue-linter-configuration-conflicts)
      - [Issue: Performance Impact of Lazy Logging](#issue-performance-impact-of-lazy-logging)
  - [Conclusion](#conclusion)

## Individual Issue Guides

For detailed information about specific types of issues, see these focused guides:

- **[Exception Handling Issues](python-exception-handling-issues.md)** - Exception chaining, catching general exceptions, try-except-pass patterns
- **[Type Annotation Issues](python-type-annotation-issues.md)** - Deprecated type imports, modern union syntax, missing annotations
- **[Code Quality Issues](python-code-quality-issues.md)** - Magic numbers, unused variables, unnecessary else blocks
- **[Logging Issues](python-logging-issues.md)** - Lazy logging format, exception logging, performance considerations
- **[Code Structure Issues](python-code-structure-issues.md)** - Method complexity, early returns, single responsibility
- **[Type Safety Issues](python-type-safety-issues.md)** - Returning Any, type compatibility, generic types

## Quick Reference

### Common Error Messages and Solutions

| Error Message                                           | Category                | Quick Fix                     | Detailed Guide                                                   |
| ------------------------------------------------------- | ----------------------- | ----------------------------- | ---------------------------------------------------------------- | --- | ---------------------------------------------------------- |
| `typing.Dict is deprecated, use dict instead`           | Type Annotations        | Replace `Dict` with `dict`    | [Type Annotation Issues](python-type-annotation-issues.md)       |
| `Use lazy % formatting in logging functions`            | Logging                 | Use `%s` instead of f-strings | [Logging Issues](python-logging-issues.md)                       |
| `Catching too general exception Exception`              | Exception Handling      | Catch specific exceptions     | [Exception Handling Issues](python-exception-handling-issues.md) |
| `Magic value used in comparison`                        | Code Quality            | Use named constants           | [Code Quality Issues](python-code-quality-issues.md)             |
| `Consider moving this statement to an else block`       | Code Structure          | Remove unnecessary else       | [Code Structure Issues](python-code-structure-issues.md)         |
| `Returning Any from function declared to return "bool"` | Type Safety             | Use explicit type conversion  | [Type Safety Issues](python-type-safety-issues.md)               |
| `Need type annotation for "variable_name"`              | Type Annotations        | Add explicit type annotation  | [Type Annotation Issues](python-type-annotation-issues.md)       |
| `Use X                                                  | Y for type annotations` | Type Annotations              | Replace `Union[X, Y]` with `X                                    | Y`  | [Type Annotation Issues](python-type-annotation-issues.md) |

## Exception Handling Issues

### Exception Chaining with `raise ... from err`

**Error Message:**

```
Within an `except` clause, raise exceptions with `raise ... from err` or `raise ... from None` to distinguish them from errors in exception handling
```

**Problem:**
When re-raising exceptions in an `except` clause,
failing to preserve the original exception context can make debugging difficult.

**❌ Incorrect:**

```python
try:
    from argon2 import PasswordHasher
except ImportError:
    raise ImportError(
        "argon2-cffi is required for password hashing. "
        "Install with: pip install argon2-cffi"
    )
```

**✅ Correct:**

```python
try:
    from argon2 import PasswordHasher
except ImportError as exc:
    raise ImportError(
        "argon2-cffi is required for password hashing. "
        "Install with: pip install argon2-cffi"
    ) from exc
```

**Why This Matters:**

- Preserves the original exception traceback
- Provides context for debugging
- Follows Python best practices for exception chaining

### Catching Too General Exceptions

**Warning Message:**

```
Catching too general exception Exception
```

**Problem:**
Using `except Exception:` can mask unexpected errors and make debugging difficult.

**❌ Too Broad:**

```python
try:
    password_hasher.verify(hashed_password, password)
    return True
except Exception as e:
    logger.warning(f"Error verifying Argon2 hash: {e}")
    return False
```

**✅ More Specific:**

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

**When General Exception Handling is Acceptable:**

```python
# In cryptographic operations where any error should be treated as failure
try:
    result = cryptographic_operation()
    return result
except Exception as e:
    logger.warning("Cryptographic operation failed: %s", e)
    return None
```

## Type Annotation Issues

### Deprecated Type Imports

**Warning Message:**

```
`typing.Dict` is deprecated, use `dict` instead
`typing.Tuple` is deprecated, use `tuple` instead
```

**Problem:**
Python 3.9+ supports built-in generic types, making `typing.Dict` and `typing.Tuple` deprecated.

**❌ Deprecated:**

```python
from typing import Dict, Tuple, Any

def get_params() -> Dict[str, Any]:
    pass

def verify_password() -> Tuple[bool, str | None]:
    pass
```

**✅ Modern:**

```python
from typing import Any

def get_params() -> dict[str, Any]:
    pass

def verify_password() -> tuple[bool, str | None]:
    pass
```

**Migration Strategy:**

1. Remove `Dict` and `Tuple` from imports
2. Use `dict` and `tuple` directly in type annotations
3. Keep `Any` and other complex types from `typing`

### Undefined Type Variables

**Error Message:**

```
Undefined name 'Dict'
Undefined name 'Tuple'
```

**Problem:**
Using deprecated type imports without importing them.

**Solution:**

```python
# Remove from imports
from typing import Any  # Only import what you need

# Use built-in types
def process_data() -> dict[str, Any]:
    pass

def get_result() -> tuple[bool, str]:
    pass
```

## Code Quality Issues

### Magic Numbers

**Warning Message:**

```
Magic value used in comparison, consider replacing `5` with a constant variable
```

**Problem:**
Hard-coded numbers make code less maintainable and harder to understand.

**❌ Magic Numbers:**

```python
def parse_hash(hashed_password: str) -> bool:
    parts = hashed_password.split("$")
    if len(parts) < 5:  # Magic number
        return True

    param_parts = params_str.split(",")
    if len(param_parts) != 3:  # Magic number
        return True
```

**✅ Named Constants:**

```python
# Constants for hash parsing
ARGON2_HASH_MIN_PARTS = 5
ARGON2_PARAMS_COUNT = 3

def parse_hash(hashed_password: str) -> bool:
    parts = hashed_password.split("$")
    if len(parts) < ARGON2_HASH_MIN_PARTS:
        return True

    param_parts = params_str.split(",")
    if len(param_parts) != ARGON2_PARAMS_COUNT:
        return True
```

### Unused Variables

**Warning Message:**

```
Local variable 'variant' is assigned to but never used
```

**Problem:**
Variables are assigned but never referenced, indicating dead code.

**❌ Unused Variables:**

```python
def get_hash_variant(hashed_password: str) -> str | None:
    parts = hashed_password.split("$")
    if len(parts) >= 2:
        variant = parts[1]  # Assigned but never used
        version = parts[2]  # Assigned but never used
        return parts[1]
```

**✅ Clean Code:**

```python
def get_hash_variant(hashed_password: str) -> str | None:
    parts = hashed_password.split("$")
    if len(parts) >= ARGON2_MIN_PARTS:
        return parts[1]
```

## Logging Issues

### Lazy Logging Format

**Warning Message:**

```
Use lazy % formatting in logging functions
```

**Problem:**
F-strings in logging calls are evaluated even when the log level would prevent output.

**❌ Inefficient:**

```python
logger.info(f"Initialized Argon2 with {level} security (t={time}, m={memory})")
```

**✅ Lazy Formatting:**

```python
logger.info(
    "Initialized Argon2 with %s security (t=%d, m=%d, p=%d)",
    level, time, memory, parallelism
)
```

**Performance Impact:**

- F-strings are always evaluated
- Lazy formatting only evaluates when logging level allows output
- Significant performance improvement in production

### Try-Except-Pass Anti-Pattern

**Warning Message:**

```
`try`-`except`-`pass` detected, consider logging the exception
```

**Problem:**
Silently ignoring exceptions can hide important errors.

**❌ Silent Failure:**

```python
try:
    variant = parts[1]
except Exception:
    pass  # Silent failure
```

**✅ Proper Error Handling:**

```python
try:
    variant = parts[1]
except Exception as e:
    logger.debug("Error parsing hash variant: %s", e)
```

## Code Structure Issues

### Unnecessary Else Blocks

**Warning Message:**

```
Consider moving this statement to an `else` block
```

**Problem:**
Code after `return` statements in `if` blocks can be moved to `else` blocks for clarity.

**❌ Unnecessary Structure:**

```python
if self.is_argon2_hash(hashed_password):
    try:
        # ... verification logic
        return True
    except VerificationError:
        return False

# This else is unnecessary
else:
    logger.warning("Unknown hash format")
    return False
```

**✅ Cleaner Structure:**

```python
if self.is_argon2_hash(hashed_password):
    try:
        # ... verification logic
        return True
    except VerificationError:
        return False

# No else needed - code flows naturally
logger.warning("Unknown hash format")
return False
```

### Return Condition Directly

**Warning Message:**

```
Return the condition directly
```

**Problem:**
Unnecessary intermediate variables for boolean conditions.

**❌ Verbose:**

```python
def needs_update(self, hash_params: dict) -> bool:
    needs_update = (
        memory_cost != current_params["memory_cost"]
        or time_cost != current_params["time_cost"]
        or parallelism != current_params["parallelism"]
    )
    return needs_update
```

**✅ Direct:**

```python
def needs_update(self, hash_params: dict) -> bool:
    return (
        memory_cost != current_params["memory_cost"]
        or time_cost != current_params["time_cost"]
        or parallelism != current_params["parallelism"]
    )
```

## Type Safety Issues

### Returning Any from Typed Function

**Error Message:**

```
Returning Any from function declared to return "bool"
```

**Problem:**
Type checker can't guarantee the return type matches the annotation.

**❌ Type Mismatch:**

```python
def is_valid() -> bool:
    return some_comparison()  # Returns Any
```

**✅ Explicit Type:**

```python
def is_valid() -> bool:
    return bool(some_comparison())
```

### Missing Type Annotations

**Error Message:**

```
Need type annotation for "info"
```

**Problem:**
Variable type can't be inferred by the type checker.

**❌ Missing Annotation:**

```python
def get_hash_info(hashed_password: str) -> dict[str, Any]:
    info = {  # Type checker can't infer this
        "algorithm": self.get_hash_algorithm(hashed_password),
        "variant": None,
    }
    return info
```

**✅ Explicit Annotation:**

```python
def get_hash_info(hashed_password: str) -> dict[str, Any]:
    info: dict[str, Any] = {
        "algorithm": self.get_hash_algorithm(hashed_password),
        "variant": None,
    }
    return info
```

## Best Practices Summary

### Exception Handling

- Always use `raise ... from err` when re-raising exceptions
- Catch specific exceptions when possible
- Use general `Exception` only when appropriate (cryptographic operations)
- Log exceptions instead of using `pass`

### Type Annotations

- Use modern `dict` and `tuple` instead of `typing.Dict` and `typing.Tuple`
- Import only what you need from `typing`
- Add explicit type annotations for complex variables
- Use `bool()` wrapper for uncertain boolean returns

### Code Quality

- Replace magic numbers with named constants
- Remove unused variables
- Use lazy logging formatting
- Simplify control flow by removing unnecessary else blocks

### Performance

- Use lazy logging to avoid unnecessary string formatting
- Return conditions directly instead of intermediate variables
- Prefer specific exception handling over general catches

## Tools and Configuration

### Recommended Linter Configuration

```toml
# pyproject.toml
[tool.pylint.messages_control]
disable = [
    "too-few-public-methods",  # Allow for utility classes
    "missing-module-docstring",  # Not required for all modules
]

[tool.pylint.format]
max-line-length = 88

[tool.mypy]
python_version = "3.11"
warn_return_any = true
warn_unused_configs = true
disallow_untyped_defs = true
```

### Pre-commit Hooks

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.4.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-added-large-files

  - repo: https://github.com/pycqa/flake8
    rev: 6.0.0
    hooks:
      - id: flake8
        args: [--max-line-length=88, --extend-ignore=E203]

  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.5.1
    hooks:
      - id: mypy
        additional_dependencies: [types-requests]
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

#### Issue: Linter Configuration Conflicts

**Symptoms**: Different linters show conflicting warnings
**Causes**: Overlapping rules between Pylint, Flake8, and MyPy
**Solutions**:

```toml
# Disable conflicting rules
[tool.pylint.messages_control]
disable = ["line-too-long"]  # Let Black handle formatting

[tool.flake8]
extend-ignore = ["E203", "W503"]  # Black compatibility
```

#### Issue: Performance Impact of Lazy Logging

**Symptoms**: Logging performance issues in production
**Causes**: Still using f-strings in logging calls
**Solutions**:

```python
# Use lazy formatting consistently
logger.debug("Processing user %s with %d items", user_id, item_count)

# Avoid f-strings in logging
logger.debug(f"Processing user {user_id}")  # ❌ Always evaluated
```

## Conclusion

🦊 _Mastering Python linter warnings requires the cunning of a fox - understanding the underlying principles and
applying the right solution at the right time._

Addressing linter warnings and errors systematically improves code quality, maintainability, and
performance. The key principles are:

- **Exception Safety**: Preserve exception context and handle errors appropriately
- **Type Safety**: Use modern type annotations and explicit typing
- **Code Clarity**: Remove magic numbers, unused variables, and unnecessary complexity
- **Performance**: Use lazy logging and efficient patterns
- **Consistency**: Apply fixes systematically across the codebase

By following these guidelines and using the provided examples,
you can create Python code that not only passes linter checks but
also follows modern best practices for maintainable, performant applications.

_Build code that outfoxes complexity and maintains clarity._ 🦊

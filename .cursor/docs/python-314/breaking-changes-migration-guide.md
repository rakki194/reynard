# Breaking Changes and Migration Guide - Python 3.14

_Comprehensive guide to breaking changes and migration strategies for Python 3.14_

## Overview

Python 3.14 introduces several breaking changes that require attention when upgrading from previous versions. This guide provides detailed information about these changes, their impact, and step-by-step migration strategies to ensure a smooth transition.

## Major Breaking Changes

### 1. PEP 765: Finally Block Control Flow Restrictions

**What Changed:**

- `return`, `break`, `continue`, and `yield` statements are now prohibited in `finally` blocks
- This prevents exception masking and confusing control flow

**Impact:**

- Code using these statements in `finally` blocks will raise `SyntaxError`
- This affects exception handling patterns and cleanup code

**Migration Strategy:**

```python
# Before Python 3.14 (PROBLEMATIC)
def old_pattern():
    try:
        return "success"
    finally:
        return "cleanup"  # This masks the original return

# After Python 3.14 (CORRECT)
def new_pattern():
    result = None
    try:
        result = "success"
    finally:
        cleanup_resources()

    return result if result is not None else "cleanup"

# Migration steps:
# 1. Identify finally blocks with control flow statements
# 2. Move control flow outside finally blocks
# 3. Use flags or variables to track state
# 4. Test thoroughly to ensure same behavior
```

**Automated Migration:**

```python
# Script to identify problematic finally blocks
import ast
import sys

def find_problematic_finally_blocks(filename):
    """Find finally blocks with control flow statements"""

    with open(filename, 'r') as f:
        source = f.read()

    tree = ast.parse(source)

    class FinallyVisitor(ast.NodeVisitor):
        def __init__(self):
            self.problems = []

        def visit_Try(self, node):
            if node.finalbody:
                for stmt in node.finalbody:
                    if isinstance(stmt, (ast.Return, ast.Break, ast.Continue, ast.Yield)):
                        self.problems.append({
                            'line': stmt.lineno,
                            'type': type(stmt).__name__,
                            'statement': ast.unparse(stmt)
                        })

            self.generic_visit(node)

    visitor = FinallyVisitor()
    visitor.visit(tree)

    return visitor.problems

# Usage
problems = find_problematic_finally_blocks('your_file.py')
for problem in problems:
    print(f"Line {problem['line']}: {problem['type']} in finally block")
```

### 2. PEP 758: Exception Handling Syntax Changes

**What Changed:**

- Parentheses can now be omitted in `except` and `except*` clauses when there are multiple exception types and no `as` clause
- This is a syntax enhancement, not a breaking change, but affects code style

**Impact:**

- Existing code continues to work unchanged
- New syntax is available for better readability
- Code style guidelines may need updates

**Migration Strategy:**

```python
# Before Python 3.14 (STILL WORKS)
try:
    risky_operation()
except (ValueError, TypeError):
    handle_error()

# Python 3.14 (NEW SYNTAX AVAILABLE)
try:
    risky_operation()
except ValueError, TypeError:
    handle_error()

# Migration steps:
# 1. No immediate migration required
# 2. Gradually adopt new syntax for better readability
# 3. Update team coding standards
# 4. Use linters to enforce consistent style
```

### 3. Enhanced Security in Debugging Interfaces

**What Changed:**

- `sys._getframe()` and direct frame manipulation are discouraged
- New secure debugging interface replaces unsafe debugging patterns
- Remote debugging requires authentication by default

**Impact:**

- Code using `sys._getframe()` may need updates
- Debugging tools need to use new secure interfaces
- Remote debugging setup requires security configuration

**Migration Strategy:**

```python
# Before Python 3.14 (UNSAFE)
import sys

def old_debugging():
    frame = sys._getframe()
    locals = frame.f_locals
    globals = frame.f_globals
    # Direct frame manipulation

# After Python 3.14 (SECURE)
import debugger

def new_debugging():
    with debugger.session() as session:
        locals = session.get_local_variables()
        globals = session.get_global_variables()
        # Safe debugging interface

# Migration steps:
# 1. Identify code using sys._getframe()
# 2. Replace with new debugging interface
# 3. Update debugging tools and scripts
# 4. Configure security for remote debugging
```

### 4. JIT Compiler Behavior Changes

**What Changed:**

- JIT compilation is enabled by default
- Some code patterns may behave differently due to optimization
- Performance characteristics may change

**Impact:**

- Code that relies on specific timing may break
- Performance benchmarks may show different results
- Some edge cases in optimization may cause issues

**Migration Strategy:**

```python
# Before Python 3.14 (NO JIT)
def old_function():
    # Code that may be optimized differently
    result = 0
    for i in range(1000):
        result += i
    return result

# After Python 3.14 (WITH JIT)
def new_function():
    # Same code, but may be optimized
    result = 0
    for i in range(1000):
        result += i
    return result

# Migration steps:
# 1. Test code thoroughly with JIT enabled
# 2. Disable JIT if needed: PYTHONJIT=0
# 3. Update performance benchmarks
# 4. Review timing-dependent code
```

## Minor Breaking Changes

### 1. String and Unicode Handling

**What Changed:**

- Improved string handling may affect edge cases
- Unicode normalization changes in some scenarios

**Impact:**

- String comparisons may behave differently
- Unicode handling edge cases may change

**Migration Strategy:**

```python
# Test string handling thoroughly
def test_string_handling():
    # Test edge cases
    test_cases = [
        "normal string",
        "string with unicode: café",
        "string with emoji: 🐍",
        "empty string: ''",
        "string with null: 'hello\x00world'"
    ]

    for test_case in test_cases:
        # Test your string handling logic
        result = your_string_function(test_case)
        assert result is not None
```

### 2. Import System Changes

**What Changed:**

- Import system optimizations may affect import order
- Some import edge cases may behave differently

**Impact:**

- Code relying on specific import order may break
- Import timing may change

**Migration Strategy:**

```python
# Before Python 3.14 (IMPORT ORDER DEPENDENT)
import module_a
import module_b
# Code that depends on import order

# After Python 3.14 (EXPLICIT IMPORTS)
import module_a
import module_b
# Make imports explicit and order-independent

# Migration steps:
# 1. Review import dependencies
# 2. Make imports explicit
# 3. Test import behavior
# 4. Use import hooks if needed
```

### 3. Exception Handling Changes

**What Changed:**

- Exception handling optimizations may affect exception propagation
- Some exception edge cases may behave differently

**Impact:**

- Exception handling code may need updates
- Exception propagation timing may change

**Migration Strategy:**

```python
# Test exception handling thoroughly
def test_exception_handling():
    try:
        # Test various exception scenarios
        raise ValueError("test error")
    except ValueError as e:
        # Verify exception handling works correctly
        assert str(e) == "test error"
    except Exception as e:
        # Handle unexpected exceptions
        print(f"Unexpected exception: {e}")
```

## Migration Checklist

### Pre-Migration Preparation

```python
# 1. Create migration checklist
migration_checklist = [
    "Backup current codebase",
    "Create Python 3.14 test environment",
    "Run existing test suite",
    "Identify breaking changes in codebase",
    "Plan migration strategy",
    "Create rollback plan"
]

# 2. Test environment setup
def setup_test_environment():
    """Set up Python 3.14 test environment"""

    # Create virtual environment
    import subprocess
    subprocess.run(["python3.14", "-m", "venv", "test_env"])

    # Install dependencies
    subprocess.run(["test_env/bin/pip", "install", "-r", "requirements.txt"])

    # Run tests
    subprocess.run(["test_env/bin/python", "-m", "pytest"])

# 3. Code analysis
def analyze_codebase():
    """Analyze codebase for breaking changes"""

    import os
    import ast

    problems = []

    for root, dirs, files in os.walk("."):
        for file in files:
            if file.endswith(".py"):
                filepath = os.path.join(root, file)

                # Check for problematic patterns
                try:
                    with open(filepath, 'r') as f:
                        source = f.read()

                    tree = ast.parse(source)

                    # Check for finally blocks with control flow
                    finally_problems = find_problematic_finally_blocks(filepath)
                    if finally_problems:
                        problems.extend(finally_problems)

                    # Check for sys._getframe usage
                    if "sys._getframe" in source:
                        problems.append({
                            'file': filepath,
                            'type': 'sys._getframe',
                            'line': source.find("sys._getframe")
                        })

                except Exception as e:
                    print(f"Error analyzing {filepath}: {e}")

    return problems
```

### Migration Execution

```python
# 1. Gradual migration strategy
def gradual_migration():
    """Execute gradual migration"""

    # Phase 1: Fix critical breaking changes
    fix_critical_breaking_changes()

    # Phase 2: Update exception handling
    update_exception_handling()

    # Phase 3: Update debugging code
    update_debugging_code()

    # Phase 4: Test and validate
    test_and_validate()

# 2. Automated migration tools
def automated_migration():
    """Use automated migration tools"""

    # Use 2to3 for Python 2 to 3 migration
    import subprocess
    subprocess.run(["2to3", "-w", "your_code.py"])

    # Use custom migration scripts
    run_custom_migration_scripts()

    # Use linters and formatters
    subprocess.run(["black", "your_code.py"])
    subprocess.run(["flake8", "your_code.py"])

# 3. Manual migration steps
def manual_migration():
    """Execute manual migration steps"""

    # 1. Fix finally blocks
    fix_finally_blocks()

    # 2. Update debugging code
    update_debugging_code()

    # 3. Test thoroughly
    run_comprehensive_tests()

    # 4. Update documentation
    update_documentation()
```

### Post-Migration Validation

```python
# 1. Comprehensive testing
def post_migration_testing():
    """Comprehensive testing after migration"""

    # Run unit tests
    run_unit_tests()

    # Run integration tests
    run_integration_tests()

    # Run performance tests
    run_performance_tests()

    # Run security tests
    run_security_tests()

# 2. Performance validation
def validate_performance():
    """Validate performance after migration"""

    # Benchmark critical functions
    benchmark_critical_functions()

    # Compare with previous version
    compare_performance()

    # Optimize if needed
    optimize_performance()

# 3. Security validation
def validate_security():
    """Validate security after migration"""

    # Check for security vulnerabilities
    check_security_vulnerabilities()

    # Validate debugging security
    validate_debugging_security()

    # Test authentication
    test_authentication()
```

## Common Migration Issues and Solutions

### Issue 1: Finally Block Control Flow

**Problem:**

```python
def problematic_function():
    try:
        return "success"
    finally:
        return "cleanup"  # SyntaxError in Python 3.14
```

**Solution:**

```python
def fixed_function():
    result = None
    try:
        result = "success"
    finally:
        cleanup_resources()

    return result if result is not None else "cleanup"
```

### Issue 2: Debugging Code Updates

**Problem:**

```python
import sys

def old_debugging():
    frame = sys._getframe()
    # Direct frame manipulation
```

**Solution:**

```python
import debugger

def new_debugging():
    with debugger.session() as session:
        # Safe debugging interface
        variables = session.get_local_variables()
```

### Issue 3: Performance Regression

**Problem:**

```python
def performance_sensitive_function():
    # Code that may be affected by JIT compilation
    start_time = time.time()
    # ... work ...
    end_time = time.time()
    # Timing may be different
```

**Solution:**

```python
def performance_sensitive_function():
    # Test with JIT enabled and disabled
    # Adjust timing expectations if needed
    start_time = time.time()
    # ... work ...
    end_time = time.time()
    # Validate timing is acceptable
```

## Testing Strategies

### Unit Testing

```python
import unittest
import asyncio

class TestPython314Migration(unittest.TestCase):
    """Test suite for Python 3.14 migration"""

    def test_finally_block_restrictions(self):
        """Test that finally block restrictions work correctly"""

        # Test that return in finally raises SyntaxError
        with self.assertRaises(SyntaxError):
            exec("""
def test_function():
    try:
        pass
    finally:
        return "test"
            """)

    def test_exception_handling_syntax(self):
        """Test new exception handling syntax"""

        # Test new syntax works
        try:
            raise ValueError("test")
        except ValueError, TypeError:
            pass  # This should work

        # Test old syntax still works
        try:
            raise ValueError("test")
        except (ValueError, TypeError):
            pass  # This should still work

    def test_debugging_interface(self):
        """Test new debugging interface"""

        # Test that new debugging interface works
        with debugger.session() as session:
            # Test basic functionality
            variables = session.get_local_variables()
            self.assertIsInstance(variables, dict)

    def test_jit_compilation(self):
        """Test JIT compilation behavior"""

        # Test that JIT compilation works
        def test_function():
            result = 0
            for i in range(1000):
                result += i
            return result

        # Run function multiple times to trigger JIT
        for _ in range(100):
            result = test_function()

        # Verify function still works correctly
        self.assertEqual(result, 499500)

    def test_performance_improvements(self):
        """Test performance improvements"""

        # Test that performance is acceptable
        import time

        def benchmark_function():
            result = 0
            for i in range(100000):
                result += i
            return result

        start_time = time.time()
        result = benchmark_function()
        end_time = time.time()

        execution_time = end_time - start_time

        # Verify performance is acceptable (adjust threshold as needed)
        self.assertLess(execution_time, 1.0)  # Should complete in less than 1 second
        self.assertEqual(result, 4999950000)

if __name__ == "__main__":
    unittest.main()
```

### Integration Testing

```python
import asyncio
import unittest

class TestIntegrationMigration(unittest.TestCase):
    """Integration tests for Python 3.14 migration"""

    async def test_async_code_migration(self):
        """Test async code migration"""

        # Test that async code works correctly
        async def async_function():
            await asyncio.sleep(0.1)
            return "async result"

        result = await async_function()
        self.assertEqual(result, "async result")

    def test_import_system_migration(self):
        """Test import system migration"""

        # Test that imports work correctly
        try:
            import sys
            import os
            import asyncio
            # Test that all imports work
            self.assertTrue(True)
        except ImportError as e:
            self.fail(f"Import failed: {e}")

    def test_exception_handling_migration(self):
        """Test exception handling migration"""

        # Test that exception handling works correctly
        try:
            raise ValueError("test error")
        except ValueError as e:
            self.assertEqual(str(e), "test error")
        except Exception as e:
            self.fail(f"Unexpected exception: {e}")

    def test_debugging_migration(self):
        """Test debugging migration"""

        # Test that debugging works correctly
        try:
            with debugger.session() as session:
                # Test basic debugging functionality
                variables = session.get_local_variables()
                self.assertIsInstance(variables, dict)
        except Exception as e:
            self.fail(f"Debugging failed: {e}")

# Run integration tests
if __name__ == "__main__":
    unittest.main()
```

## Rollback Strategy

### Rollback Plan

```python
def rollback_plan():
    """Rollback plan for Python 3.14 migration"""

    rollback_steps = [
        "1. Stop application",
        "2. Restore Python 3.13 environment",
        "3. Restore codebase from backup",
        "4. Restore dependencies",
        "5. Run tests to verify rollback",
        "6. Restart application",
        "7. Monitor for issues"
    ]

    for step in rollback_steps:
        print(step)

# Rollback script
def execute_rollback():
    """Execute rollback procedure"""

    import subprocess
    import shutil

    # Stop application
    subprocess.run(["systemctl", "stop", "your_app"])

    # Restore Python environment
    subprocess.run(["rm", "-rf", "venv"])
    subprocess.run(["python3.13", "-m", "venv", "venv"])

    # Restore codebase
    shutil.rmtree("src")
    shutil.copytree("backup/src", "src")

    # Restore dependencies
    subprocess.run(["venv/bin/pip", "install", "-r", "requirements.txt"])

    # Run tests
    subprocess.run(["venv/bin/python", "-m", "pytest"])

    # Restart application
    subprocess.run(["systemctl", "start", "your_app"])

    print("Rollback completed")
```

## Summary

Python 3.14's breaking changes require careful planning and execution:

### Key Breaking Changes

- **Finally block restrictions** prevent exception masking
- **Enhanced security** in debugging interfaces
- **JIT compiler** changes performance characteristics
- **Exception handling** syntax improvements

### Migration Strategy

- **Gradual migration** with thorough testing
- **Automated tools** for common patterns
- **Manual review** for complex cases
- **Comprehensive testing** at each step

### Best Practices

- **Backup everything** before starting migration
- **Test thoroughly** in isolated environment
- **Plan rollback** strategy in case of issues
- **Monitor performance** after migration
- **Update documentation** and team knowledge

The migration to Python 3.14 provides significant benefits in performance, security, and developer experience, but requires careful attention to breaking changes and thorough testing to ensure a smooth transition.

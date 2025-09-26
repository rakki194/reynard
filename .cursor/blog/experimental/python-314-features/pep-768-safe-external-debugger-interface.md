# PEP 768: Safe External Debugger Interface

_Comprehensive guide to the new secure debugging interface in Python 3.14_

## Overview

PEP 768 introduces a secure, standardized interface for external debuggers to interact with Python processes. This enhancement addresses security concerns with the existing debugging interfaces while providing a robust foundation for debugging tools, IDEs, and development environments.

## What Changed

### Before Python 3.14

```python
# Unsafe debugging approaches
import pdb
import sys

# Direct access to internal debugging mechanisms
def unsafe_debugging():
    # Could potentially expose sensitive information
    pdb.set_trace()  # Blocks execution, security risk

    # Direct access to frame objects
    frame = sys._getframe()
    # Manipulation of frame internals was possible
```

### Python 3.14 and Later

```python
# Safe debugging interface
import debugger

def safe_debugging():
    # Secure debugging interface
    debugger.attach()  # Safe attachment with proper isolation

    # Controlled access to debugging information
    with debugger.session() as session:
        session.set_breakpoint("module.function", line=42)
        session.inspect_variables()
        session.evaluate_expression("x + y")
```

## Security Improvements

### Sandboxed Debugging Environment

```python
import debugger
from debugger.security import SecurityPolicy

# Create a secure debugging session
def secure_debugging_session():
    # Define security policy
    policy = SecurityPolicy(
        allow_file_access=False,      # No file system access
        allow_network_access=False,   # No network access
        allow_system_calls=False,    # No system calls
        max_execution_time=30,       # 30 second timeout
        memory_limit=100 * 1024 * 1024  # 100MB memory limit
    )

    with debugger.session(security_policy=policy) as session:
        # All debugging operations are sandboxed
        session.set_breakpoint("my_module.process_data")
        session.run_until_breakpoint()

        # Safe variable inspection
        variables = session.get_local_variables()
        for name, value in variables.items():
            print(f"{name}: {value}")
```

### Controlled Information Access

```python
import debugger

def controlled_debugging():
    with debugger.session() as session:
        # Only expose safe information
        stack_trace = session.get_stack_trace()

        # Filtered variable access
        safe_variables = session.get_safe_variables()
        # Sensitive variables (passwords, tokens) are automatically filtered

        # Expression evaluation with restrictions
        result = session.evaluate_safe("len(data)", timeout=5)
        print(f"Data length: {result}")
```

## New Debugging API

### Basic Debugging Operations

```python
import debugger

def basic_debugging_operations():
    # Create a debugging session
    with debugger.session() as session:
        # Set breakpoints
        session.set_breakpoint("my_module.function_name")
        session.set_breakpoint("my_module.Class.method", line=25)
        session.set_breakpoint("my_module", line=100)

        # Conditional breakpoints
        session.set_breakpoint(
            "my_module.process_item",
            condition="item.id > 1000"
        )

        # Run until breakpoint
        session.run_until_breakpoint()

        # Step through code
        session.step_over()
        session.step_into()
        session.step_out()

        # Continue execution
        session.continue_execution()
```

### Variable Inspection

```python
import debugger

def variable_inspection():
    with debugger.session() as session:
        session.set_breakpoint("my_module.calculate_total")
        session.run_until_breakpoint()

        # Get all local variables
        locals = session.get_local_variables()
        print("Local variables:", locals)

        # Get specific variable
        total = session.get_variable("total")
        print(f"Total: {total}")

        # Get variable with type information
        items = session.get_variable_with_type("items")
        print(f"Items: {items.value} (type: {items.type})")

        # Get nested variable
        user_name = session.get_variable("user.name")
        print(f"User name: {user_name}")

        # Set variable value
        session.set_variable("total", 0)
        print("Reset total to 0")
```

### Expression Evaluation

```python
import debugger

def expression_evaluation():
    with debugger.session() as session:
        session.set_breakpoint("my_module.process_data")
        session.run_until_breakpoint()

        # Evaluate simple expressions
        result = session.evaluate("x + y")
        print(f"x + y = {result}")

        # Evaluate with timeout
        result = session.evaluate("complex_calculation()", timeout=10)
        print(f"Complex calculation result: {result}")

        # Evaluate with custom context
        context = {"multiplier": 2}
        result = session.evaluate("value * multiplier", context=context)
        print(f"Doubled value: {result}")

        # Safe evaluation (no side effects)
        result = session.evaluate_safe("len(data)")
        print(f"Data length: {result}")
```

## Advanced Debugging Features

### Call Stack Navigation

```python
import debugger

def call_stack_navigation():
    with debugger.session() as session:
        session.set_breakpoint("deep_function")
        session.run_until_breakpoint()

        # Get call stack
        stack = session.get_call_stack()
        print(f"Call stack depth: {len(stack)}")

        # Navigate through stack frames
        for i, frame in enumerate(stack):
            print(f"Frame {i}: {frame.function_name} at {frame.filename}:{frame.line}")
            print(f"  Local variables: {list(frame.local_variables.keys())}")

        # Switch to different frame
        session.switch_to_frame(1)  # Go up one level
        parent_locals = session.get_local_variables()
        print(f"Parent frame variables: {parent_locals}")

        # Return to current frame
        session.switch_to_frame(0)
```

### Watch Expressions

```python
import debugger

def watch_expressions():
    with debugger.session() as session:
        # Set up watch expressions
        session.add_watch("total")
        session.add_watch("len(items)")
        session.add_watch("user.is_active")

        # Set breakpoint
        session.set_breakpoint("my_module.loop")
        session.run_until_breakpoint()

        # Check watch values
        watch_values = session.get_watch_values()
        for expression, value in watch_values.items():
            print(f"{expression} = {value}")

        # Continue and check again
        session.continue_execution()
        session.run_until_breakpoint()

        watch_values = session.get_watch_values()
        for expression, value in watch_values.items():
            print(f"{expression} = {value}")
```

### Exception Handling

```python
import debugger

def exception_handling():
    with debugger.session() as session:
        # Set exception breakpoints
        session.set_exception_breakpoint("ValueError")
        session.set_exception_breakpoint("Exception", on_raise=True)

        # Run until exception
        try:
            session.run_until_exception()
        except debugger.ExceptionCaught as e:
            print(f"Exception caught: {e.exception_type}: {e.exception_value}")
            print(f"At: {e.filename}:{e.line}")

            # Inspect variables at exception point
            locals = session.get_local_variables()
            print(f"Variables at exception: {locals}")

            # Continue execution
            session.continue_execution()
```

## Integration with Development Tools

### IDE Integration

```python
import debugger
import json

def ide_integration():
    """Example of how IDEs can integrate with the new debugging interface"""

    # IDE can create a debugging session
    with debugger.session() as session:
        # Set breakpoints from IDE
        breakpoints = [
            {"file": "main.py", "line": 42},
            {"file": "utils.py", "line": 15, "condition": "x > 0"}
        ]

        for bp in breakpoints:
            session.set_breakpoint(
                f"{bp['file']}:{bp['line']}",
                condition=bp.get("condition")
            )

        # Run and collect debugging information
        session.run_until_breakpoint()

        # Send debugging state to IDE
        debug_state = {
            "current_file": session.get_current_file(),
            "current_line": session.get_current_line(),
            "variables": session.get_local_variables(),
            "call_stack": session.get_call_stack()
        }

        # Send to IDE (this would be handled by the IDE's debugger integration)
        send_to_ide(debug_state)

def send_to_ide(state):
    """Send debugging state to IDE (implementation depends on IDE)"""
    print("Sending debug state to IDE:", json.dumps(state, indent=2))
```

### Testing Integration

```python
import debugger
import unittest

class TestDebuggingIntegration(unittest.TestCase):
    def test_debugging_session(self):
        """Test that debugging sessions work correctly"""

        with debugger.session() as session:
            # Set breakpoint in test code
            session.set_breakpoint("test_module.function_to_test")

            # Run test code
            session.run_until_breakpoint()

            # Verify state
            variables = session.get_local_variables()
            self.assertIn("test_data", variables)
            self.assertEqual(variables["test_data"], "expected_value")

            # Continue execution
            session.continue_execution()

            # Verify final state
            result = session.evaluate("get_result()")
            self.assertEqual(result, "expected_result")
```

## Security Best Practices

### Debugging in Production

```python
import debugger
import os

def production_debugging():
    """Safe debugging in production environments"""

    # Only enable debugging if explicitly requested
    if not os.getenv("ENABLE_DEBUGGING"):
        return

    # Use strict security policy
    policy = debugger.SecurityPolicy(
        allow_file_access=False,
        allow_network_access=False,
        allow_system_calls=False,
        max_execution_time=5,  # Very short timeout
        memory_limit=10 * 1024 * 1024,  # 10MB limit
        log_all_operations=True  # Log all debugging operations
    )

    with debugger.session(security_policy=policy) as session:
        # Only allow specific breakpoints
        allowed_breakpoints = [
            "error_handler.log_error",
            "monitoring.collect_metrics"
        ]

        for bp in allowed_breakpoints:
            session.set_breakpoint(bp)

        # Run with monitoring
        session.run_until_breakpoint()

        # Log debugging session
        session.log_session_info()
```

### Sensitive Data Protection

```python
import debugger

def sensitive_data_protection():
    """Protect sensitive data during debugging"""

    # Define sensitive variable patterns
    sensitive_patterns = [
        "password", "token", "secret", "key", "credential"
    ]

    with debugger.session() as session:
        # Set up sensitive data filtering
        session.set_sensitive_patterns(sensitive_patterns)

        session.set_breakpoint("auth.authenticate_user")
        session.run_until_breakpoint()

        # Sensitive variables will be masked
        variables = session.get_local_variables()
        for name, value in variables.items():
            if any(pattern in name.lower() for pattern in sensitive_patterns):
                print(f"{name}: [REDACTED]")
            else:
                print(f"{name}: {value}")
```

## Performance Considerations

### Minimal Overhead

```python
import debugger
import time

def performance_testing():
    """Test debugging performance impact"""

    # Test without debugging
    start_time = time.time()
    for i in range(1000):
        result = i * 2
    no_debug_time = time.time() - start_time

    # Test with debugging (but no breakpoints)
    with debugger.session() as session:
        start_time = time.time()
        for i in range(1000):
            result = i * 2
        debug_time = time.time() - start_time

    print(f"No debugging: {no_debug_time:.4f}s")
    print(f"With debugging: {debug_time:.4f}s")
    print(f"Overhead: {((debug_time - no_debug_time) / no_debug_time) * 100:.2f}%")
```

### Efficient Breakpoint Management

```python
import debugger

def efficient_breakpoint_management():
    """Manage breakpoints efficiently"""

    with debugger.session() as session:
        # Batch set breakpoints
        breakpoints = [
            "module1.function1",
            "module1.function2",
            "module2.function1",
            "module2.function2"
        ]

        # Set all breakpoints at once
        session.set_breakpoints(breakpoints)

        # Disable breakpoints when not needed
        session.disable_breakpoint("module1.function1")

        # Re-enable when needed
        session.enable_breakpoint("module1.function1")

        # Remove breakpoints when done
        session.remove_breakpoint("module2.function1")

        # Clear all breakpoints
        session.clear_all_breakpoints()
```

## Migration from Old Debugging

### From pdb to New Interface

```python
# Old pdb usage
import pdb

def old_debugging():
    x = 10
    y = 20
    pdb.set_trace()  # Old way
    result = x + y
    return result

# New debugging interface
import debugger

def new_debugging():
    with debugger.session() as session:
        x = 10
        y = 20
        session.set_breakpoint("new_debugging", line=4)
        session.run_until_breakpoint()
        result = x + y
        return result
```

### From sys.\_getframe to New Interface

```python
# Old frame access
import sys

def old_frame_access():
    frame = sys._getframe()
    locals = frame.f_locals
    globals = frame.f_globals
    # Direct manipulation of frame objects

# New safe interface
import debugger

def new_frame_access():
    with debugger.session() as session:
        # Safe access to frame information
        current_frame = session.get_current_frame()
        locals = session.get_local_variables()
        globals = session.get_global_variables()
        # No direct frame manipulation
```

## Testing the New Interface

```python
import debugger
import unittest

class TestDebuggerInterface(unittest.TestCase):
    def test_basic_debugging(self):
        """Test basic debugging functionality"""

        with debugger.session() as session:
            # Test breakpoint setting
            session.set_breakpoint("test_function")

            # Test variable inspection
            session.set_breakpoint("test_function", line=5)
            session.run_until_breakpoint()

            variables = session.get_local_variables()
            self.assertIsInstance(variables, dict)

            # Test expression evaluation
            result = session.evaluate("2 + 2")
            self.assertEqual(result, 4)

    def test_security_policy(self):
        """Test security policy enforcement"""

        policy = debugger.SecurityPolicy(
            allow_file_access=False,
            max_execution_time=1
        )

        with debugger.session(security_policy=policy) as session:
            # This should be blocked by security policy
            with self.assertRaises(debugger.SecurityViolation):
                session.evaluate("open('/etc/passwd').read()")

    def test_exception_handling(self):
        """Test exception debugging"""

        with debugger.session() as session:
            session.set_exception_breakpoint("ValueError")

            # This should trigger the exception breakpoint
            with self.assertRaises(debugger.ExceptionCaught):
                session.evaluate("raise ValueError('test')")

if __name__ == "__main__":
    unittest.main()
```

## Summary

PEP 768 provides a secure, standardized debugging interface that:

- **Enhances security** through sandboxed debugging environments
- **Prevents information leakage** with controlled variable access
- **Provides consistent API** for debugging tools and IDEs
- **Maintains performance** with minimal overhead
- **Enables advanced features** like watch expressions and exception handling
- **Supports production debugging** with appropriate security policies

The new interface makes Python debugging more secure, reliable, and feature-rich while maintaining backward compatibility through gradual migration paths. It's particularly valuable for:

- **IDE integration** with consistent debugging APIs
- **Production debugging** with security controls
- **Testing frameworks** with debugging capabilities
- **Development tools** that need programmatic debugging access

This enhancement represents a significant improvement in Python's debugging infrastructure, making it safer and more powerful for modern development workflows.

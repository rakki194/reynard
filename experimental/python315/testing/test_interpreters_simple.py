#!/usr/bin/env python3.15
"""Simple PEP 734: Multiple Interpreters Test
Using the correct API for Python 3.15.0a0
"""

import time
from concurrent import interpreters


def test_basic_interpreter():
    """Test basic interpreter functionality"""
    print("=" * 60)
    print("🔄 PEP 734: MULTIPLE INTERPRETERS (SIMPLE)")
    print("=" * 60)

    # Create interpreter
    interp = interpreters.create()
    print(f"✅ Created interpreter with ID: {interp.id}")

    # Define a simple function
    def simple_function(x):
        return x * 2

    # Call function in interpreter
    result = interp.call(simple_function, 21)
    print(f"✅ Function result: {result}")

    # Test with multiple arguments
    def add_function(a, b):
        return a + b

    result = interp.call(add_function, 10, 32)
    print(f"✅ Add result: {result}")

    # Clean up
    interp.close()
    print("✅ Interpreter closed")
    print()


def test_parallel_execution():
    """Test parallel execution"""
    print("🚀 TESTING PARALLEL EXECUTION")
    print("-" * 40)

    def cpu_task(n):
        """CPU-intensive task"""
        result = 0
        for i in range(n):
            result += i
        return result

    # Create interpreters
    interp1 = interpreters.create()
    interp2 = interpreters.create()

    # Run tasks in parallel
    start_time = time.time()

    future1 = interp1.call_in_thread(cpu_task, 1000000)
    future2 = interp2.call_in_thread(cpu_task, 1000000)

    result1 = future1.result()
    result2 = future2.result()

    end_time = time.time()

    print(f"✅ Task 1 result: {result1}")
    print(f"✅ Task 2 result: {result2}")
    print(f"✅ Parallel time: {end_time - start_time:.4f}s")

    # Clean up
    interp1.close()
    interp2.close()
    print()


def test_interpreter_isolation():
    """Test interpreter isolation"""
    print("🔒 TESTING INTERPRETER ISOLATION")
    print("-" * 40)

    # Create interpreters
    interp1 = interpreters.create()
    interp2 = interpreters.create()

    # Define functions that use global state
    def set_global():
        global test_var
        test_var = 42
        return test_var

    def get_global():
        global test_var
        return test_var

    # Set variable in first interpreter
    result1 = interp1.call(set_global)
    print(f"✅ Interpreter 1 set global: {result1}")

    # Try to get it in second interpreter
    try:
        result2 = interp2.call(get_global)
        print(f"❌ Unexpected: Interpreter 2 got: {result2}")
    except Exception as e:
        print(f"✅ Expected error in interpreter 2: {e}")

    # Verify first interpreter still has it
    result1_check = interp1.call(get_global)
    print(f"✅ Interpreter 1 still has: {result1_check}")

    # Clean up
    interp1.close()
    interp2.close()
    print()


def test_error_handling():
    """Test error handling"""
    print("🚨 TESTING ERROR HANDLING")
    print("-" * 40)

    interp = interpreters.create()

    def error_function():
        raise ValueError("Test error")

    try:
        result = interp.call(error_function)
        print(f"❌ Unexpected success: {result}")
    except Exception as e:
        print(f"✅ Caught expected error: {e}")

    # Interpreter should still work
    def working_function():
        return "Still working"

    result = interp.call(working_function)
    print(f"✅ Interpreter still works: {result}")

    # Clean up
    interp.close()
    print()


def test_performance():
    """Test performance comparison"""
    print("⚡ PERFORMANCE TEST")
    print("-" * 40)

    def cpu_task(n):
        result = 0
        for i in range(n):
            result += i * i
        return result

    task_size = 1000000

    # Single-threaded
    start_time = time.time()
    result1 = cpu_task(task_size)
    single_time = time.time() - start_time
    print(f"Single-threaded: {single_time:.4f}s")

    # Multi-interpreter
    start_time = time.time()
    interp1 = interpreters.create()
    interp2 = interpreters.create()

    future1 = interp1.call_in_thread(cpu_task, task_size)
    future2 = interp2.call_in_thread(cpu_task, task_size)

    result2 = future1.result()
    result3 = future2.result()

    multi_time = time.time() - start_time
    print(f"Multi-interpreter: {multi_time:.4f}s")

    speedup = single_time / multi_time
    print(f"Speedup: {speedup:.2f}x")

    # Clean up
    interp1.close()
    interp2.close()
    print()


if __name__ == "__main__":
    test_basic_interpreter()
    test_parallel_execution()
    test_interpreter_isolation()
    test_error_handling()
    test_performance()

    print("🎉 PEP 734 tests completed!")

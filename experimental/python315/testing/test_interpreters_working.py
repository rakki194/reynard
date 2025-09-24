#!/usr/bin/env python3.15
"""Working PEP 734: Multiple Interpreters Test
Using the correct API for Python 3.15.0a0
"""

import time
from concurrent import interpreters


def test_basic_interpreter():
    """Test basic interpreter functionality"""
    print("=" * 60)
    print("🔄 PEP 734: MULTIPLE INTERPRETERS (WORKING)")
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
    """Test parallel execution using threading"""
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

    # Run tasks in parallel using call_in_thread
    start_time = time.time()

    # call_in_thread returns a Thread object, not a future
    thread1 = interp1.call_in_thread(cpu_task, 1000000)
    thread2 = interp2.call_in_thread(cpu_task, 1000000)

    # Wait for threads to complete
    thread1.join()
    thread2.join()

    end_time = time.time()

    print(f"✅ Parallel execution time: {end_time - start_time:.4f}s")

    # Clean up
    interp1.close()
    interp2.close()
    print()


def test_interpreter_isolation():
    """Test interpreter isolation with stateless functions"""
    print("🔒 TESTING INTERPRETER ISOLATION")
    print("-" * 40)

    # Create interpreters
    interp1 = interpreters.create()
    interp2 = interpreters.create()

    # Define stateless functions (no globals, no closures)
    def stateless_function(x):
        return x * 2

    def another_stateless_function(a, b):
        return a + b

    # Test that functions work in both interpreters
    result1 = interp1.call(stateless_function, 21)
    print(f"✅ Interpreter 1 result: {result1}")

    result2 = interp2.call(stateless_function, 21)
    print(f"✅ Interpreter 2 result: {result2}")

    # Test different functions
    result3 = interp1.call(another_stateless_function, 10, 32)
    print(f"✅ Interpreter 1 add result: {result3}")

    result4 = interp2.call(another_stateless_function, 5, 15)
    print(f"✅ Interpreter 2 add result: {result4}")

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

    thread1 = interp1.call_in_thread(cpu_task, task_size)
    thread2 = interp2.call_in_thread(cpu_task, task_size)

    thread1.join()
    thread2.join()

    multi_time = time.time() - start_time
    print(f"Multi-interpreter: {multi_time:.4f}s")

    speedup = single_time / multi_time
    print(f"Speedup: {speedup:.2f}x")

    # Clean up
    interp1.close()
    interp2.close()
    print()


def test_interpreter_management():
    """Test interpreter management functions"""
    print("📋 TESTING INTERPRETER MANAGEMENT")
    print("-" * 40)

    # Get main interpreter
    main_interp = interpreters.get_main()
    print(f"✅ Main interpreter: {main_interp}")

    # Get current interpreter
    current = interpreters.get_current()
    print(f"✅ Current interpreter: {current}")

    # Create some interpreters
    interp1 = interpreters.create()
    interp2 = interpreters.create()

    # List all interpreters
    all_interpreters = interpreters.list_all()
    print(f"✅ All interpreters: {all_interpreters}")

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
    test_interpreter_management()

    print("🎉 PEP 734 tests completed!")

#!/usr/bin/env python3.15
"""PEP 734: Multiple Interpreters Test
Testing the new concurrent.interpreters module
"""

import time
from concurrent import interpreters


def test_basic_interpreter_creation():
    """Test basic interpreter creation and management"""
    print("=" * 60)
    print("🔄 PEP 734: MULTIPLE INTERPRETERS")
    print("=" * 60)

    # Create a new interpreter
    interp = interpreters.create()
    print(f"✅ Created interpreter with ID: {interp.id}")
    print(f"Interpreter state: {interp.state}")

    # Run simple code in the interpreter
    result = interp.run("return 'Hello from interpreter!'")
    print(f"✅ Interpreter result: {result}")

    # Clean up
    interp.close()
    print(f"✅ Interpreter closed: {interp.state}")
    print()


def test_parallel_execution():
    """Test parallel execution with multiple interpreters"""
    print("🚀 TESTING PARALLEL EXECUTION")
    print("-" * 40)

    def cpu_bound_task(n):
        """CPU-intensive task"""
        result = 0
        for i in range(n):
            result += i * i
        return result

    # Create multiple interpreters
    num_interpreters = 4
    interp_list = []

    for i in range(num_interpreters):
        interp = interpreters.create()
        interp_list.append(interp)
        print(f"✅ Created interpreter {i + 1}/{num_interpreters}")

    # Run tasks in parallel
    start_time = time.time()
    futures = []

    for i, interp in enumerate(interp_list):
        future = interp.run_async(cpu_bound_task, 1000000)
        futures.append(future)
        print(f"✅ Started task {i + 1}")

    # Wait for completion
    results = []
    for i, future in enumerate(futures):
        result = future.result()
        results.append(result)
        print(f"✅ Task {i + 1} completed: {result}")

    end_time = time.time()
    print(f"✅ Parallel execution time: {end_time - start_time:.4f}s")

    # Clean up
    for interp in interp_list:
        interp.close()

    print()


def test_interpreter_isolation():
    """Test that interpreters are properly isolated"""
    print("🔒 TESTING INTERPRETER ISOLATION")
    print("-" * 40)

    # Create two interpreters
    interp1 = interpreters.create()
    interp2 = interpreters.create()

    # Set variables in first interpreter
    interp1.run("x = 42; y = 'hello'")
    print("✅ Set variables in interpreter 1")

    # Try to access them in second interpreter
    try:
        result = interp2.run("return x")
        print(f"❌ Unexpected: Got {result} from interpreter 2")
    except Exception as e:
        print(f"✅ Expected error in interpreter 2: {e}")

    # Verify first interpreter still has variables
    result = interp1.run("return x, y")
    print(f"✅ Interpreter 1 still has variables: {result}")

    # Clean up
    interp1.close()
    interp2.close()
    print()


def test_shared_data():
    """Test sharing data between interpreters"""
    print("📊 TESTING SHARED DATA")
    print("-" * 40)

    # Create interpreters
    interp1 = interpreters.create()
    interp2 = interpreters.create()

    # Shared data
    shared_data = {
        "config": {"timeout": 30, "retries": 3},
        "constants": {"PI": 3.14159, "E": 2.71828},
    }

    def worker_task(data, worker_id):
        """Worker task that processes shared data"""
        return f"Worker {worker_id} processed {len(data)} items"

    # Run tasks with shared data
    future1 = interp1.run_async(worker_task, shared_data, 1)
    future2 = interp2.run_async(worker_task, shared_data, 2)

    # Get results
    result1 = future1.result()
    result2 = future2.result()

    print(f"✅ {result1}")
    print(f"✅ {result2}")

    # Clean up
    interp1.close()
    interp2.close()
    print()


def test_error_handling():
    """Test error handling in interpreters"""
    print("🚨 TESTING ERROR HANDLING")
    print("-" * 40)

    interp = interpreters.create()

    # Function that raises an exception
    def error_function():
        raise ValueError("This is an error in the interpreter")

    try:
        result = interp.run(error_function)
        print(f"❌ Unexpected success: {result}")
    except Exception as e:
        print(f"✅ Caught expected error: {e}")

    # Interpreter should still be functional
    result = interp.run("return 'Interpreter still working'")
    print(f"✅ Interpreter still functional: {result}")

    # Clean up
    interp.close()
    print()


def test_performance_comparison():
    """Compare performance with different approaches"""
    print("⚡ PERFORMANCE COMPARISON")
    print("-" * 40)

    def cpu_bound_task(n):
        """CPU-intensive task"""
        result = 0
        for i in range(n):
            result += i * i
        return result

    task_size = 1000000
    num_tasks = 4

    # Single-threaded baseline
    start_time = time.time()
    for _ in range(num_tasks):
        cpu_bound_task(task_size)
    single_time = time.time() - start_time
    print(f"Single-threaded: {single_time:.4f}s")

    # Multiple interpreters
    start_time = time.time()
    interp_list = [interpreters.create() for _ in range(num_tasks)]
    futures = [interp.run_async(cpu_bound_task, task_size) for interp in interp_list]
    for future in futures:
        future.result()
    interpreter_time = time.time() - start_time
    print(f"Multiple interpreters: {interpreter_time:.4f}s")

    # Calculate speedup
    speedup = single_time / interpreter_time
    print(f"Speedup: {speedup:.2f}x")

    # Clean up
    for interp in interp_list:
        interp.close()

    print()


def test_interpreter_pool():
    """Test using interpreters as a pool"""
    print("🏊 TESTING INTERPRETER POOL")
    print("-" * 40)

    # Create interpreter pool
    pool_size = 3
    interp_pool = [interpreters.create() for _ in range(pool_size)]

    def worker_task(task_id, data):
        """Worker task"""
        time.sleep(0.1)  # Simulate work
        return f"Task {task_id} processed {data}"

    # Distribute tasks across pool
    tasks = [(i, f"data_{i}") for i in range(10)]
    futures = []

    for i, (task_id, data) in enumerate(tasks):
        interp = interp_pool[i % pool_size]  # Round-robin assignment
        future = interp.run_async(worker_task, task_id, data)
        futures.append(future)

    # Collect results
    results = [future.result() for future in futures]

    for result in results:
        print(f"✅ {result}")

    # Clean up
    for interp in interp_pool:
        interp.close()

    print()


if __name__ == "__main__":
    test_basic_interpreter_creation()
    test_parallel_execution()
    test_interpreter_isolation()
    test_shared_data()
    test_error_handling()
    test_performance_comparison()
    test_interpreter_pool()

    print("🎉 PEP 734 tests completed!")

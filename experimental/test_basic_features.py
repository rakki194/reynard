#!/usr/bin/env python3.15
"""
Basic Python 3.15.0a0 Feature Tests
Testing fundamental capabilities and version information
"""

import platform
import sys
import time


def test_basic_info():
    """Test basic Python 3.15 information"""
    print("=" * 60)
    print("🐍 PYTHON 3.15.0a0 BASIC FEATURES TEST")
    print("=" * 60)

    print(f"Python Version: {sys.version}")
    print(f"Python Version Info: {sys.version_info}")
    print(f"Platform: {platform.platform()}")
    print(f"Architecture: {platform.architecture()}")
    print(f"Machine: {platform.machine()}")
    print(f"Processor: {platform.processor()}")

    # Test if we're running the development version
    if sys.version_info >= (3, 15):
        print("✅ Running Python 3.15+ development version")
    else:
        print("❌ Not running Python 3.15+")

    print()


def test_import_capabilities():
    """Test import capabilities"""
    print("📦 TESTING IMPORT CAPABILITIES")
    print("-" * 40)

    # Test standard library imports
    try:
        import asyncio
        import json
        import os
        import sys
        import time

        print("✅ Standard library imports working")
    except ImportError as e:
        print(f"❌ Standard library import failed: {e}")

    # Test if new modules are available
    new_modules_to_test = ["concurrent.interpreters", "debugger", "compression.zstd"]

    for module in new_modules_to_test:
        try:
            __import__(module)
            print(f"✅ {module} available")
        except ImportError:
            print(f"⚠️  {module} not available (expected for some features)")

    print()


def test_performance_baseline():
    """Test basic performance characteristics"""
    print("⚡ PERFORMANCE BASELINE TEST")
    print("-" * 40)

    # Simple computation test
    start_time = time.time()
    result = sum(i * i for i in range(1000000))
    end_time = time.time()

    print(f"Sum of squares (1M): {result}")
    print(f"Time taken: {end_time - start_time:.4f} seconds")

    # Memory usage test
    import sys

    data = list(range(100000))
    memory_usage = sys.getsizeof(data)
    print(f"Memory usage (100k integers): {memory_usage:,} bytes")

    print()


def test_error_handling():
    """Test basic error handling"""
    print("🚨 ERROR HANDLING TEST")
    print("-" * 40)

    try:
        # Test basic exception
        raise ValueError("Test error message")
    except ValueError as e:
        print(f"✅ Caught ValueError: {e}")

    try:
        # Test division by zero
        result = 1 / 0
    except ZeroDivisionError as e:
        print(f"✅ Caught ZeroDivisionError: {e}")

    print()


if __name__ == "__main__":
    test_basic_info()
    test_import_capabilities()
    test_performance_baseline()
    test_error_handling()

    print("🎉 Basic feature tests completed!")

#!/usr/bin/env python3
"""
Test runner for the debounced reload system tests.

This script runs all the tests for the reload system and provides
a comprehensive test report.
"""

import sys
import unittest
import logging
from pathlib import Path

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

# Import test modules
from tests.test_reload_watcher import (
    TestDebouncedReloadHandler,
    TestDebouncedReloadWatcher,
    TestCreateReloadWatcher,
    TestThreadSafety,
    TestFilePatternFiltering,
    TestIntegration
)

from tests.test_main_integration import (
    TestDebouncedReloadServer,
    TestMainModuleIntegration,
    TestConfigurationIntegration,
    TestErrorHandling
)

from tests.test_reload_performance import (
    TestReloadPerformance,
    TestStressConditions
)


def run_tests():
    """Run all reload system tests."""
    # Configure logging to reduce noise during tests
    logging.basicConfig(
        level=logging.WARNING,
        format='%(levelname)s: %(message)s'
    )
    
    # Create test suite
    test_suite = unittest.TestSuite()
    
    # Add test classes
    test_classes = [
        # Core functionality tests
        TestDebouncedReloadHandler,
        TestDebouncedReloadWatcher,
        TestCreateReloadWatcher,
        
        # Integration tests
        TestIntegration,
        TestDebouncedReloadServer,
        TestMainModuleIntegration,
        TestConfigurationIntegration,
        
        # Thread safety tests
        TestThreadSafety,
        
        # File pattern tests
        TestFilePatternFiltering,
        
        # Performance tests
        TestReloadPerformance,
        TestStressConditions,
        
        # Error handling tests
        TestErrorHandling,
    ]
    
    # Add all test methods to the suite
    for test_class in test_classes:
        tests = unittest.TestLoader().loadTestsFromTestCase(test_class)
        test_suite.addTests(tests)
    
    # Run the tests
    print("🦊 Running Debounced Reload System Tests")
    print("=" * 50)
    
    runner = unittest.TextTestRunner(
        verbosity=2,
        descriptions=True,
        failfast=False
    )
    
    result = runner.run(test_suite)
    
    # Print summary
    print("\n" + "=" * 50)
    print("📊 Test Summary:")
    print(f"   Tests run: {result.testsRun}")
    print(f"   Failures: {len(result.failures)}")
    print(f"   Errors: {len(result.errors)}")
    print(f"   Skipped: {len(result.skipped) if hasattr(result, 'skipped') else 0}")
    
    if result.failures:
        print("\n❌ Failures:")
        for test, traceback in result.failures:
            print(f"   - {test}: {traceback.split('AssertionError: ')[-1].split('\\n')[0]}")
    
    if result.errors:
        print("\n💥 Errors:")
        for test, traceback in result.errors:
            print(f"   - {test}: {traceback.split('\\n')[-2]}")
    
    # Return success/failure
    success = len(result.failures) == 0 and len(result.errors) == 0
    
    if success:
        print("\n✅ All tests passed! The debounced reload system is working correctly.")
    else:
        print(f"\n❌ {len(result.failures) + len(result.errors)} test(s) failed.")
    
    return success


def run_specific_test_category(category):
    """Run tests for a specific category."""
    categories = {
        'core': [TestDebouncedReloadHandler, TestDebouncedReloadWatcher, TestCreateReloadWatcher],
        'integration': [TestIntegration, TestDebouncedReloadServer, TestMainModuleIntegration],
        'performance': [TestReloadPerformance, TestStressConditions],
        'threading': [TestThreadSafety],
        'patterns': [TestFilePatternFiltering],
        'errors': [TestErrorHandling],
        'config': [TestConfigurationIntegration]
    }
    
    if category not in categories:
        print(f"❌ Unknown category: {category}")
        print(f"Available categories: {', '.join(categories.keys())}")
        return False
    
    # Configure logging
    logging.basicConfig(level=logging.WARNING)
    
    # Create test suite for specific category
    test_suite = unittest.TestSuite()
    for test_class in categories[category]:
        tests = unittest.TestLoader().loadTestsFromTestCase(test_class)
        test_suite.addTests(tests)
    
    print(f"🦊 Running {category.title()} Tests")
    print("=" * 50)
    
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(test_suite)
    
    success = len(result.failures) == 0 and len(result.errors) == 0
    return success


if __name__ == "__main__":
    if len(sys.argv) > 1:
        category = sys.argv[1]
        success = run_specific_test_category(category)
    else:
        success = run_tests()
    
    sys.exit(0 if success else 1)

"""
Example test file with some failing tests to create realistic test data.

🦦 *splashes with realistic test data enthusiasm* This file contains
a mix of passing and failing tests to demonstrate real test result collection.
"""

import pytest
import time
import random


class TestFailingExample:
    """Test class with mixed results to create realistic test data."""
    
    def test_always_passes(self):
        """This test always passes."""
        assert True
    
    def test_always_fails(self):
        """This test always fails."""
        assert False, "This test is designed to fail"
    
    def test_sometimes_passes(self):
        """This test passes 70% of the time."""
        if random.random() < 0.7:
            assert True
        else:
            assert False, "Random failure"
    
    def test_with_warning(self):
        """This test passes but generates a warning."""
        import warnings
        warnings.warn("This is a test warning", UserWarning)
        assert True
    
    def test_slow_test(self):
        """This test takes some time to run."""
        time.sleep(0.1)
        assert True
    
    def test_with_stdout(self):
        """This test produces stdout output."""
        print("This is test output")
        assert True
    
    def test_with_stderr(self):
        """This test produces stderr output."""
        import sys
        print("This is error output", file=sys.stderr)
        assert True
    
    @pytest.mark.skip(reason="This test is skipped")
    def test_skipped(self):
        """This test is always skipped."""
        assert False
    
    def test_with_exception(self):
        """This test raises an exception."""
        raise ValueError("This is a test exception")
    
    def test_assertion_error(self):
        """This test has an assertion error."""
        expected = "expected value"
        actual = "actual value"
        assert expected == actual, f"Expected {expected}, got {actual}"

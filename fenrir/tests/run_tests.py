#!/usr/bin/env python3
"""
🦦 FENRIR TEST RUNNER SCRIPT

*splashes with enthusiasm* Simple script to run all fenrir security tests!
"""

import asyncio
import os
import sys

# Add the fenrir directory to the path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from penetration_testing_client import penetration_testing_session
from test_runner import FenrirTestRunner


async def main():
    """Run all fenrir tests with penetration testing session"""
    print("🦦 Starting Fenrir Security Test Suite...")
    print("=" * 50)

    # Use penetration testing session to disable auto-reload
    with penetration_testing_session(timeout_minutes=30) as pt_client:
        print("🦊 Penetration testing mode activated - auto-reload disabled")

        runner = FenrirTestRunner()

        try:
            await runner.run_all_tests()
            runner.print_report()

            # Check if all tests passed
            if runner.suite_results:
                total_failed = sum(suite.failed_tests for suite in runner.suite_results)
                if total_failed == 0:
                    print(
                        "\n✅ All tests passed! Security testing framework is working correctly."
                    )
                    return 0
                print(
                    f"\n❌ {total_failed} tests failed. Please check the results above."
                )
                return 1
            print("\n⚠️ No test results available. Please check the backend is running.")
            return 1

        except KeyboardInterrupt:
            print("\n⚠️ Tests interrupted by user.")
            return 1
        except Exception as e:
            print(f"\n❌ Test runner failed: {e!s}")
            return 1


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)

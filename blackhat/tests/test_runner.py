"""
🦦 BLACKHAT TEST RUNNER

*splashes with enthusiasm* Comprehensive test runner for all blackhat security testing scripts!
This runner executes all test suites and provides a detailed report of our security testing framework.
"""

import asyncio
import time
import sys
import os
from typing import Dict, List, Any
from dataclasses import dataclass
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn, TaskProgressColumn

# Add the blackhat directory to the path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from test_base import BlackhatTestBase, TestResult

# Import all test suites
from test_jwt_exploits import TestJWTExploits
from test_fuzzing_framework import TestFuzzingFramework
from test_cors_exploits import TestCORSExploits
from test_rate_limiting import TestRateLimiting

console = Console()

@dataclass
class TestSuiteResult:
    """Result of a test suite execution"""
    suite_name: str
    total_tests: int
    passed_tests: int
    failed_tests: int
    vulnerabilities_found: int
    success_rate: float
    execution_time: float
    results: List[TestResult]

class BlackhatTestRunner:
    """
    *otter enthusiasm bubbles* Comprehensive test runner for all blackhat security tests
    
    This runner executes all test suites and provides detailed reporting on
    the security testing framework's effectiveness.
    """
    
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.test_suites = [
            ("JWT Exploits", TestJWTExploits),
            ("Fuzzing Framework", TestFuzzingFramework),
            ("CORS Exploits", TestCORSExploits),
            ("Rate Limiting", TestRateLimiting),
        ]
        self.suite_results: List[TestSuiteResult] = []
    
    async def run_all_tests(self) -> List[TestSuiteResult]:
        """
        *splashes excitedly* Run all test suites and return comprehensive results
        """
        console.print(Panel.fit(
            "[bold blue]🦦 BLACKHAT SECURITY TEST SUITE[/bold blue]\n"
            "*splashes with enthusiasm* Running comprehensive security tests!",
            border_style="blue"
        ))
        
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            BarColumn(),
            TaskProgressColumn(),
            console=console
        ) as progress:
            
            # Create progress tasks for each test suite
            tasks = []
            for suite_name, test_class in self.test_suites:
                task = progress.add_task(f"Testing {suite_name}...", total=100)
                tasks.append((suite_name, test_class, task))
            
            # Run all test suites
            for suite_name, test_class, task in tasks:
                try:
                    progress.update(task, description=f"Running {suite_name} tests...")
                    
                    start_time = time.time()
                    suite_result = await self._run_test_suite(suite_name, test_class, progress, task)
                    execution_time = time.time() - start_time
                    
                    suite_result.execution_time = execution_time
                    self.suite_results.append(suite_result)
                    
                    progress.update(task, completed=100, description=f"✅ {suite_name} completed")
                    
                except Exception as e:
                    progress.update(task, completed=100, description=f"❌ {suite_name} failed")
                    console.print(f"[red]Error running {suite_name}: {str(e)}[/red]")
        
        return self.suite_results
    
    async def _run_test_suite(self, suite_name: str, test_class, progress, task) -> TestSuiteResult:
        """Run a single test suite"""
        async with test_class(self.base_url) as tester:
            # Run all test methods
            test_methods = [
                method for method in dir(tester)
                if method.startswith('test_') and callable(getattr(tester, method))
            ]
            
            total_tests = len(test_methods)
            completed_tests = 0
            
            for method_name in test_methods:
                try:
                    method = getattr(tester, method_name)
                    await method()
                    completed_tests += 1
                    
                    # Update progress
                    progress_value = int((completed_tests / total_tests) * 100)
                    progress.update(task, completed=progress_value)
                    
                except Exception as e:
                    console.print(f"[yellow]Warning: {method_name} failed: {str(e)}[/yellow]")
                    completed_tests += 1
                    progress_value = int((completed_tests / total_tests) * 100)
                    progress.update(task, completed=progress_value)
            
            # Get test results
            summary = tester.get_test_summary()
            
            return TestSuiteResult(
                suite_name=suite_name,
                total_tests=summary['total_tests'],
                passed_tests=summary['passed_tests'],
                failed_tests=summary['failed_tests'],
                vulnerabilities_found=summary['vulnerabilities_found'],
                success_rate=summary['success_rate'],
                execution_time=0.0,  # Will be set by caller
                results=summary['results']
            )
    
    def generate_report(self) -> str:
        """Generate a comprehensive test report"""
        if not self.suite_results:
            return "No test results available"
        
        # Calculate overall statistics
        total_tests = sum(suite.total_tests for suite in self.suite_results)
        total_passed = sum(suite.passed_tests for suite in self.suite_results)
        total_failed = sum(suite.failed_tests for suite in self.suite_results)
        total_vulnerabilities = sum(suite.vulnerabilities_found for suite in self.suite_results)
        total_time = sum(suite.execution_time for suite in self.suite_results)
        overall_success_rate = (total_passed / total_tests * 100) if total_tests > 0 else 0
        
        # Create summary table
        summary_table = Table(title="🦦 Blackhat Test Suite Summary")
        summary_table.add_column("Metric", style="cyan")
        summary_table.add_column("Value", style="magenta")
        summary_table.add_column("Percentage", style="green")
        
        summary_table.add_row("Total Tests", str(total_tests), "100%")
        summary_table.add_row("Passed Tests", str(total_passed), f"{overall_success_rate:.1f}%")
        summary_table.add_row("Failed Tests", str(total_failed), f"{(total_failed/total_tests*100):.1f}%" if total_tests > 0 else "0%")
        summary_table.add_row("Vulnerabilities Found", str(total_vulnerabilities), f"{(total_vulnerabilities/total_tests*100):.1f}%" if total_tests > 0 else "0%")
        summary_table.add_row("Total Execution Time", f"{total_time:.2f}s", "")
        
        # Create detailed results table
        details_table = Table(title="🦦 Test Suite Details")
        details_table.add_column("Test Suite", style="cyan")
        details_table.add_column("Tests", style="magenta")
        details_table.add_column("Passed", style="green")
        details_table.add_column("Failed", style="red")
        details_table.add_column("Vulnerabilities", style="yellow")
        details_table.add_column("Success Rate", style="blue")
        details_table.add_column("Time", style="white")
        
        for suite in self.suite_results:
            details_table.add_row(
                suite.suite_name,
                str(suite.total_tests),
                str(suite.passed_tests),
                str(suite.failed_tests),
                str(suite.vulnerabilities_found),
                f"{suite.success_rate:.1f}%",
                f"{suite.execution_time:.2f}s"
            )
        
        # Generate report text
        report = f"""
🦦 BLACKHAT SECURITY TEST SUITE REPORT
{'='*50}

OVERALL RESULTS:
- Total Tests: {total_tests}
- Passed: {total_passed} ({overall_success_rate:.1f}%)
- Failed: {total_failed} ({(total_failed/total_tests*100):.1f}%)
- Vulnerabilities Found: {total_vulnerabilities}
- Total Execution Time: {total_time:.2f}s

TEST SUITE BREAKDOWN:
"""
        
        for suite in self.suite_results:
            report += f"""
{suite.suite_name}:
  - Tests: {suite.total_tests}
  - Passed: {suite.passed_tests} ({suite.success_rate:.1f}%)
  - Failed: {suite.failed_tests}
  - Vulnerabilities: {suite.vulnerabilities_found}
  - Time: {suite.execution_time:.2f}s
"""
        
        return report
    
    def print_report(self):
        """Print the test report to console"""
        console.print(self.generate_report())
        
        # Print summary table
        summary_table = Table(title="🦦 Blackhat Test Suite Summary")
        summary_table.add_column("Metric", style="cyan")
        summary_table.add_column("Value", style="magenta")
        summary_table.add_column("Percentage", style="green")
        
        if self.suite_results:
            total_tests = sum(suite.total_tests for suite in self.suite_results)
            total_passed = sum(suite.passed_tests for suite in self.suite_results)
            total_failed = sum(suite.failed_tests for suite in self.suite_results)
            total_vulnerabilities = sum(suite.vulnerabilities_found for suite in self.suite_results)
            total_time = sum(suite.execution_time for suite in self.suite_results)
            overall_success_rate = (total_passed / total_tests * 100) if total_tests > 0 else 0
            
            summary_table.add_row("Total Tests", str(total_tests), "100%")
            summary_table.add_row("Passed Tests", str(total_passed), f"{overall_success_rate:.1f}%")
            summary_table.add_row("Failed Tests", str(total_failed), f"{(total_failed/total_tests*100):.1f}%" if total_tests > 0 else "0%")
            summary_table.add_row("Vulnerabilities Found", str(total_vulnerabilities), f"{(total_vulnerabilities/total_tests*100):.1f}%" if total_tests > 0 else "0%")
            summary_table.add_row("Total Execution Time", f"{total_time:.2f}s", "")
        
        console.print(summary_table)
        
        # Print detailed results table
        if self.suite_results:
            details_table = Table(title="🦦 Test Suite Details")
            details_table.add_column("Test Suite", style="cyan")
            details_table.add_column("Tests", style="magenta")
            details_table.add_column("Passed", style="green")
            details_table.add_column("Failed", style="red")
            details_table.add_column("Vulnerabilities", style="yellow")
            details_table.add_column("Success Rate", style="blue")
            details_table.add_column("Time", style="white")
            
            for suite in self.suite_results:
                details_table.add_row(
                    suite.suite_name,
                    str(suite.total_tests),
                    str(suite.passed_tests),
                    str(suite.failed_tests),
                    str(suite.vulnerabilities_found),
                    f"{suite.success_rate:.1f}%",
                    f"{suite.execution_time:.2f}s"
                )
            
            console.print(details_table)

async def main():
    """Main function to run all tests"""
    runner = BlackhatTestRunner()
    
    try:
        await runner.run_all_tests()
        runner.print_report()
        
        # Exit with appropriate code
        if runner.suite_results:
            total_failed = sum(suite.failed_tests for suite in runner.suite_results)
            if total_failed > 0:
                console.print(f"\n[red]❌ {total_failed} tests failed![/red]")
                sys.exit(1)
            else:
                console.print(f"\n[green]✅ All tests passed![/green]")
                sys.exit(0)
        else:
            console.print(f"\n[yellow]⚠️ No test results available[/yellow]")
            sys.exit(1)
            
    except KeyboardInterrupt:
        console.print(f"\n[yellow]⚠️ Tests interrupted by user[/yellow]")
        sys.exit(1)
    except Exception as e:
        console.print(f"\n[red]❌ Test runner failed: {str(e)}[/red]")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())

"""
Pytest Database Reporter Plugin

🦦 *splashes with database integration enthusiasm* Custom Pytest plugin
that stores test results directly in the reynard_e2e PostgreSQL database.

This plugin integrates with the EcosystemService to provide
centralized test result storage and analysis.

Author: Quality-Otter-15 (Reynard Otter Specialist)
Version: 1.0.0
"""

import os
import uuid
import json
import time
import asyncio
from datetime import datetime, UTC
from typing import Dict, Any, Optional, List
from pathlib import Path

import pytest
import requests
from _pytest.config import Config
from _pytest.reports import TestReport
from _pytest.runner import CallInfo
from _pytest.main import Session
from _pytest.nodes import Item


class PytestDBReporter:
    """Pytest reporter that stores results in the reynard_e2e database."""
    
    def __init__(self, config: Config):
        self.config = config
        self.api_base_url = os.getenv('TESTING_API_URL', 'http://localhost:8000')
        self.environment = os.getenv('NODE_ENV', 'development')
        self.branch = os.getenv('GIT_BRANCH', 'unknown')
        self.commit = os.getenv('GIT_COMMIT', 'unknown')
        self.test_suite = 'pytest'
        
        self.run_id: Optional[str] = None
        self.test_run_id: Optional[str] = None
        self.start_time: Optional[datetime] = None
        self.end_time: Optional[datetime] = None
        self.test_results: List[Dict[str, Any]] = []
        
        # Statistics
        self.total_tests = 0
        self.passed_tests = 0
        self.failed_tests = 0
        self.skipped_tests = 0
        self.error_tests = 0
        
    def generate_run_id(self) -> str:
        """Generate a unique run ID."""
        timestamp = datetime.now(UTC).strftime('%Y%m%d_%H%M%S')
        random_suffix = str(uuid.uuid4())[:8]
        return f"pytest_{timestamp}_{random_suffix}"
    
    def pytest_sessionstart(self, session: Session):
        """Called after the Session object has been created."""
        self.start_time = datetime.now(UTC)
        self.run_id = self.generate_run_id()
        
        # Count total tests
        self.total_tests = len(session.items)
        
        print(f"🦦 Starting Pytest run: {self.run_id}")
        print(f"📊 Total tests: {self.total_tests}")
        
        # Create test run in database
        asyncio.run(self.create_test_run())
    
    def pytest_sessionfinish(self, session: Session, exitstatus: int):
        """Called after whole test run finished, right before returning the exit status."""
        self.end_time = datetime.now(UTC)
        
        if not self.test_run_id:
            print("⚠️ No test run ID available")
            return
        
        print(f"🦦 Pytest run completed: {self.run_id}")
        print(f"✅ Passed: {self.passed_tests}")
        print(f"❌ Failed: {self.failed_tests}")
        print(f"⏭️ Skipped: {self.skipped_tests}")
        print(f"❌ Errors: {self.error_tests}")
        
        if self.start_time and self.end_time:
            duration = (self.end_time - self.start_time).total_seconds() * 1000
            print(f"⏱️ Duration: {duration:.2f}ms")
        
        # Update test run status
        asyncio.run(self.update_test_run_status())
    
    def pytest_runtest_logreport(self, report: TestReport):
        """Process a test report."""
        if report.when != 'call':
            return
        
        # Update statistics
        if report.outcome == 'passed':
            self.passed_tests += 1
        elif report.outcome == 'failed':
            self.failed_tests += 1
        elif report.outcome == 'skipped':
            self.skipped_tests += 1
        else:
            self.error_tests += 1
        
        # Store individual test result
        asyncio.run(self.store_test_result(report))
    
    async def create_test_run(self):
        """Create a test run in the database."""
        try:
            response = requests.post(
                f"{self.api_base_url}/api/testing/test-runs",
                json={
                    "run_id": self.run_id,
                    "test_type": "pytest",
                    "test_suite": self.test_suite,
                    "environment": self.environment,
                    "branch": self.branch,
                    "commit_hash": self.commit,
                    "total_tests": self.total_tests,
                    "passed_tests": 0,
                    "failed_tests": 0,
                    "skipped_tests": 0,
                    "metadata": {
                        "pytest_version": pytest.__version__,
                        "python_version": os.sys.version,
                        "start_time": self.start_time.isoformat() if self.start_time else None,
                        "config_options": self._get_config_options(),
                    }
                },
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                self.test_run_id = data['id']
                print(f"✅ Created test run: {self.test_run_id}")
            else:
                print(f"❌ Failed to create test run: {response.status_code} {response.text}")
                
        except Exception as e:
            print(f"❌ Error creating test run: {e}")
    
    async def store_test_result(self, report: TestReport):
        """Store individual test result in the database."""
        if not self.test_run_id:
            return
        
        try:
            # Extract test information
            test_name = report.nodeid
            test_file = str(report.fspath) if hasattr(report, 'fspath') else None
            test_class = self._extract_test_class(test_name)
            test_method = self._extract_test_method(test_name)
            
            # Map pytest outcome to our status
            status_map = {
                'passed': 'passed',
                'failed': 'failed',
                'skipped': 'skipped',
            }
            status = status_map.get(report.outcome, 'error')
            
            # Calculate duration
            duration_ms = report.duration * 1000 if hasattr(report, 'duration') else 0
            
            # Extract error information
            error_message = None
            error_traceback = None
            if hasattr(report, 'longrepr') and report.longrepr:
                error_message = str(report.longrepr).split('\n')[0] if '\n' in str(report.longrepr) else str(report.longrepr)
                error_traceback = str(report.longrepr)
            
            # Extract stdout/stderr
            stdout = None
            stderr = None
            if hasattr(report, 'capstdout') and report.capstdout:
                stdout = report.capstdout
            if hasattr(report, 'capstderr') and report.capstderr:
                stderr = report.capstderr
            
            # Store in database
            response = requests.post(
                f"{self.api_base_url}/api/testing/test-results",
                json={
                    "test_run_id": self.test_run_id,
                    "test_name": test_name,
                    "test_file": test_file,
                    "test_class": test_class,
                    "test_method": test_method,
                    "status": status,
                    "duration_ms": duration_ms,
                    "started_at": self.start_time.isoformat() if self.start_time else None,
                    "completed_at": self.end_time.isoformat() if self.end_time else None,
                    "error_message": error_message,
                    "error_traceback": error_traceback,
                    "stdout": stdout,
                    "stderr": stderr,
                    "metadata": {
                        "pytest_outcome": report.outcome,
                        "pytest_when": report.when,
                        "pytest_sections": [str(section) for section in report.sections] if hasattr(report, 'sections') else [],
                        "pytest_keywords": getattr(report, 'keywords', {}),
                    }
                },
                timeout=30
            )
            
            if response.status_code != 200:
                print(f"⚠️ Failed to store test result for {test_name}: {response.status_code}")
                
        except Exception as e:
            print(f"⚠️ Error storing test result for {report.nodeid}: {e}")
    
    async def update_test_run_status(self):
        """Update test run status to completed."""
        if not self.test_run_id:
            return
        
        try:
            # Calculate final statistics
            total_duration = 0
            if self.start_time and self.end_time:
                total_duration = (self.end_time - self.start_time).total_seconds() * 1000
            
            # Update test run with final statistics
            response = requests.patch(
                f"{self.api_base_url}/api/testing/test-runs/{self.test_run_id}",
                json={
                    "passed_tests": self.passed_tests,
                    "failed_tests": self.failed_tests,
                    "skipped_tests": self.skipped_tests,
                    "metadata": {
                        "total_duration_ms": total_duration,
                        "end_time": self.end_time.isoformat() if self.end_time else None,
                        "exit_status": getattr(self.config, 'exitstatus', 0),
                    }
                },
                timeout=30
            )
            
            if response.status_code == 200:
                # Mark as completed
                requests.patch(
                    f"{self.api_base_url}/api/testing/test-runs/{self.test_run_id}/status",
                    json={"status": "completed"},
                    timeout=30
                )
                print(f"✅ Updated test run status: {self.test_run_id}")
            else:
                print(f"❌ Failed to update test run: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Error updating test run status: {e}")
    
    def _extract_test_class(self, test_name: str) -> Optional[str]:
        """Extract class name from test name."""
        # Format: path/to/file.py::ClassName::test_method
        parts = test_name.split('::')
        if len(parts) >= 2:
            class_part = parts[1]
            if '::' not in class_part:  # It's a class name
                return class_part
        return None
    
    def _extract_test_method(self, test_name: str) -> Optional[str]:
        """Extract method name from test name."""
        # Format: path/to/file.py::ClassName::test_method
        parts = test_name.split('::')
        if len(parts) >= 3:
            return parts[2]
        elif len(parts) == 2:
            return parts[1]  # Function name
        return None
    
    def _get_config_options(self) -> Dict[str, Any]:
        """Get relevant pytest configuration options."""
        return {
            "testpaths": getattr(self.config, 'testpaths', []),
            "python_files": getattr(self.config, 'python_files', []),
            "python_classes": getattr(self.config, 'python_classes', []),
            "python_functions": getattr(self.config, 'python_functions', []),
            "markers": list(getattr(self.config, 'markers', {}).keys()),
            "addopts": getattr(self.config, 'addopts', []),
        }


def pytest_configure(config: Config):
    """Register the database reporter plugin."""
    if config.getoption('--db-reporter', default=False):
        reporter = PytestDBReporter(config)
        config.pluginmanager.register(reporter, 'db_reporter')


def pytest_addoption(parser):
    """Add command line options for the database reporter."""
    parser.addoption(
        '--db-reporter',
        action='store_true',
        default=False,
        help='Enable database reporter for storing test results in PostgreSQL'
    )
    parser.addoption(
        '--db-api-url',
        action='store',
        default='http://localhost:8000',
        help='Base URL for the testing ecosystem API'
    )


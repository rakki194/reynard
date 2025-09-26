#!/usr/bin/env python3
"""
🦊 Project Root Utility Tests for Python
========================================

Comprehensive tests to ensure the Python project root utility
behaves consistently with Shell and TypeScript versions.

Author: Reynard Development Team
Version: 1.0.0
"""

import os

# Add the backend directory to the Python path
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core.project_root import (
    BACKEND_DIR,
    E2E_DIR,
    EXAMPLES_DIR,
    EXPERIMENTAL_DIR,
    PAPERS_DIRECTORY,
    PROJECT_ROOT,
    get_backend_dir,
    get_e2e_dir,
    get_examples_dir,
    get_experimental_dir,
    get_papers_directory,
    get_project_path,
    get_project_root,
)


class TestProjectRootUtility(unittest.TestCase):
    """Test suite for the Python project root utility."""

    def setUp(self):
        """Set up test environment."""
        self.expected_project_root = "/home/kade/runeset/reynard"
        self.expected_backend_dir = "/home/kade/runeset/reynard/backend"
        self.expected_e2e_dir = "/home/kade/runeset/reynard/e2e"
        self.expected_examples_dir = "/home/kade/runeset/reynard/examples"
        self.expected_experimental_dir = "/home/kade/runeset/reynard/experimental"
        self.expected_papers_dir = "/home/kade/runeset/reynard/backend/data/papers"

    def test_get_project_root_default(self):
        """Test default project root detection."""
        result = get_project_root()
        self.assertEqual(str(result), self.expected_project_root)
        self.assertIsInstance(result, Path)

    def test_get_project_root_with_env_var(self):
        """Test project root with environment variable override."""
        with tempfile.TemporaryDirectory() as temp_dir:
            with patch.dict(os.environ, {'REYNARD_PROJECT_ROOT': temp_dir}):
                result = get_project_root()
                self.assertEqual(str(result), temp_dir)

    def test_get_project_path(self):
        """Test getting paths relative to project root."""
        result = get_project_path("backend")
        self.assertEqual(str(result), self.expected_backend_dir)

        result = get_project_path("e2e")
        self.assertEqual(str(result), self.expected_e2e_dir)

    def test_get_backend_dir(self):
        """Test backend directory function."""
        result = get_backend_dir()
        self.assertEqual(str(result), self.expected_backend_dir)
        self.assertIsInstance(result, Path)

    def test_get_e2e_dir(self):
        """Test E2E directory function."""
        result = get_e2e_dir()
        self.assertEqual(str(result), self.expected_e2e_dir)
        self.assertIsInstance(result, Path)

    def test_get_examples_dir(self):
        """Test examples directory function."""
        result = get_examples_dir()
        self.assertEqual(str(result), self.expected_examples_dir)
        self.assertIsInstance(result, Path)

    def test_get_experimental_dir(self):
        """Test experimental directory function."""
        result = get_experimental_dir()
        self.assertEqual(str(result), self.expected_experimental_dir)
        self.assertIsInstance(result, Path)

    def test_get_papers_directory(self):
        """Test papers directory function."""
        result = get_papers_directory()
        self.assertEqual(str(result), self.expected_papers_dir)
        self.assertIsInstance(result, Path)

    def test_constant_exports(self):
        """Test that constants are exported correctly."""
        self.assertEqual(str(PROJECT_ROOT), self.expected_project_root)
        self.assertEqual(str(BACKEND_DIR), self.expected_backend_dir)
        self.assertEqual(str(E2E_DIR), self.expected_e2e_dir)
        self.assertEqual(str(EXAMPLES_DIR), self.expected_examples_dir)
        self.assertEqual(str(EXPERIMENTAL_DIR), self.expected_experimental_dir)
        self.assertEqual(str(PAPERS_DIRECTORY), self.expected_papers_dir)

    def test_directory_existence(self):
        """Test that all directories exist."""
        self.assertTrue(
            PROJECT_ROOT.exists(), f"Project root should exist: {PROJECT_ROOT}"
        )
        self.assertTrue(
            BACKEND_DIR.exists(), f"Backend directory should exist: {BACKEND_DIR}"
        )
        self.assertTrue(E2E_DIR.exists(), f"E2E directory should exist: {E2E_DIR}")
        self.assertTrue(
            EXAMPLES_DIR.exists(), f"Examples directory should exist: {EXAMPLES_DIR}"
        )
        self.assertTrue(
            EXPERIMENTAL_DIR.exists(),
            f"Experimental directory should exist: {EXPERIMENTAL_DIR}",
        )

    def test_project_structure_validation(self):
        """Test that key project structure elements exist."""
        # Test that package.json exists in project root
        package_json = PROJECT_ROOT / "package.json"
        self.assertTrue(
            package_json.exists(), f"package.json should exist: {package_json}"
        )

        # Test that package.json contains "reynard"
        if package_json.exists():
            content = package_json.read_text()
            self.assertIn(
                "reynard", content.lower(), "package.json should contain 'reynard'"
            )

    def test_consistency_with_functions(self):
        """Test that functions return the same values as constants."""
        self.assertEqual(get_project_root(), PROJECT_ROOT)
        self.assertEqual(get_backend_dir(), BACKEND_DIR)
        self.assertEqual(get_e2e_dir(), E2E_DIR)
        self.assertEqual(get_examples_dir(), EXAMPLES_DIR)
        self.assertEqual(get_experimental_dir(), EXPERIMENTAL_DIR)
        self.assertEqual(get_papers_directory(), PAPERS_DIRECTORY)

    def test_path_consistency(self):
        """Test that all paths are consistent with project root."""
        self.assertEqual(BACKEND_DIR, PROJECT_ROOT / "backend")
        self.assertEqual(E2E_DIR, PROJECT_ROOT / "e2e")
        self.assertEqual(EXAMPLES_DIR, PROJECT_ROOT / "examples")
        self.assertEqual(EXPERIMENTAL_DIR, PROJECT_ROOT / "experimental")
        self.assertEqual(PAPERS_DIRECTORY, PROJECT_ROOT / "backend" / "data" / "papers")

    def test_environment_variable_priority(self):
        """Test that environment variable takes priority over default detection."""
        with tempfile.TemporaryDirectory() as temp_dir:
            # Create a fake package.json to test environment variable priority
            fake_package_json = Path(temp_dir) / "package.json"
            fake_package_json.write_text('{"name": "fake-reynard"}')

            with patch.dict(os.environ, {'REYNARD_PROJECT_ROOT': temp_dir}):
                result = get_project_root()
                self.assertEqual(str(result), temp_dir)

    def test_fallback_behavior(self):
        """Test fallback behavior when environment variable is invalid."""
        with patch.dict(os.environ, {'REYNARD_PROJECT_ROOT': '/nonexistent/path'}):
            result = get_project_root()
            # Should fall back to default detection
            self.assertEqual(str(result), self.expected_project_root)


class TestProjectRootConsistency(unittest.TestCase):
    """Test consistency between different project root utilities."""

    def test_expected_values(self):
        """Test that all utilities return the same expected values."""
        expected_values = {
            'project_root': '/home/kade/runeset/reynard',
            'backend_dir': '/home/kade/runeset/reynard/backend',
            'e2e_dir': '/home/kade/runeset/reynard/e2e',
            'examples_dir': '/home/kade/runeset/reynard/examples',
            'experimental_dir': '/home/kade/runeset/reynard/experimental',
            'papers_dir': '/home/kade/runeset/reynard/backend/data/papers',
        }

        # Test Python values
        python_values = {
            'project_root': str(get_project_root()),
            'backend_dir': str(get_backend_dir()),
            'e2e_dir': str(get_e2e_dir()),
            'examples_dir': str(get_examples_dir()),
            'experimental_dir': str(get_experimental_dir()),
            'papers_dir': str(get_papers_directory()),
        }

        for key, expected in expected_values.items():
            with self.subTest(key=key):
                self.assertEqual(
                    python_values[key],
                    expected,
                    f"Python {key} should match expected value",
                )


if __name__ == '__main__':
    # Run tests with verbose output
    unittest.main(verbosity=2)

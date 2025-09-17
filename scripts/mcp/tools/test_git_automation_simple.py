#!/usr/bin/env python3
"""
Simple tests for Git automation tools functionality.
"""

import json
import os
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import Mock, patch


class SimpleGitAutomationTools:
    """Simplified version of GitAutomationTools for testing."""
    
    def __init__(self):
        self.working_dir = "."
    
    def _validate_working_directory(self, working_dir):
        """Validate that the working directory exists and is accessible."""
        if not os.path.exists(working_dir):
            raise ValueError(f"Working directory does not exist: {working_dir}")
        if not os.path.isdir(working_dir):
            raise ValueError(f"Working directory is not a directory: {working_dir}")
        return True
    
    def _parse_cli_output(self, output, returncode):
        """Parse CLI output and handle errors."""
        try:
            result = json.loads(output)
            if returncode != 0:
                error_msg = result.get("error", "Unknown error")
                raise Exception(f"CLI execution failed: {error_msg}")
            return result
        except json.JSONDecodeError as e:
            raise Exception(f"Failed to parse CLI output: {e}")
    
    def _run_cli_command(self, command, working_dir=None):
        """Run a CLI command and return parsed output."""
        if working_dir is None:
            working_dir = self.working_dir
        
        self._validate_working_directory(working_dir)
        
        try:
            result = subprocess.run(
                command,
                cwd=working_dir,
                capture_output=True,
                text=True,
                check=False
            )
            
            return self._parse_cli_output(result.stdout, result.returncode)
        except subprocess.CalledProcessError as e:
            raise Exception(f"CLI command failed: {e}")
        except Exception as e:
            raise Exception(f"CLI execution error: {e}")
    
    def detect_junk_files(self, working_dir=None):
        """Detect junk files in the repository."""
        try:
            return self._run_cli_command(["reynard-git", "detect-junk"], working_dir)
        except Exception as e:
            raise Exception(f"Junk detection failed: {e}")
    
    def analyze_changes(self, working_dir=None):
        """Analyze Git changes."""
        try:
            return self._run_cli_command(["reynard-git", "analyze-changes"], working_dir)
        except Exception as e:
            raise Exception(f"Change analysis failed: {e}")
    
    def generate_commit_message(self, working_dir=None):
        """Generate conventional commit message."""
        try:
            return self._run_cli_command(["reynard-git", "generate-commit"], working_dir)
        except Exception as e:
            raise Exception(f"Commit message generation failed: {e}")
    
    def update_changelog(self, change_type, description, working_dir=None):
        """Update CHANGELOG.md with new entry."""
        try:
            return self._run_cli_command(
                ["reynard-git", "update-changelog", change_type, description], 
                working_dir
            )
        except Exception as e:
            raise Exception(f"Changelog update failed: {e}")
    
    def bump_version(self, bump_type, working_dir=None):
        """Bump package version."""
        try:
            return self._run_cli_command(["reynard-git", "bump-version", bump_type], working_dir)
        except Exception as e:
            raise Exception(f"Version bump failed: {e}")
    
    def create_git_tag(self, tag, message, working_dir=None):
        """Create Git tag."""
        try:
            return self._run_cli_command(
                ["reynard-git", "create-tag", tag, message], 
                working_dir
            )
        except Exception as e:
            raise Exception(f"Git tag creation failed: {e}")
    
    def execute_workflow(self, options=None, working_dir=None):
        """Execute complete Git workflow."""
        try:
            command = ["reynard-git", "workflow"]
            
            if options:
                if options.get("dryRun"):
                    command.append("--dry-run")
                if options.get("autoConfirm"):
                    command.append("--auto-confirm")
                if options.get("cleanupJunk"):
                    command.append("--cleanup-junk")
                if options.get("createTag"):
                    command.append("--create-tag")
                if options.get("pushTag"):
                    command.append("--push-tag")
            
            return self._run_cli_command(command, working_dir)
        except Exception as e:
            raise Exception(f"Workflow execution failed: {e}")


class TestSimpleGitAutomationTools(unittest.TestCase):
    """Test cases for SimpleGitAutomationTools class."""

    def setUp(self):
        """Set up test fixtures."""
        self.tools = SimpleGitAutomationTools()
        self.temp_dir = tempfile.mkdtemp()

    def tearDown(self):
        """Clean up test fixtures."""
        # Clean up temp directory
        import shutil
        shutil.rmtree(self.temp_dir, ignore_errors=True)

    @patch('subprocess.run')
    def test_detect_junk_files_success(self, mock_run):
        """Test successful junk file detection."""
        # Mock successful CLI execution
        mock_result = Mock()
        mock_result.returncode = 0
        mock_result.stdout = json.dumps({
            "hasJunk": True,
            "totalFiles": 3,
            "categories": [
                {
                    "category": "python",
                    "files": ["__pycache__/module.pyc", "venv/lib/python3.9/"],
                    "count": 2
                }
            ]
        })
        mock_run.return_value = mock_result

        result = self.tools.detect_junk_files()

        # Verify the result
        self.assertTrue(result["hasJunk"])
        self.assertEqual(result["totalFiles"], 3)
        self.assertEqual(len(result["categories"]), 1)
        self.assertEqual(result["categories"][0]["category"], "python")

        # Verify CLI was called correctly
        mock_run.assert_called_once()
        call_args = mock_run.call_args
        self.assertEqual(call_args[0][0], ["reynard-git", "detect-junk"])

    @patch('subprocess.run')
    def test_detect_junk_files_failure(self, mock_run):
        """Test junk file detection failure."""
        # Mock CLI failure
        mock_result = Mock()
        mock_result.returncode = 1
        mock_result.stdout = json.dumps({"error": "No such file or directory"})
        mock_run.return_value = mock_result

        with self.assertRaises(Exception) as context:
            self.tools.detect_junk_files()

        self.assertIn("Junk detection failed", str(context.exception))

    @patch('subprocess.run')
    def test_analyze_changes_success(self, mock_run):
        """Test successful change analysis."""
        # Mock successful CLI execution
        mock_result = Mock()
        mock_result.returncode = 0
        mock_result.stdout = json.dumps({
            "totalFiles": 2,
            "totalAdditions": 15,
            "totalDeletions": 3,
            "categories": [
                {
                    "type": "feature",
                    "files": [
                        {"file": "src/components/Button.tsx", "status": "M", "additions": 10, "deletions": 2}
                    ],
                    "impact": "medium",
                    "description": "Feature changes"
                }
            ],
            "versionBumpType": "minor"
        })
        mock_run.return_value = mock_result

        result = self.tools.analyze_changes()

        # Verify the result
        self.assertEqual(result["totalFiles"], 2)
        self.assertEqual(result["totalAdditions"], 15)
        self.assertEqual(result["totalDeletions"], 3)
        self.assertEqual(result["versionBumpType"], "minor")
        self.assertEqual(len(result["categories"]), 1)
        self.assertEqual(result["categories"][0]["type"], "feature")

        # Verify CLI was called correctly
        mock_run.assert_called_once()
        call_args = mock_run.call_args
        self.assertEqual(call_args[0][0], ["reynard-git", "analyze-changes"])

    @patch('subprocess.run')
    def test_generate_commit_message_success(self, mock_run):
        """Test successful commit message generation."""
        # Mock successful CLI execution
        mock_result = Mock()
        mock_result.returncode = 0
        mock_result.stdout = json.dumps({
            "type": "feat",
            "scope": "components",
            "description": "add new Button component with enhanced styling",
            "fullMessage": "feat(components): add new Button component with enhanced styling",
            "body": "This commit adds a new Button component with enhanced styling capabilities.",
            "footer": "Closes #123"
        })
        mock_run.return_value = mock_result

        result = self.tools.generate_commit_message()

        # Verify the result
        self.assertEqual(result["type"], "feat")
        self.assertEqual(result["scope"], "components")
        self.assertIn("Button component", result["description"])
        self.assertIn("feat(components):", result["fullMessage"])

        # Verify CLI was called correctly
        mock_run.assert_called_once()
        call_args = mock_run.call_args
        self.assertEqual(call_args[0][0], ["reynard-git", "generate-commit"])

    @patch('subprocess.run')
    def test_update_changelog_success(self, mock_run):
        """Test successful changelog update."""
        # Mock successful CLI execution
        mock_result = Mock()
        mock_result.returncode = 0
        mock_result.stdout = json.dumps({
            "success": True,
            "message": "Changelog updated successfully",
            "unreleasedEntries": 2
        })
        mock_run.return_value = mock_result

        result = self.tools.update_changelog("feat", "add new feature")

        # Verify the result
        self.assertTrue(result["success"])
        self.assertEqual(result["message"], "Changelog updated successfully")
        self.assertEqual(result["unreleasedEntries"], 2)

        # Verify CLI was called correctly
        mock_run.assert_called_once()
        call_args = mock_run.call_args
        self.assertEqual(call_args[0][0], ["reynard-git", "update-changelog", "feat", "add new feature"])

    @patch('subprocess.run')
    def test_bump_version_success(self, mock_run):
        """Test successful version bump."""
        # Mock successful CLI execution
        mock_result = Mock()
        mock_result.returncode = 0
        mock_result.stdout = json.dumps({
            "success": True,
            "currentVersion": "1.2.3",
            "nextVersion": "1.3.0",
            "bumpType": "minor"
        })
        mock_run.return_value = mock_result

        result = self.tools.bump_version("minor")

        # Verify the result
        self.assertTrue(result["success"])
        self.assertEqual(result["currentVersion"], "1.2.3")
        self.assertEqual(result["nextVersion"], "1.3.0")
        self.assertEqual(result["bumpType"], "minor")

        # Verify CLI was called correctly
        mock_run.assert_called_once()
        call_args = mock_run.call_args
        self.assertEqual(call_args[0][0], ["reynard-git", "bump-version", "minor"])

    @patch('subprocess.run')
    def test_create_git_tag_success(self, mock_run):
        """Test successful Git tag creation."""
        # Mock successful CLI execution
        mock_result = Mock()
        mock_result.returncode = 0
        mock_result.stdout = json.dumps({
            "success": True,
            "tag": "v1.3.0",
            "message": "Release version 1.3.0"
        })
        mock_run.return_value = mock_result

        result = self.tools.create_git_tag("v1.3.0", "Release version 1.3.0")

        # Verify the result
        self.assertTrue(result["success"])
        self.assertEqual(result["tag"], "v1.3.0")
        self.assertEqual(result["message"], "Release version 1.3.0")

        # Verify CLI was called correctly
        mock_run.assert_called_once()
        call_args = mock_run.call_args
        self.assertEqual(call_args[0][0], ["reynard-git", "create-tag", "v1.3.0", "Release version 1.3.0"])

    @patch('subprocess.run')
    def test_execute_workflow_success(self, mock_run):
        """Test successful workflow execution."""
        # Mock successful CLI execution
        mock_result = Mock()
        mock_result.returncode = 0
        mock_result.stdout = json.dumps({
            "success": True,
            "steps": {
                "junkDetection": {"completed": True},
                "changeAnalysis": {"completed": True},
                "commitMessage": {"completed": True},
                "versionBump": {"completed": True},
                "changelogUpdate": {"completed": True},
                "gitOperations": {"completed": True}
            },
            "actionsPerformed": [
                "junk_detection",
                "change_analysis",
                "commit_message_generation",
                "version_bump",
                "changelog_update",
                "git_operations"
            ]
        })
        mock_run.return_value = mock_result

        result = self.tools.execute_workflow()

        # Verify the result
        self.assertTrue(result["success"])
        self.assertTrue(result["steps"]["junkDetection"]["completed"])
        self.assertTrue(result["steps"]["changeAnalysis"]["completed"])
        self.assertEqual(len(result["actionsPerformed"]), 6)

        # Verify CLI was called correctly
        mock_run.assert_called_once()
        call_args = mock_run.call_args
        self.assertEqual(call_args[0][0], ["reynard-git", "workflow"])

    @patch('subprocess.run')
    def test_execute_workflow_with_options(self, mock_run):
        """Test workflow execution with custom options."""
        # Mock successful CLI execution
        mock_result = Mock()
        mock_result.returncode = 0
        mock_result.stdout = json.dumps({
            "success": True,
            "dryRun": True,
            "autoConfirm": False
        })
        mock_run.return_value = mock_result

        options = {
            "dryRun": True,
            "autoConfirm": False,
            "cleanupJunk": True
        }

        result = self.tools.execute_workflow(options)

        # Verify the result
        self.assertTrue(result["success"])
        self.assertTrue(result["dryRun"])
        self.assertFalse(result["autoConfirm"])

        # Verify CLI was called with options
        mock_run.assert_called_once()
        call_args = mock_run.call_args
        self.assertEqual(call_args[0][0], ["reynard-git", "workflow", "--dry-run", "--cleanup-junk"])

    def test_validate_working_directory(self):
        """Test working directory validation."""
        # Test with valid directory
        with patch('os.path.exists', return_value=True):
            with patch('os.path.isdir', return_value=True):
                result = self.tools._validate_working_directory(self.temp_dir)
                self.assertTrue(result)

        # Test with invalid directory
        with patch('os.path.exists', return_value=False):
            with self.assertRaises(ValueError) as context:
                self.tools._validate_working_directory("/nonexistent/path")
            self.assertIn("Working directory does not exist", str(context.exception))

    def test_parse_cli_output_success(self):
        """Test successful CLI output parsing."""
        test_output = json.dumps({"success": True, "message": "Test successful"})
        
        result = self.tools._parse_cli_output(test_output, 0)
        
        self.assertTrue(result["success"])
        self.assertEqual(result["message"], "Test successful")

    def test_parse_cli_output_failure(self):
        """Test CLI output parsing with failure."""
        test_output = json.dumps({"success": False, "error": "Test failed"})
        
        with self.assertRaises(Exception) as context:
            self.tools._parse_cli_output(test_output, 1)
        
        self.assertIn("Test failed", str(context.exception))

    def test_parse_cli_output_invalid_json(self):
        """Test CLI output parsing with invalid JSON."""
        test_output = "Invalid JSON output"
        
        with self.assertRaises(Exception) as context:
            self.tools._parse_cli_output(test_output, 0)
        
        self.assertIn("Failed to parse CLI output", str(context.exception))


if __name__ == '__main__':
    unittest.main()

